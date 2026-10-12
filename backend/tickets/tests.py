import json
from django.test import TestCase
from .models import Ticket

class TicketApiTests(TestCase):
    def test_create_and_list_with_status_and_pagination(self):
        response = self.client.post("/tickets", data=json.dumps({"title": "Printer broken", "priority": "high"}), content_type="application/json")
        self.assertEqual(response.status_code, 201)
        ticket_id = response.json()["id"]
        self.assertEqual(response.json()["status"], "open")
        Ticket.objects.create(title="Old", status="closed")
        response = self.client.get("/tickets?status=open&priority=high&page=1&limit=1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["total"], 1)
        self.assertEqual(response.json()["results"][0]["id"], ticket_id)

    def test_list_returns_server_paginated_pages(self):
        for number in range(12):
            Ticket.objects.create(title=f"Issue {number}")
        first_page = self.client.get("/tickets?page=1&limit=10")
        second_page = self.client.get("/tickets?page=2&limit=10")
        self.assertEqual(first_page.status_code, 200)
        self.assertEqual(second_page.status_code, 200)
        self.assertEqual(first_page.json()["total"], 12)
        self.assertEqual(first_page.json()["pages"], 2)
        self.assertEqual(len(first_page.json()["results"]), 10)
        self.assertEqual(len(second_page.json()["results"]), 2)

    def test_patch_updates_status_and_priority(self):
        ticket = Ticket.objects.create(title="Cannot log in")
        response = self.client.patch(f"/tickets/{ticket.id}", data=json.dumps({"status": "in_progress", "priority": "high"}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "in_progress")
        self.assertEqual(response.json()["priority"], "high")

    def test_stats_include_zero_count_statuses(self):
        Ticket.objects.create(title="Done", status="closed")
        response = self.client.get("/tickets/stats")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"open": 0, "in_progress": 0, "closed": 1})

    def test_browser_preflight_allows_frontend_origin(self):
        response = self.client.options(
            "/tickets",
            HTTP_ORIGIN="http://localhost:5173",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type",
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Access-Control-Allow-Origin"], "http://localhost:5173")
        self.assertIn("POST", response["Access-Control-Allow-Methods"])

    def test_rejects_invalid_status(self):
        response = self.client.post("/tickets", data=json.dumps({"title": "Issue", "status": "waiting"}), content_type="application/json")
        self.assertEqual(response.status_code, 400)
