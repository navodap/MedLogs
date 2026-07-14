const STORAGE_KEY = "fmdis_cases_v2";
const PATIENT_STORAGE_KEY = "fmdis_patients_v1";
const EXAM_STORAGE_KEY = "fmdis_examinations_v1";
const EVIDENCE_STORAGE_KEY = "fmdis_evidence_samples_v1";
const REPORT_STORAGE_KEY = "fmdis_reports_v1";

const sampleCases = [];

const clinicalCategories = ["Accident", "Assault", "Sexual Assault", "Toxicology", "Detainee Examination", "Age Estimation", "DNA Sampling"];
const autopsyCategories = ["Natural Death", "Accidental Death", "Suicidal Death", "Homicidal Death", "Undetermined Death"];

const ALWAYS_LOCKED = [
  "caseId",
  "caseTypeDisplay",
  "registeredDateTime",
  "caseStatus",
  "patientId",
  "personStatus",
  "identificationStatus",
  "patientName",
  "patientNic",
  "patientDob",
  "patientAge",
  "patientGender",
  "patientContact",
  "patientBht",
  "patientAddress",
  "minor",
  "caseConsentStatus",
  "caseConsentFormAvailability",
  "caseConsentGivenBy"
];

const ROLE_LOCKED_FIELDS = {
  "Administrative Clerk": [
    "confidentiality", "natureOfHarm", "hurtCategory",
    "supervisingConsultant", "expectedReportType",
    "reqXray", "reqCt", "reqBlood", "reqUrine",
    "reqSwabs", "reqDna", "reqPhotos", "chainOfCustodyRequired"
  ],
  "MOML": [
    "supervisingConsultant", "primaryDoctor"
  ],
  "AJMO": [
    "supervisingConsultant", "primaryDoctor"
  ],
  "Consultant JMO": [],
  "System Administrator": []
};

const dom = {
  tabButtons: document.querySelectorAll(".tab-btn"),
  registrationPanel: document.getElementById("registrationPanel"),
  detailsPanel: document.getElementById("detailsPanel"),
  caseSwitchButtons: document.querySelectorAll(".case-switch-btn"),
  caseForm: document.getElementById("caseForm"),
  caseType: document.getElementById("caseType"),
  caseId: document.getElementById("caseId"),
  registeredDateTime: document.getElementById("registeredDateTime"),
  assignedDate: document.getElementById("assignedDate"),
  caseCategory: document.getElementById("caseCategory"),
  caseSections: document.querySelectorAll(".case-section"),
  clearFormBtn: document.getElementById("clearFormBtn"),
  recentBody: document.getElementById("recentBody"),
  caseTableBody: document.getElementById("caseTableBody"),
  emptyMessage: document.getElementById("emptyMessage"),
  caseSearch: document.getElementById("caseSearch"),
  statusFilter: document.getElementById("statusFilter"),
  viewRecentBtn: document.getElementById("viewRecentBtn"),
  menuBtn: document.querySelector(".menu-btn"),
  sidebar: document.querySelector(".sidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  dateDisplay: document.getElementById("currentDateDisplay"),
  dayDisplay: document.getElementById("currentDayDisplay"),
  formHeader: document.getElementById("registrationFormHeader"),
  submitBtn: document.getElementById("btnSubmitForm"),
  btnEditCaseDetails: document.getElementById("btnEditCaseDetails"),
  totalCasesCount: document.getElementById("totalCasesCount"),
  clinicalCasesCount: document.getElementById("clinicalCasesCount"),
  autopsyCasesCount: document.getElementById("autopsyCasesCount"),
  totalCasesNote: document.getElementById("totalCasesNote"),
  clinicalCasesNote: document.getElementById("clinicalCasesNote"),
  autopsyCasesNote: document.getElementById("autopsyCasesNote")
};

let records = loadRecords();
let currentRegistrationType = "clinical";
let currentDetailsType = "clinical";
let selectedCaseId = records[0]?.id || null;
let isEditMode = false;
let expectedReportsDraft = [];
let confidentialityFloor = "Normal";

function loadRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleCases];
  } catch (error) {
    console.warn("Saved records could not be read. Sample records were loaded.", error);
    return [...sampleCases];
  }
}

