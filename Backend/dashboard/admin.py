from django.contrib import admin
from .models import UserAccount, Doctor, Court, PatientVictim, ForensicCase, Report, CourtCase, TaskNotification

admin.site.register(UserAccount)
admin.site.register(Doctor)
admin.site.register(Court)
admin.site.register(PatientVictim)
admin.site.register(ForensicCase)
admin.site.register(Report)
admin.site.register(CourtCase)
admin.site.register(TaskNotification)