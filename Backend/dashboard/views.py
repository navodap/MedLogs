from django.http import JsonResponse
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from datetime import date

from .models import ForensicCase, Report, CourtCase, TaskNotification


def dashboard_summary(request):
    total_cases = ForensicCase.objects.count()
    clinical_cases = ForensicCase.objects.filter(case_type='Clinical').count()
    autopsy_cases = ForensicCase.objects.filter(case_type='Autopsy').count()
    pending_reports = Report.objects.exclude(current_status='Submitted').count()
    submitted_reports = Report.objects.filter(current_status='Submitted').count()

    today = date.today()
    upcoming_court_dates = CourtCase.objects.filter(trial_date__gte=today).count()

    monthly_qs = (
        ForensicCase.objects
        .annotate(month=TruncMonth('registered_datetime'))
        .values('month')
        .annotate(
            clinical=Count('case_id', filter=Q(case_type='Clinical')),
            postmortem=Count('case_id', filter=Q(case_type='Autopsy')),
        )
        .order_by('month')
    )
    monthly_stats = [
        {'month': m['month'].strftime('%b %y'), 'clinical': m['clinical'], 'postmortem': m['postmortem']}
        for m in monthly_qs
    ]

    upcoming = CourtCase.objects.filter(trial_date__gte=today).select_related('case', 'court').order_by('trial_date')[:5]
    upcoming_court_dates_list = [
        {
            'caseId': c.case.case_id,
            'court': c.court.court_name,
            'date': c.trial_date.strftime('%d %b %Y'),
            'status': c.case_status_in_court or 'Scheduled',
        }
        for c in upcoming
    ]

    pending_tasks = (
        TaskNotification.objects.filter(status='Open')
        .select_related('case', 'assigned_to')
        .order_by('due_date')[:5]
    )
    pending_reports_list = [
        {
            'caseId': t.case.case_id,
            'reportType': t.task_type,
            'assignedTo': t.assigned_to.full_name,
            'dueDate': t.due_date.strftime('%d %b %Y') if t.due_date else '-',
            'daysLeft': (t.due_date - today).days if t.due_date else None,
        }
        for t in pending_tasks
    ]

    recent = ForensicCase.objects.select_related('patient').order_by('-registered_datetime')[:5]
    recent_cases_list = [
        {
            'caseId': c.case_id,
            'name': f"{c.patient.full_name}, {c.patient.age or '-'} Y",
            'type': c.case_type,
            'date': c.registered_datetime.strftime('%d %b %Y'),
            'status': c.case_status,
        }
        for c in recent
    ]

    return JsonResponse({
        'stats': {
            'totalCases': total_cases,
            'clinicalCases': clinical_cases,
            'postmortemCases': autopsy_cases,
            'pendingReports': pending_reports,
            'submittedReports': submitted_reports,
            'upcomingCourtDates': upcoming_court_dates,
            'totalCasesDelta': 0, 'clinicalCasesDelta': 0, 'postmortemCasesDelta': 0,
            'pendingReportsDelta': 0, 'submittedReportsDelta': 0, 'upcomingCourtDatesDelta': 0,
        },
        'monthlyStats': monthly_stats,
        'upcomingCourtDates': upcoming_court_dates_list,
        'pendingReports': pending_reports_list,
        'recentCases': recent_cases_list,
        'recentActivities': [],
    })