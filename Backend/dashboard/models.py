from django.db import models

# managed = False on every model below means Django will NEVER try to
# create, alter, or drop these tables. They already exist (built by your
# teammate's SQL scripts) — Django is only used here to read/write rows.


class UserAccount(models.Model):
    user_id = models.IntegerField(primary_key=True)
    username = models.CharField(max_length=100)
    full_name = models.CharField(max_length=200)
    email = models.CharField(max_length=255, null=True)

    class Meta:
        managed = False
        db_table = 'user_account'

    def __str__(self):
        return self.full_name


class Doctor(models.Model):
    doctor_id = models.IntegerField(primary_key=True)
    full_name = models.CharField(max_length=200)
    designation = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'doctor'

    def __str__(self):
        return self.full_name


class Court(models.Model):
    court_id = models.IntegerField(primary_key=True)
    court_name = models.CharField(max_length=200)
    district = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'court'

    def __str__(self):
        return self.court_name


class PatientVictim(models.Model):
    patient_id = models.CharField(primary_key=True, max_length=30)
    full_name = models.CharField(max_length=200)
    age = models.SmallIntegerField(null=True)
    gender = models.CharField(max_length=30, null=True)
    person_status = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'patient_victim'

    def __str__(self):
        return self.full_name


class ForensicCase(models.Model):
    case_id = models.CharField(primary_key=True, max_length=30)
    case_type = models.CharField(max_length=50)          # 'Clinical' or 'Autopsy'
    case_category = models.CharField(max_length=100, null=True)
    case_status = models.CharField(max_length=100)
    registered_datetime = models.DateTimeField()
    patient = models.ForeignKey(PatientVictim, on_delete=models.DO_NOTHING, db_column='patient_id')
    registered_by = models.ForeignKey(UserAccount, on_delete=models.DO_NOTHING, db_column='registered_by_user_id')

    class Meta:
        managed = False
        db_table = 'forensic_case'

    def __str__(self):
        return self.case_id


class Report(models.Model):
    report_id = models.IntegerField(primary_key=True)
    case = models.ForeignKey(ForensicCase, on_delete=models.DO_NOTHING, db_column='case_id')
    report_type = models.CharField(max_length=100)
    current_status = models.CharField(max_length=100)     # e.g. Draft / Approved / Submitted
    created_by = models.ForeignKey(UserAccount, on_delete=models.DO_NOTHING, db_column='created_by_user_id')
    generated_date = models.DateField(null=True)
    submitted_date = models.DateField(null=True)

    class Meta:
        managed = False
        db_table = 'report'


class CourtCase(models.Model):
    court_case_id = models.IntegerField(primary_key=True)
    case = models.ForeignKey(ForensicCase, on_delete=models.DO_NOTHING, db_column='case_id')
    court = models.ForeignKey(Court, on_delete=models.DO_NOTHING, db_column='court_id')
    court_reference_no = models.CharField(max_length=150)
    trial_date = models.DateField(null=True)
    case_status_in_court = models.CharField(max_length=100, null=True)

    class Meta:
        managed = False
        db_table = 'court_case'


class TaskNotification(models.Model):
    task_id = models.IntegerField(primary_key=True)
    case = models.ForeignKey(ForensicCase, on_delete=models.DO_NOTHING, db_column='case_id')
    assigned_to = models.ForeignKey(UserAccount, on_delete=models.DO_NOTHING, db_column='assigned_to_user_id')
    task_type = models.CharField(max_length=150)
    due_date = models.DateField(null=True)
    status = models.CharField(max_length=100)    # e.g. Open / Completed
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'task_notification'