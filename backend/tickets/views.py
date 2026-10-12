import json
from django.core.paginator import EmptyPage, Paginator
from django.db.models import Count
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Ticket


def serialize(ticket):
    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "status": ticket.status,
        "priority": ticket.priority,
        "created_at": ticket.created_at.isoformat(),
    }


def body_json(request):
    try:
        return json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


@csrf_exempt
def ticket_collection(request):
    if request.method == "POST":
        data = body_json(request)
        if not isinstance(data, dict):
            return JsonResponse({"error": "Invalid JSON body"}, status=400)
        title = data.get("title")
        if not isinstance(title, str) or not title.strip() or len(title) > 200:
            return JsonResponse({"error": "title is required and must be at most 200 characters"}, status=400)
        status = data.get("status", Ticket.Status.OPEN)
        priority = data.get("priority", Ticket.Priority.MEDIUM)
        if status not in Ticket.Status.values or priority not in Ticket.Priority.values:
            return JsonResponse({"error": "Invalid status or priority"}, status=400)
        description = data.get("description", "")
        if not isinstance(description, str):
            return JsonResponse({"error": "description must be a string"}, status=400)
        ticket = Ticket.objects.create(title=title.strip(), description=description, status=status, priority=priority)
        return JsonResponse(serialize(ticket), status=201)

    if request.method == "GET":
        status = request.GET.get("status")
        priority = request.GET.get("priority")
        if status and status not in Ticket.Status.values:
            return JsonResponse({"error": "Invalid status"}, status=400)
        if priority and priority not in Ticket.Priority.values:
            return JsonResponse({"error": "Invalid priority"}, status=400)
        try:
            page = int(request.GET.get("page", "1"))
            limit = int(request.GET.get("limit", "10"))
            if page < 1 or limit < 1 or limit > 100:
                raise ValueError
        except ValueError:
            return JsonResponse({"error": "page must be positive and limit must be between 1 and 100"}, status=400)
        tickets = Ticket.objects.all()
        if status:
            tickets = tickets.filter(status=status)
        if priority:
            tickets = tickets.filter(priority=priority)
        paginator = Paginator(tickets, limit)
        try:
            result_page = paginator.page(page)
        except EmptyPage:
            result_page = []
        return JsonResponse({
            "results": [serialize(ticket) for ticket in result_page],
            "page": page,
            "limit": limit,
            "total": paginator.count,
            "pages": paginator.num_pages,
        })
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def ticket_detail(request, ticket_id):
    if request.method != "PATCH":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    data = body_json(request)
    if not isinstance(data, dict) or not data or set(data) - {"status", "priority"}:
        return JsonResponse({"error": "Provide status and/or priority"}, status=400)
    if "status" in data and data["status"] not in Ticket.Status.values:
        return JsonResponse({"error": "Invalid status"}, status=400)
    if "priority" in data and data["priority"] not in Ticket.Priority.values:
        return JsonResponse({"error": "Invalid priority"}, status=400)
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
    except Ticket.DoesNotExist:
        return JsonResponse({"error": "Ticket not found"}, status=404)
    for field in data:
        setattr(ticket, field, data[field])
    ticket.save(update_fields=[*data.keys()])
    return JsonResponse(serialize(ticket))


def ticket_stats(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    counts = {status: 0 for status in Ticket.Status.values}
    counts.update({row["status"]: row["count"] for row in Ticket.objects.values("status").annotate(count=Count("id"))})
    return JsonResponse(counts)
