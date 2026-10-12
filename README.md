# Ticket Tracker

A small support ticket app with a Django JSON API, PostgreSQL storage, and a React + TypeScript interface.

## Setup and run

Install Python 3, Node.js/npm, and PostgreSQL 16+ (with `initdb`, `pg_ctl`, `pg_isready`, and `psql` on your `PATH`), then run:

```sh
./dev.sh
```

The script initializes an app-local PostgreSQL data directory at `.local/postgres`, creates the `tickets` role and database, installs backend and frontend dependencies, applies migrations, starts both development servers, and checks that the API and UI respond. It keeps the database between runs. Press `Ctrl+C` to stop both servers and the PostgreSQL instance started by the script.

Open [http://localhost:5173](http://localhost:5173). The API is available at `http://localhost:8000`. The local database listens on port `5433` by default so it does not conflict with an existing PostgreSQL installation. Set `POSTGRES_PORT` to use a different port.

Run API tests:

```sh
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
SQLITE_FOR_TESTS=1 python manage.py test
```

## API

- `POST /tickets` accepts `title` and optional `description`, `status`, and `priority`.
- `GET /tickets?status=open&priority=high&page=1&limit=10` returns `results`, `page`, `limit`, `total`, and `pages`.
- `PATCH /tickets/:id` accepts `status` and/or `priority`.
- `GET /tickets/stats` returns counts for each status.

Statuses are `open`, `in_progress`, and `closed`. Priorities are `low`, `medium`, and `high`.

## Decisions & Tradeoffs

- I used Django's built-in views and ORM to keep the API small without adding a REST framework dependency. 
- The UI is a single page and requests 10 tickets at a time, which keeps the interface focused while supporting server-side pagination. 
- PostgreSQL is used for the app database, while the API tests use in-memory SQLite so they can run without a separate database service. 
- The local setup script automates dependency installation and database initialization for a quick start. 
- With more time: 
    - I would expand API test coverage, 
    - add frontend tests
    - strengthen input validation and error handling to make failures clearer and changes safer. 
    - Before using this with real support teams, I would add authentication and role-based permissions because tickets may contain sensitive customer information.
