#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

DATA="$PWD/.local/postgres"
PORT="${POSTGRES_PORT:-5433}"
DB="${POSTGRES_DB:-tickets}"
DB_USER="${POSTGRES_USER:-tickets}"
PASSWORD="${POSTGRES_PASSWORD:-tickets}"
backend_pid=""
frontend_pid=""
started_db=0

cleanup() {
  # Remove traps first to avoid running cleanup recursively.
  trap - EXIT INT TERM
  # Stop and reap each server process, ignoring already-stopped processes.
  for pid in "$frontend_pid" "$backend_pid"; do
    [[ -z "$pid" ]] || { kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; }
  done
  # Fast-stop this script's database; leave a database started elsewhere alone.
  if (( started_db )); then pg_ctl -D "$DATA" -m fast -w stop >/dev/null 2>&1 || true; fi
}
trap cleanup EXIT
trap 'exit 130' INT TERM

mkdir -p .local
if [[ ! -s "$DATA/PG_VERSION" ]]; then initdb -D "$DATA" -U postgres --auth-local=trust --auth-host=trust >/dev/null; fi
if ! pg_ctl -D "$DATA" status >/dev/null 2>&1; then
  pg_ctl -D "$DATA" -l .local/postgres.log -o "-p $PORT -h 127.0.0.1 -c shared_memory_type=mmap" -w start >/dev/null
  started_db=1
fi

psql_local() { psql -h 127.0.0.1 -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"; }
if psql_local -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  psql_local -c "ALTER ROLE \"$DB_USER\" LOGIN PASSWORD '$PASSWORD'" >/dev/null
else
  psql_local -c "CREATE ROLE \"$DB_USER\" LOGIN PASSWORD '$PASSWORD'" >/dev/null
fi
psql_local -tAc "SELECT 1 FROM pg_database WHERE datname='$DB'" | grep -q 1 || createdb -h 127.0.0.1 -p "$PORT" -U postgres -O "$DB_USER" "$DB"

[[ -x backend/.venv/bin/python ]] || python3 -m venv backend/.venv
backend/.venv/bin/pip install -q -r backend/requirements.txt
[[ -d frontend/node_modules ]] || (cd frontend && npm ci)
export POSTGRES_DB="$DB" POSTGRES_USER="$DB_USER" POSTGRES_PASSWORD="$PASSWORD" POSTGRES_HOST=127.0.0.1 POSTGRES_PORT="$PORT"
(cd backend && .venv/bin/python manage.py migrate --noinput)
(cd backend && .venv/bin/python manage.py runserver 127.0.0.1:8000) & backend_pid=$!
(cd frontend && npm run dev -- --host 127.0.0.1) & frontend_pid=$!

for _ in {1..60}; do
  if curl -fsS http://127.0.0.1:8000/tickets >/dev/null && curl -fsS http://127.0.0.1:5173/ >/dev/null; then break; fi
  # Fail early if either server process exited before becoming ready.
  kill -0 "$backend_pid" 2>/dev/null && kill -0 "$frontend_pid" 2>/dev/null || { echo 'A server stopped during startup.' >&2; exit 1; }
  sleep 1
done
curl -fsS http://127.0.0.1:8000/tickets >/dev/null && curl -fsS http://127.0.0.1:5173/ >/dev/null || { echo 'A server failed its startup check.' >&2; exit 1; }
echo 'Frontend: http://localhost:5173  |  API: http://localhost:8000  |  Ctrl+C to stop'
while kill -0 "$backend_pid" 2>/dev/null && kill -0 "$frontend_pid" 2>/dev/null; do sleep 1; done
echo 'A server stopped.' >&2
exit 1