function renderStats() {
  const totalCases = records.length;
  const clinicalCases = records.filter(record => record.type === "clinical").length;
  const autopsyCases = records.filter(record => record.type === "autopsy").length;

  if (dom.totalCasesCount) dom.totalCasesCount.textContent = totalCases;
  if (dom.clinicalCasesCount) dom.clinicalCasesCount.textContent = clinicalCases;
  if (dom.autopsyCasesCount) dom.autopsyCasesCount.textContent = autopsyCases;

  if (dom.totalCasesNote) {
    dom.totalCasesNote.textContent = totalCases === 0
      ? "No cases registered yet"
      : `${totalCases} case${totalCases === 1 ? "" : "s"} registered`;
  }

  if (dom.clinicalCasesNote) {
    dom.clinicalCasesNote.textContent = clinicalCases === 0
      ? "No clinical cases yet"
      : `${clinicalCases} clinical case${clinicalCases === 1 ? "" : "s"}`;
  }

  if (dom.autopsyCasesNote) {
    dom.autopsyCasesNote.textContent = autopsyCases === 0
      ? "No autopsy cases yet"
      : `${autopsyCases} autopsy case${autopsyCases === 1 ? "" : "s"}`;
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function pad(number, size = 6) {
  return String(number).padStart(size, "0");
}

function currentYear() {
  return new Date().getFullYear();
}

function generateCaseId(type) {
  const prefix = type === "clinical" ? "CL" : "PM";
  const year = currentYear();
  const sameSeries = records.filter(record => record.id.startsWith(`${prefix}-${year}-`));
  const next = sameSeries.length
    ? Math.max(...sameSeries.map(record => Number(record.id.split("-").pop()) || 0)) + 1
    : type === "clinical" ? 123 : 45;
  return `${prefix}-${year}-${pad(next)}`;
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function dateValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function value(id) {
  const element = document.getElementById(id);
  if (!element) return "";
  if (element.type === "checkbox") return element.checked;
  return element.value.trim ? element.value.trim() : element.value;
}
function setValue(id, input) {
  const element = document.getElementById(id);
  if (!element) return;

  if (element.type === "checkbox") {
    element.checked = Boolean(input);
  } else {
    element.value = input ?? "";
  }
}

function loadStorageArray(key) {
  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    patientId: params.get("patientId"),
    caseId: params.get("caseId"),
    type: params.get("type")
  };
}

function findPatient(patientId) {
  const patients = loadStorageArray(PATIENT_STORAGE_KEY);
  return patients.find(patient => patient.id === patientId) || null;
}

function confidentialityRank(level) {
  const ranks = {
    "Normal": 1,
    "Restricted": 2,
    "Highly Restricted": 3
  };

  return ranks[level] || 1;
}

function enforceConfidentialityFloor() {
  const current = value("confidentiality");

  if (confidentialityRank(current) < confidentialityRank(confidentialityFloor)) {
    alert(`Confidentiality cannot be lowered below ${confidentialityFloor} for this case.`);
    setValue("confidentiality", confidentialityFloor);
  }
}

function applySensitivityRules() {
  const minor = value("minor") === "Yes";
  const sexualAssault = value("sexualAssault") === "Yes";
  const category = value("caseCategory");

  if (minor && confidentialityRank(value("confidentiality")) < confidentialityRank("Restricted")) {
    setValue("confidentiality", "Restricted");
    confidentialityFloor = "Restricted";
  }

  if (sexualAssault || category === "Sexual Assault") {
    setValue("confidentiality", "Highly Restricted");
    confidentialityFloor = "Highly Restricted";
    setValue("casePriority", "Sensitive Case");
  }
}

function patientMinorValue(patient) {
  const age = Number(patient?.age);

  if (patient?.isMinor === true) return "Yes";
  if (!Number.isNaN(age) && age < 18) return "Yes";

  return "No";
}
function patientConsentAvailability(patient) {
  const documents = patient?.documents || [];

  const consentDoc = documents.find(doc =>
    doc.label === "Consent Form"
  );

  if (consentDoc?.fileName) {
    return `Available - ${consentDoc.fileName}`;
  }

  if (patient?.living?.consentFormNo) {
    return `Recorded - ${patient.living.consentFormNo}`;
  }

  if (patient?.personStatus === "deceased") {
    return "Not applicable";
  }

  return "Not uploaded";
}
function applyPatientToCaseForm(patient) {
  if (!patient) return;

  setValue("patientId", patient.id);
  setValue("personStatus", patient.personStatus === "deceased" ? "Deceased Person" : "Living Victim");
  setValue("identificationStatus", patient.identificationStatus || "Identified");
  setValue("patientName", patient.fullName || "");
  setValue("patientNic", patient.nicPassportNo || "");
  setValue("patientDob", patient.dateOfBirth || "");
  setValue("patientAge", patient.age || "");
  setValue("patientGender", patient.gender || "Unknown");
  setValue("patientContact", patient.contactNo || patient.nextOfKin?.contactNo || "");
  setValue("patientBht", patient.bhtNo || patient.hospitalNo || "");
  setValue("patientAddress", patient.permanentAddress || "");
  setValue("caseConsentStatus", patient.living?.consentStatus || "Not applicable");
  setValue("caseConsentFormAvailability", patientConsentAvailability(patient));
  setValue("caseConsentGivenBy", patient.living?.consentGivenBy || "Not applicable");
  const minorValue = patientMinorValue(patient);
  setValue("minor", minorValue);

  confidentialityFloor = patient.confidentiality || (minorValue === "Yes" ? "Restricted" : "Normal");
  setValue("confidentiality", confidentialityFloor);

  if (minorValue === "Yes") {
    setValue("casePriority", "Sensitive Case");
  }

  applySensitivityRules();
  applyRolePermissions();
}

function getUploadedFileInfo(inputId, label, requiredForType = "all") {
  const input = document.getElementById(inputId);
  const file = input?.files?.[0];

  if (!file) return null;

  return {
    label,
    fileName: file.name,
    fileType: file.type || "Unknown",
    status: "Uploaded",
    requiredForType,
    uploadedAt: localDateTimeValue()
  };
}

function buildCaseDocuments(type) {
  const docs = [];

  if (type === "clinical") {
   [
  ["mlefDocumentUpload", "MLEF Document"],
  ["clinicalPoliceRequestUpload", "Police Request / Letter"],
  ["hospitalReferralUpload", "Hospital Referral Note"],
  ["additionalClinicalCaseUpload", "Additional Clinical Case Document"]
].forEach(([id, label]) => {
  const doc = getUploadedFileInfo(id, label, "clinical");
  if (doc) docs.push(doc);
});
  }

  if (type === "autopsy") {
    [
      ["inquestOrderUpload", "Inquest Order"],
      ["courtOrderUpload", "Court Order"],
      ["deathReportUpload", "Death Report"],
      ["autopsyPoliceRequestUpload", "Police Request"],
      ["bodyReceivingCaseUpload", "Body Receiving Document"],
      ["mortuaryDocumentUpload", "Mortuary / Body Tag Document"]
    ].forEach(([id, label]) => {
      const doc = getUploadedFileInfo(id, label, "autopsy");
      if (doc) docs.push(doc);
    });
  }

  const otherDoc = getUploadedFileInfo(
    "otherCaseDocumentUpload",
    value("otherCaseDocumentType") || "Other Case Document",
    "all"
  );

  if (otherDoc) docs.push(otherDoc);

  return docs;
}
function defaultExpectedReports(type) {
  if (type === "autopsy") {
    return [
      {
        reportType: "Postmortem Report",
        dueDate: "",
        priority: "Normal",
        status: "Expected",
        remarks: "Main postmortem report"
      },
      {
        reportType: "Cause of Death Form",
        dueDate: "",
        priority: "Normal",
        status: "Expected",
        remarks: "COD after cause of death is finalized"
      }
    ];
  }

  return [
    {
      reportType: "Medico-Legal Report",
      dueDate: "",
      priority: "Normal",
      status: "Expected",
      remarks: "Main clinical medico-legal report"
    }
  ];
}

function renderExpectedReportsTable() {
  const body = document.getElementById("expectedReportsTableBody");
  const empty = document.getElementById("expectedReportsEmpty");

  if (!body) return;

  body.innerHTML = expectedReportsDraft.map((report, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${display(report.reportType)}</strong></td>
      <td>${display(report.dueDate)}</td>
      <td>${display(report.priority)}</td>
      <td><span class="badge warn">${display(report.status)}</span></td>
      <td>
        <button type="button" class="table-action" data-remove-expected-report="${index}">
          Remove
        </button>
      </td>
    </tr>
  `).join("");

  if (empty) {
    empty.hidden = expectedReportsDraft.length !== 0;
  }
}

function addExpectedReportFromInputs() {
  const report = {
    reportType: value("expectedReportSelect"),
    dueDate: value("expectedReportDueDate"),
    priority: value("expectedReportPriority"),
    status: "Expected",
    remarks: value("expectedReportRemarks")
  };

  if (!report.reportType) {
    alert("Please select a report type.");
    return;
  }

  expectedReportsDraft.push(report);

  setValue("expectedReportDueDate", "");
  setValue("expectedReportRemarks", "");

  renderExpectedReportsTable();
}

function resetExpectedReportsForType(type) {
  expectedReportsDraft = defaultExpectedReports(type);
  renderExpectedReportsTable();
}
function display(input) {
  return input && String(input).trim() ? input : "Not recorded";
}

function formatDate(input) {
  if (!input) return "Not recorded";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  const hasTime = String(input).includes("T");
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: hasTime ? "2-digit" : undefined,
    minute: hasTime ? "2-digit" : undefined
  });
}

function updateTopbarLiveDate() {
  const dateDisplay = document.getElementById("currentDateDisplay");
  const dayDisplay = document.getElementById("currentDayDisplay");

  if (!dateDisplay || !dayDisplay) return;

  const now = new Date();

  dateDisplay.textContent = now.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  });

  dayDisplay.textContent = now.toLocaleDateString("en-US", {
    weekday: "long"
  });
}

function statusClass(status) {
  if (status === "Draft") return "draft";
  if (["Closed", "Report Submitted"].includes(status)) return "success";
  if (["Awaiting Lab Results", "Report Drafting"].includes(status)) return "warn";
  if (["Highly Restricted"].includes(status)) return "danger";
  if (["Under Examination"].includes(status)) return "purple";
  return "";
}

function typeLabel(type) {
  return type === "clinical" ? "Clinical" : "Autopsy";
}

function applyRolePermissions() {
  const role = value("registeredBy");
  const lockedForRole = ROLE_LOCKED_FIELDS[role] || [];
  const allLocked = [...ALWAYS_LOCKED, ...lockedForRole];

  dom.caseForm.querySelectorAll("input, select, textarea").forEach(field => {
    if (!field.id || field.id === "registeredBy" || field.id === "caseType") return;

    const shouldLock = allLocked.includes(field.id);

    if (field.type === "checkbox" || field.tagName === "SELECT") {
      field.disabled = shouldLock;
    } else {
      field.readOnly = shouldLock;
    }

    const label = field.closest("label");
    if (label) label.classList.toggle("field-locked", shouldLock);
  });
}

function mainReference(record) {
  if (record.type === "clinical") return record.mlefNo || record.mlrSerial || record.policeRef || "Not recorded";
  return record.pmRegistryNo || record.inquestNo || record.courtOrderNo || "Not recorded";
}

function setCategoryOptions(type) {
  const options = type === "clinical" ? clinicalCategories : autopsyCategories;
  dom.caseCategory.innerHTML = `<option value="">Select category</option>${options.map(item => `<option>${item}</option>`).join("")}`;
}

function setInitialFormValues() {
  if (dom.caseId) dom.caseId.value = generateCaseId(currentRegistrationType);
  if (dom.registeredDateTime) dom.registeredDateTime.value = localDateTimeValue();
  if (dom.assignedDate) dom.assignedDate.value = dateValue();
  if (dom.caseType) dom.caseType.value = currentRegistrationType;
}

function activateTab(tab) {
  dom.tabButtons.forEach(button => button.classList.toggle("active", button.dataset.tab === tab));
  dom.registrationPanel.classList.toggle("active", tab === "registration");
  dom.detailsPanel.classList.toggle("active", tab === "details");
  if (tab === "details") renderCaseTable();
}

function activateCaseType(context, type) {
  document.querySelectorAll(`.case-switch-btn[data-context="${context}"]`).forEach(button => {
    button.classList.toggle("active", button.dataset.type === type);
  });

  if (context === "registration") {
    currentRegistrationType = type;
    dom.caseType.value = type;

    document.querySelectorAll(".clinical-section").forEach(section => {
      section.classList.toggle("active", type === "clinical");
    });

    document.querySelectorAll(".autopsy-section").forEach(section => {
      section.classList.toggle("active", type === "autopsy");
    });

    if (type === "autopsy") {
      if (dom.formHeader) dom.formHeader.textContent = "Register an Autopsy / Postmortem Case";
      if (dom.submitBtn) dom.submitBtn.textContent = "Register Autopsy Case";
      setValue("caseTypeDisplay", "Autopsy");
      setValue("caseId", generateCaseId("autopsy"));
      document.getElementById("personSearchLabel").firstChild.textContent = "Search Existing Deceased Person ";
      document.getElementById("personIdLabel").firstChild.textContent = "Deceased Person ID * ";
    } else {
      if (dom.formHeader) dom.formHeader.textContent = "Register a Medico-Legal Case";
      if (dom.submitBtn) dom.submitBtn.textContent = "Register Clinical Case";
      setValue("caseTypeDisplay", "Clinical");
      setValue("caseId", generateCaseId("clinical"));
      document.getElementById("personSearchLabel").firstChild.textContent = "Search Existing Patient ";
      document.getElementById("personIdLabel").firstChild.textContent = "Patient ID * ";
    }

    resetExpectedReportsForType(type);
    applySensitivityRules();
  }

  if (context === "details") {
    currentDetailsType = type;
    const firstMatch = records.find(record => record.type === type);
    selectedCaseId = firstMatch ? firstMatch.id : null;
    renderCaseTable();
    renderPreview();
    renderLinkedRecords();
  }
}

function getFormData() {
  const type = dom.caseType.value;
  const isClinical = type === "clinical";
  const caseDocuments = buildCaseDocuments(type);

  return {
    id: value("caseId") || generateCaseId(type),
    type,
    status: value("caseStatus") || "Registered",
    registeredDateTime: value("registeredDateTime"),
    registeredBy: value("registeredBy"),
    casePriority: value("casePriority"),

    patientId: value("patientId"),
    personStatus: value("personStatus"),
    patientName: value("patientName"),
    patientNic: value("patientNic"),
    patientDob: value("patientDob"),
    patientAge: value("patientAge"),
    patientGender: value("patientGender"),
    patientContact: value("patientContact"),
    patientBht: value("patientBht"),
    patientAddress: value("patientAddress"),
    identificationStatus: value("identificationStatus"),
    
    consentStatus: value("caseConsentStatus"),
    consentFormAvailability: value("caseConsentFormAvailability"),
    consentGivenBy: value("caseConsentGivenBy"),
    category: isClinical ? value("caseCategory") : value("autopsyCategory"),
    confidentiality: value("confidentiality") || "Normal",

    mlefNo: value("mlefNo"),
    mlefFormNo: value("mlefFormNo"),
    mlefDate: value("mlefDate"),
    mlefReceivedDateTime: value("mlefReceivedDateTime"),
    mlefIssuedBy: value("mlefIssuedBy"),
    clinicalReason: value("clinicalReason"),
    briefAllegation: value("briefAllegation"),
    clinicalSubCategory: value("clinicalSubCategory"),
    incidentDateTime: value("incidentDateTime"),
    placeOfIncident: value("placeOfIncident"),
    minor: value("minor") === "Yes",
    sexualAssault: value("sexualAssault") === "Yes",
    natureOfHarm: value("natureOfHarm"),
    natureOfWeapon: value("natureOfWeapon"),
    hurtCategory: value("hurtCategory"),
    patientHistory: value("patientHistory"),

    dateOfDeath: value("dateOfDeath"),
    dateTimeFound: value("dateTimeFound"),
    deathLocation: value("deathLocation"),
    placeOfDeath: value("placeOfDeath"),
    mannerOfDeath: value("mannerOfDeath"),
    orderType: value("orderType"),
    inquestNo: value("inquestNo"),
    courtOrderNo: value("courtOrderNo"),
    deathReportNo: value("deathReportNo"),
    orderDate: value("orderDate"),
    orderedBy: value("orderedBy"),
    dateOfInquest: value("dateOfInquest"),
    pmRegistryNo: value("pmRegistryNo"),
    bodyTagNumber: value("bodyTagNumber"),
    bodyReceivedDateTime: value("bodyReceivedDateTime"),
    bodyReceivedFrom: value("bodyReceivedFrom"),
    placeOfPM: value("placeOfPM"),
    bodyCondition: value("bodyCondition"),
    causeSummary: value("causeSummary"),

    policeStation: isClinical ? value("policeStation") : value("autopsyPoliceStation"),
    policeDivision: value("policeDivision"),
    policeRef: isClinical ? value("policeRef") : value("autopsyPoliceRef"),
    policeOfficer: isClinical ? value("policeOfficer") : value("autopsyPoliceOfficer"),
    policeOfficerRank: value("policeOfficerRank"),
    policeOfficerRegNo: value("policeOfficerRegNo"),
    policeOfficerContact: isClinical ? value("policeOfficerContact") : value("autopsyPoliceContact"),

    examDateTime: value("examDateTime"),
    examLocation: value("examLocation"),
    primaryDoctor: value("primaryDoctor"),
    supervisingConsultant: value("supervisingConsultant"),
    femaleDoctorRequired: value("femaleDoctorRequired"),
    assignedDate: value("assignedDate"),

    reqXray: value("reqXray"),
    reqCt: value("reqCt"),
    reqBlood: value("reqBlood"),
    reqUrine: value("reqUrine"),
    reqSwabs: value("reqSwabs"),
    reqDna: value("reqDna"),
    reqPhotos: value("reqPhotos"),
    chainOfCustodyRequired: value("chainOfCustodyRequired"),

    courtName: value("courtName"),
    courtRef: value("courtRef"),
    trialDate: value("trialDate"),

    expectedReports: expectedReportsDraft.length
      ? [...expectedReportsDraft]
      : defaultExpectedReports(type),

    caseDocuments,
    updatedAt: localDateTimeValue()
  };
}

    function validateRecord(record) {
  const missing = [];

  if (!record.patientId) missing.push(record.type === "clinical" ? "Patient ID" : "Deceased Person ID");
  if (!record.patientName) missing.push(record.type === "clinical" ? "Patient name" : "Deceased person name");
  if (!record.category) missing.push("Case category");
  if (!record.primaryDoctor) missing.push("Primary JMO / Medical Officer");

  if (record.type === "clinical") {
    if (!record.mlefNo) missing.push("MLEF No");
    if (!record.mlefDate) missing.push("MLEF Issue Date");
    if (!record.policeStation) missing.push("Police Station");
    if (!record.clinicalReason) missing.push("Reason for Referral");
  }

  if (record.type === "autopsy") {
    if (!record.orderType) missing.push("Order Type");
    if (!record.inquestNo) missing.push("Inquest No / Court Order No");
    if (!record.orderDate) missing.push("Order Date");
    if (!record.orderedBy) missing.push("Ordered By");
    if (!record.bodyTagNumber) missing.push("Body Tag No");
  }
if (!record.expectedReports || record.expectedReports.length === 0) {
  missing.push("At least one expected report");
}
  return missing;
}

function resetForm() {
  dom.caseForm.reset();
  isEditMode = false;
  confidentialityFloor = "Normal";
  expectedReportsDraft = [];

  activateCaseType("registration", currentRegistrationType);
  setInitialFormValues();
  resetExpectedReportsForType(currentRegistrationType);
  applyRolePermissions();
}

function saveCase(event) {
  event.preventDefault();
  const record = getFormData();
  const missing = validateRecord(record);
  if (missing.length) {
    const listElement = document.getElementById("validationMissingList");
    listElement.innerHTML = missing.map(item => `<li>${item}</li>`).join("");
    document.getElementById("validationModal").style.display = "grid";
    return;
  }

  records = [record, ...records.filter(item => item.id !== record.id)];
  selectedCaseId = record.id;
  saveRecords();
  renderPreview();
  renderLinkedRecords();
  renderRecentRecords();
  renderCaseTable();
  renderStats();
  const successMsg = document.getElementById("successModalMessage");
  if (successMsg) successMsg.textContent = `Case ${record.id} has been registered successfully.`;
  document.getElementById("successModal").style.display = "grid";
}

function previewFromForm() {
  const record = getFormData();
  selectedCaseId = record.id;
  renderPreview(record);
  renderLinkedRecords(record);
}

function renderPreview(optionalRecord) {
  if (!dom.casePreview) return;
  const record = optionalRecord || records.find(item => item.id === selectedCaseId) || records[0];
  if (!record) {
    dom.casePreview.innerHTML = `<div class="preview-empty"><div><span>▣</span><h4>No case selected</h4><p>Select or save a case to preview details.</p></div></div>`;
    return;
  }

  const isClinical = record.type === "clinical";
  const summary = isClinical
    ? record.patientHistory || `${display(record.clinicalReason)} case. ${display(record.natureOfHarm)}. Main reference: ${display(record.mlefNo)}.`
    : record.causeSummary || `${display(record.mannerOfDeath)} postmortem case. Main reference: ${display(record.pmRegistryNo)}.`;

  dom.casePreview.innerHTML = `
    <div class="preview-head">
      <div>
        <div class="case-avatar">${isClinical ? "☤" : "✎"}</div>
        <div class="preview-chip-row"><span class="badge ${isClinical ? "success" : "warn"}">${isClinical ? "CLINICAL" : "AUTOPSY"}</span></div>
      </div>
      <div>
        <small>Case ID</small>
        <h4>${record.id}</h4>
        <small>Patient / Victim</small>
        <strong>${display(record.patientName)}</strong>
        <div class="preview-chip-row">
          <span class="badge ${statusClass(record.status)}">${display(record.status)}</span>
          <span class="badge">${display(record.category)}</span>
          ${record.confidentiality !== "Normal" ? `<span class="badge danger">${record.confidentiality}</span>` : ""}
        </div>
      </div>
    </div>
    <div class="preview-info-grid">
      <div class="preview-info"><small>Patient ID</small><span>${display(record.patientId)}</span></div>
      <div class="preview-info"><small>Reference</small><span>${display(mainReference(record))}</span></div>
      <div class="preview-info"><small>JMO Office</small><span>${display(record.jmoOffice)}</span></div>
      <div class="preview-info"><small>Assigned Doctor</small><span>${display(record.primaryDoctor)}</span></div>
      <div class="preview-info"><small>Police Station</small><span>${display(record.policeStation)}</span></div>
      <div class="preview-info"><small>Court</small><span>${display(record.courtName)}</span></div>
      <div class="preview-info"><small>Registered On</small><span>${formatDate(record.registeredDateTime)}</span></div>
      <div class="preview-info"><small>${isClinical ? "Examined" : "Body Received"}</small><span>${formatDate(isClinical ? record.examDateTime : record.bodyReceivedDateTime)}</span></div>
    </div>
    <p class="preview-summary">${display(summary)}</p>
  `;
}

function renderLinkedRecords(optionalRecord) {
  if (!dom.linkedRecordsBody) return;
  const record = optionalRecord || records.find(item => item.id === selectedCaseId) || records[0];
  if (!record) {
    dom.linkedRecordsBody.innerHTML = "";
    return;
  }

  const rows = record.type === "clinical"
    ? [
        [record.mlefNo || "MLEF pending", "MLEF", record.mlefNo ? "Linked" : "Pending"],
        [record.mlrSerial || "MLR draft", "Report", record.status === "Closed" ? "Final" : "Draft"],
        [record.policeRef || "Police ref pending", "Police", record.policeRef ? "Linked" : "Pending"]
      ]
    : [
        [record.pmRegistryNo || "PM registry pending", "PM Registry", record.pmRegistryNo ? "Linked" : "Pending"],
        [record.inquestNo || record.courtOrderNo || "Order pending", "Inquest / Court", "Linked"],
        [record.deathReportNo || "COD pending", "COD / PMR", record.status === "Closed" ? "Final" : "Draft"]
      ];

  dom.linkedRecordsBody.innerHTML = rows.map(row => `
    <tr>
      <td><strong>${display(row[0])}</strong></td>
      <td>${row[1]}</td>
      <td><span class="badge ${row[2] === "Pending" ? "warn" : "success"}">${row[2]}</span></td>
    </tr>
  `).join("");
}

function filteredRecords() {
  const query = (dom.caseSearch.value || "").toLowerCase().trim();
  const status = dom.statusFilter.value;
  return records.filter(record => {
    if (record.type !== currentDetailsType) return false;
    if (status !== "all" && record.status !== status) return false;
    if (!query) return true;
    return [
      record.id,
      record.patientId,
      record.patientName,
      record.category,
      record.status,
      record.primaryDoctor,
      record.mlefNo,
      record.mlrSerial,
      record.pmRegistryNo,
      record.inquestNo,
      record.courtOrderNo,
      record.policeStation,
      record.policeRef,
      record.courtName,
      record.courtRef
    ].join(" ").toLowerCase().includes(query);
  });
}

function renderCaseTable() {
  const data = filteredRecords();
  dom.caseTableBody.innerHTML = data.map(record => `
    <tr>
      <td><strong>${record.id}</strong></td>
      <td>${display(record.patientName)}<br><small>${display(record.patientId)}</small></td>
      <td>${display(record.category)}</td>
      <td><span class="badge ${statusClass(record.status)}">${display(record.status)}</span></td>
      <td>${display(record.primaryDoctor)}</td>
      <td><button class="table-action" type="button" data-case-id="${record.id}">View</button></td>
    </tr>
  `).join("");
  dom.emptyMessage.hidden = data.length !== 0;
}

function populateFullCaseDetails(caseId) {
  const record = records.find(item => item.id === caseId);
  const container = document.getElementById("fullCaseDetailsContainer");

  if (!record) {
    if (container) container.style.display = "none";
    return;
  }

  selectedCaseId = record.id;
  container.style.display = "block";

  const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) element.textContent = display(text);
  };

  setText("detHeaderId", record.id);
  setText("detHeaderType", record.type === "clinical" ? "Clinical Case" : "Autopsy Case");
  setText("detHeaderStatus", record.status);
  setText("detHeaderPatient", `Patient: ${display(record.patientName)}`);
  setText("detHeaderConfidentiality", record.confidentiality);
  setText("detHeaderPriority", record.casePriority);

  setText("detBasicDateTime", formatDate(record.registeredDateTime));
  setText("detBasicBy", record.registeredBy);

  setText("detPatId", record.patientId);
  setText("detPatName", record.patientName);
  setText("detPatAgeGender", `${display(record.patientAge)} / ${display(record.patientGender)}`);
  setText("detPatNic", record.patientNic);
  setText("detPatBht", record.patientBht);
  setText("detPatContact", record.patientContact);

  setText("detClinCategory", record.category);
  setText("detClinReason", record.clinicalReason || record.causeSummary);
  setText("detClinHistory", record.patientHistory || record.briefAllegation || record.causeSummary);
  setText("detClinHarm", record.natureOfHarm);
  setText("detClinWeapon", record.natureOfWeapon);
  setText("detClinHurt", record.hurtCategory);
  setText("detClinAlcohol", record.alcoholStatus);
  setText("detClinDrug", record.drugStatus);

  setText("detMlefNoForm", `${display(record.mlefNo || record.pmRegistryNo)} / ${display(record.mlefFormNo || record.inquestNo || record.courtOrderNo)}`);
  setText("detMlefDate", formatDate(record.mlefDate || record.orderDate));
  setText("detMlefReceived", formatDate(record.mlefReceivedDateTime || record.bodyReceivedDateTime));
  setText("detMlefIssuedBy", record.mlefIssuedBy || record.orderedBy);
  setText("detMlefSource", record.type === "clinical" ? "Clinical MLEF / Referral" : "PM / Inquest / Court Order");
  setText("detMlefPoliceRef", record.policeRef);

  setText("detPolStationDiv", `${display(record.policeStation)} ${record.policeDivision ? " / " + record.policeDivision : ""}`);
  setText("detPolOfficer", record.policeOfficer);
  setText("detPolRankReg", `${display(record.policeOfficerRank)} / ${display(record.policeOfficerRegNo)}`);
  setText("detPolContact", record.policeOfficerContact);
  setText("detPolStatement", record.policeStatementReceived || "Not recorded");

  setText("detHospSource", record.patientSource);
  setText("detHospName", record.hospital);
  setText("detHospWardBed", record.wardBed);
  setText("detHospAdmitted", formatDate(record.admittedDateTime));
  setText("detHospDischarged", formatDate(record.dischargedDateTime));
  setText("detHospExamined", formatDate(record.examDateTime));

  setText("detIncDateTime", formatDate(record.incidentDateTime || record.dateOfDeath));
  setText("detIncPlace", record.placeOfIncident || record.placeOfDeath);
  setText("detIncType", record.category);

  const diagnostics = [];
  if (record.reqXray) diagnostics.push("X-ray");
  if (record.reqCt) diagnostics.push("CT Scan");
  if (record.reqBlood) diagnostics.push("Blood");
  if (record.reqUrine) diagnostics.push("Urine Toxicology");
  if (record.reqSwabs) diagnostics.push("Swabs");
  if (record.reqDna) diagnostics.push("DNA");
  if (record.reqPhotos) diagnostics.push("Photographs");

  setText("detReqExam", "Yes");
  setText("detReqDateTime", formatDate(record.examDateTime));
  setText("detReqLocation", record.examLocation || record.placeOfPM);
  setText("detReqSpecialist", "Not recorded");
  setText("detReqDiagnostics", diagnostics.length ? diagnostics.join(", ") : "None requested");
  setText("detReqInstructions", record.examSpecialInstructions);

  setText("detDocPrimary", record.primaryDoctor);
  setText("detDocAssisting", record.assistingDoctors?.join(", "));
  setText("detDocSupervisor", record.supervisingConsultant);
  setText("detDocFemaleReq", record.femaleDoctorRequired);
  setText("detDocNotes", record.assignmentNotes);

  setText("detCourtName", record.courtName);
  setText("detCourtRef", record.courtRef);
  setText("detCourtTrialDate", formatDate(record.trialDate));
  setText("detCourtSubmission", "Yes");
  setText("detCourtRemarks", record.courtRemarks);

  const caseDocs = record.caseDocuments || [];
  const docContainer = document.getElementById("detCaseDocumentsList");
  if (docContainer) {
    docContainer.innerHTML = miniList(
      caseDocs.map(doc => `
        <div class="case-mini-item">
          <strong>${display(doc.label)}</strong>
          <small>${display(doc.fileName)} • ${display(doc.status)} • ${formatDate(doc.uploadedAt)}</small>
        </div>
      `),
      "No case documents uploaded yet."
    );
  }

  const expectedContainer = document.getElementById("detExpectedReportsList");
  if (expectedContainer) {
    expectedContainer.innerHTML = miniList(
      (record.expectedReports || []).map(report => `
        <div class="case-mini-item">
          <strong>${display(report.reportType)}</strong>
          <small>Due: ${display(report.dueDate)} • Priority: ${display(report.priority)} • Status: ${display(report.status)}</small>
        </div>
      `),
      "No expected reports added."
    );
  }

  const exams = linkedExaminations(record.id);
  const examContainer = document.getElementById("detLinkedExamList");
  if (examContainer) {
    examContainer.innerHTML = miniList(
      exams.map(exam => `
        <div class="case-mini-item">
          <strong>${display(exam.id)} • ${display(exam.examType)}</strong>
          <small>${display(exam.status)} • ${formatDate(exam.examDateTime)}</small>
        </div>
      `),
      "No linked examinations yet."
    );
  }

  const evidence = linkedEvidence(record.id);
  const evidenceContainer = document.getElementById("detEvidenceSummary");
  if (evidenceContainer) {
    const labPending = evidence.filter(item => item.labRequired === "Yes" && item.sampleStatus !== "Result Received").length;

    evidenceContainer.innerHTML = `
      <div class="case-mini-item">
        <strong>${evidence.length} evidence / sample records</strong>
        <small>${labPending} lab pending • ${evidence.filter(item => item.sampleStatus === "Sealed" || item.sampleStatus === "Stored").length} sealed/stored</small>
      </div>
    `;
  }

  const reports = linkedReports(record.id);
  const reportContainer = document.getElementById("detGeneratedReportsList");
  if (reportContainer) {
    reportContainer.innerHTML = miniList(
      reports.map(report => `
        <div class="case-mini-item">
          <strong>${display(report.id)} • ${display(report.reportType)}</strong>
          <small>${display(report.reportStatus)} • ${formatDate(report.issueDate)}</small>
        </div>
      `),
      "No generated reports yet."
    );
  }
}
function renderRecentRecords() {
  const recent = records.slice(0, 5);
  dom.recentBody.innerHTML = recent.map(record => `
    <tr>
      <td><strong>${record.id}</strong></td>
      <td>${display(record.patientName)}</td>
      <td>${typeLabel(record.type)}</td>
      <td><span class="badge ${statusClass(record.status)}">${display(record.status)}</span></td>
      <td>${formatDate(record.registeredDateTime)}</td>
    </tr>
  `).join("");
}

function quickSearchPreview() {
  if (!dom.casePreview) return;
  const query = (dom.quickSearch.value || "").toLowerCase().trim();
  if (!query) {
    renderPreview();
    return;
  }
  const match = records.find(record => [
    record.id,
    record.patientId,
    record.patientName,
    record.policeRef,
    record.courtRef,
    record.mlefNo,
    record.pmRegistryNo
  ].join(" ").toLowerCase().includes(query));

  if (match) {
    selectedCaseId = match.id;
    renderPreview();
    renderLinkedRecords();
  } else {
    dom.casePreview.innerHTML = `<div class="preview-empty"><div><span>⌕</span><h4>No result found</h4><p>Try another Case ID, patient name, police or court reference.</p></div></div>`;
  }
}
function goToExaminationFromCase() {
  if (!selectedCaseId) {
    alert("Please select a case first.");
    return;
  }

  window.location.href = `ExaminationForms.html?caseId=${encodeURIComponent(selectedCaseId)}`;
}

function goToEvidenceFromCase() {
  if (!selectedCaseId) {
    alert("Please select a case first.");
    return;
  }

  const exam = latestExamination(selectedCaseId);

  if (!exam) {
    const continueAnyway = confirm("No examination found for this case yet. Evidence is usually registered after examination. Open Evidence & Samples anyway?");
    if (!continueAnyway) return;

    window.location.href = `EvidenceSamples.html?caseId=${encodeURIComponent(selectedCaseId)}`;
    return;
  }

  window.location.href =
    `EvidenceSamples.html?caseId=${encodeURIComponent(selectedCaseId)}&examId=${encodeURIComponent(exam.id)}`;
}

function goToReportFromCase() {
  if (!selectedCaseId) {
    alert("Please select a case first.");
    return;
  }

  const exam = latestExamination(selectedCaseId);

  if (!exam) {
    const continueAnyway = confirm("No examination found for this case yet. Report can only be drafted after examination findings. Open Report Generation anyway?");
    if (!continueAnyway) return;

    window.location.href = `ReportGeneration.html?caseId=${encodeURIComponent(selectedCaseId)}`;
    return;
  }

  window.location.href =
    `ReportGeneration.html?caseId=${encodeURIComponent(selectedCaseId)}&examId=${encodeURIComponent(exam.id)}`;
}

function initFromUrl() {
  const params = readUrlParams();

  if (params.type === "clinical" || params.type === "autopsy") {
    activateCaseType("registration", params.type);
  }

  if (params.patientId) {
    const patient = findPatient(params.patientId);
    if (patient) {
      applyPatientToCaseForm(patient);

      if (!params.type) {
        const autoType = patient.personStatus === "deceased" ? "autopsy" : "clinical";
        activateCaseType("registration", autoType);
      }
    } else {
      alert("Patient ID was passed in the URL, but no matching patient was found in Patient Management storage.");
    }
  }

  if (params.caseId) {
    const record = records.find(item => item.id === params.caseId);
    if (record) {
      selectedCaseId = record.id;
      currentDetailsType = record.type;
      activateTab("details");
      activateCaseType("details", record.type);
      populateFullCaseDetails(record.id);
    }
  }
}
function bindEvents() {
  dom.tabButtons.forEach(button => button.addEventListener("click", () => activateTab(button.dataset.tab)));
  dom.caseSwitchButtons.forEach(button => button.addEventListener("click", () => activateCaseType(button.dataset.context, button.dataset.type)));
  dom.caseForm.addEventListener("submit", saveCase);
  dom.clearFormBtn.addEventListener("click", resetForm);

 ["sexualAssault", "caseCategory"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", applySensitivityRules);
});

document.getElementById("confidentiality")?.addEventListener("change", enforceConfidentialityFloor);

document.getElementById("btnAddExpectedReport")?.addEventListener("click", addExpectedReportFromInputs);

document.getElementById("expectedReportsTableBody")?.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-expected-report]");
  if (!button) return;

  expectedReportsDraft.splice(Number(button.dataset.removeExpectedReport), 1);
  renderExpectedReportsTable();
});

  document.getElementById("registeredBy")?.addEventListener("change", applyRolePermissions);

  //dom.previewBtn.addEventListener("click", previewFromForm);
  dom.caseSearch.addEventListener("input", renderCaseTable);
  dom.statusFilter.addEventListener("change", renderCaseTable);
  //dom.quickSearch.addEventListener("input", quickSearchPreview);
  
  dom.caseTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-case-id]");
    if (!button) return;
    selectedCaseId = button.dataset.caseId;
    renderPreview();
    renderLinkedRecords();
    populateFullCaseDetails(selectedCaseId);
  });
  dom.viewRecentBtn.addEventListener("click", () => activateTab("details"));

   dom.menuBtn.addEventListener("click", () => {
    dom.sidebar.classList.add("open");
    dom.sidebarOverlay.classList.add("active");
  });

  dom.sidebarOverlay.addEventListener("click", () => {
    dom.sidebar.classList.remove("open");
    dom.sidebarOverlay.classList.remove("active");
  });
  
  // Optional: Close drawer if a nav menu link is clicked on mobile viewports
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      dom.sidebar.classList.remove("open");
      dom.sidebarOverlay.classList.remove("active");
    });
  });

  // Draft handling custom modal pop-up interaction loop
  const draftModal = document.getElementById("draftModal");
  const btnCloseDraftModal = document.getElementById("btnCloseDraftModal");

  document.getElementById("btnSaveAsDraft").addEventListener("click", () => {
    const record = getFormData();
    record.status = "Draft";

    records = [record, ...records.filter(item => item.id !== record.id)];
    selectedCaseId = record.id;
    saveRecords();
    renderRecentRecords();
    renderCaseTable();
    renderStats();

    const msgEl = document.getElementById("draftModalMessage");
    if (msgEl) msgEl.textContent = `Case ${record.id} saved as draft. You can resume editing from the Case Details tab.`;

    if (draftModal) {
      draftModal.style.display = "grid";
    }
  });

  if (btnCloseDraftModal) {
    btnCloseDraftModal.addEventListener("click", () => {
      if (draftModal) {
        draftModal.style.display = "none";
      }
      resetForm();
    });
  }

  const validationModal = document.getElementById("validationModal");
  const btnCloseValidationModal = document.getElementById("btnCloseValidationModal");

  if (btnCloseValidationModal) {
    btnCloseValidationModal.addEventListener("click", () => {
      if (validationModal) {
        validationModal.style.display = "none"; // Hides the custom validation pop-up
      }
    });
  }

  document.getElementById("btnGoToDetails")?.addEventListener("click", () => {
  resetForm();
  activateTab("details");
});

document.getElementById("btnGenerateMlrLater")?.addEventListener("click", () => {
  alert("Report tracking flag marked: Not Started.");
  resetForm();
});

  // --- END NEW CLINICAL FORM INTERACTION LOGIC ---

  // Connect the edit button click event
  if (dom.btnEditCaseDetails) {
    dom.btnEditCaseDetails.addEventListener("click", () => {
      if (selectedCaseId) {
        populateFormForEditing(selectedCaseId);
      } else {
        alert("Please select a case record from the list table view first.");
      }
    });
  }

  const closeSuccessBtn = document.getElementById("btnCloseSuccessModal");
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", () => {
      document.getElementById("successModal").style.display = "none";
      resetForm();
    });
  }
document.getElementById("btnStartExaminationFromCase")?.addEventListener("click", goToExaminationFromCase);
document.getElementById("btnOpenEvidenceFromCase")?.addEventListener("click", goToEvidenceFromCase);
document.getElementById("btnGenerateReportFromCase")?.addEventListener("click", goToReportFromCase);
} // This cleanly closes the bindEvents function structure

function populateFormForEditing(caseId) {
  const record = records.find(item => item.id === caseId);
  if (!record) return;

  isEditMode = true;
  
  // 1. Change layout titles to Edit Mode
  if (dom.formHeader) dom.formHeader.textContent = `Update Medico-Legal Case: ${record.id}`;
  if (dom.submitBtn) dom.submitBtn.textContent = "Update Case Records";

  // Switch tabs cleanly
  activateTab("registration");
}

function init() {
  updateTopbarLiveDate();

  bindEvents();
  setCategoryOptions(currentRegistrationType);
  setInitialFormValues();
  resetExpectedReportsForType(currentRegistrationType);
  renderPreview();
  renderLinkedRecords();
  renderRecentRecords();
  renderCaseTable();
  renderStats();
  applyRolePermissions();
  initFromUrl();
}

init();
