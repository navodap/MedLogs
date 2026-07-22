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
  renderNotifications();
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

function miniList(items, emptyMessage) {
  return items.length
    ? items.join("")
    : `<div class="case-mini-item"><small>${emptyMessage}</small></div>`;
}

function linkedExaminations(caseId) {
  return loadStorageArray(EXAM_STORAGE_KEY)
    .filter(exam => exam.caseId === caseId)
    .sort((a, b) => new Date(b.examDateTime || 0) - new Date(a.examDateTime || 0));
}

function latestExamination(caseId) {
  return linkedExaminations(caseId)[0] || null;
}

function linkedEvidence(caseId) {
  return loadStorageArray(EVIDENCE_STORAGE_KEY).filter(item => item.caseId === caseId);
}

function linkedReports(caseId) {
  return loadStorageArray(REPORT_STORAGE_KEY).filter(item => item.caseId === caseId);
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

function searchPatients(query) {
  const q = (query || "").toLowerCase().trim();
  if (!q) return [];

  const wantedStatus = currentRegistrationType === "autopsy" ? "deceased" : "living";

  return loadStorageArray(PATIENT_STORAGE_KEY)
    .filter(patient => patient.personStatus === wantedStatus)
    .filter(patient =>
      [patient.id, patient.fullName, patient.nicPassportNo, patient.hospitalNo, patient.bhtNo, patient.contactNo]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
}

function ensurePersonSearchResultsBox() {
  let box = document.getElementById("personSearchResults");
  if (box) return box;

  const label = document.getElementById("personSearchLabel");
  if (!label) return null;

  label.style.position = "relative";

  box = document.createElement("div");
  box.id = "personSearchResults";
  Object.assign(box.style, {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    zIndex: "50",
    background: "#fff",
    border: "1px solid #d0d7e2",
    borderRadius: "8px",
    boxShadow: "0 8px 20px rgba(15, 30, 60, 0.12)",
    maxHeight: "260px",
    overflowY: "auto",
    marginTop: "4px"
  });

  label.appendChild(box);
  return box;
}

function hidePersonSearchResults() {
  const box = document.getElementById("personSearchResults");
  if (box) box.style.display = "none";
}

function renderPersonSearchResults(matches) {
  const box = ensurePersonSearchResultsBox();
  if (!box) return;

  const personLabel = currentRegistrationType === "autopsy" ? "deceased person" : "patient";

  box.innerHTML = matches.length
    ? matches.slice(0, 8).map(patient => `
        <button type="button" data-person-result="${patient.id}"
          style="display:block; width:100%; text-align:left; padding:9px 12px; border:none; border-bottom:1px solid #eef1f6; background:none; cursor:pointer; font:inherit;">
          <strong>${patient.id}</strong> — ${patient.fullName || "Unnamed"}<br>
          <small style="color:#667;">
            ${patient.nicPassportNo ? "NIC: " + patient.nicPassportNo : "NIC not recorded"}
            ${patient.age ? " • " + patient.age + " yrs" : ""}
            ${patient.gender ? " • " + patient.gender : ""}
          </small>
        </button>
      `).join("")
    : `<div style="padding:10px 12px; color:#889; font-size:0.9em;">
        No matching ${personLabel} found. Register the person in Patient Management first.
      </div>`;

  box.style.display = "block";
}

function selectPatientFromSearch(patientId) {
  const patient = findPatient(patientId);
  if (!patient) return;

  applyPatientToCaseForm(patient);

  const input = document.getElementById("personSearch");
  if (input) input.value = `${patient.id}${patient.fullName ? " - " + patient.fullName : ""}`;

  hidePersonSearchResults();
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
    const doc = getUploadedFileInfo("mlefDocumentUpload", "MLEF Document", "clinical");
    if (doc) docs.push(doc);
  }

  if (type === "autopsy") {
    [
      ["inquestOrderUpload", "Inquest Order"],
      ["courtOrderUpload", "Court Order"],
      ["deathReportUpload", "Death Report"],
      ["autopsyPoliceRequestUpload", "Police Request"]
    ].forEach(([id, label]) => {
      const doc = getUploadedFileInfo(id, label, "autopsy");
      if (doc) docs.push(doc);
    });
  }

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

  // When editing, keep previously uploaded documents if no new files were chosen
  // (browsers cannot re-populate file inputs, so an empty input must not erase history)
  const existingRecord = records.find(item => item.id === value("caseId"));
  const mergedDocuments = caseDocuments.length
    ? caseDocuments
    : (existingRecord?.caseDocuments || []);

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

    caseDocuments: mergedDocuments,
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

  // A full save always promotes a draft to a registered case
  if (record.status === "Draft") {
    record.status = "Registered";
    setValue("caseStatus", "Registered");
  }

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

function goToLabRequestFromCase() {
  if (!selectedCaseId) {
    alert("Please select a case first.");
    return;
  }

  const record = records.find(item => item.id === selectedCaseId);
  if (!record) {
    alert("The selected case could not be found.");
    return;
  }

  const params = new URLSearchParams({
    caseId: record.id,
    caseType: record.type === "autopsy" ? "Postmortem" : "Clinical",
    personName: record.patientName || "",
    patientId: record.patientId || "",
    ref: record.mlefNo || record.pmRegistryNo || ""
  });

  window.location.href = `LabTest_Toxicology.html?${params.toString()}`;
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

  document.getElementById("registeredBy")?.addEventListener("change", applyRolePermissions);

  //dom.previewBtn.addEventListener("click", previewFromForm);
  dom.caseSearch.addEventListener("input", renderCaseTable);
  dom.statusFilter.addEventListener("change", renderCaseTable);

  const personSearchInput = document.getElementById("personSearch");
  const personSearchLabel = document.getElementById("personSearchLabel");

  if (personSearchInput) {
    personSearchInput.addEventListener("input", () => {
      const query = personSearchInput.value;
      if (!query.trim()) {
        hidePersonSearchResults();
        return;
      }
      renderPersonSearchResults(searchPatients(query));
    });

    personSearchInput.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault(); // stop the form from submitting (validation popup)

      const matches = searchPatients(personSearchInput.value);
      if (matches.length === 1) {
        selectPatientFromSearch(matches[0].id);
      } else {
        renderPersonSearchResults(matches);
      }
    });
  }

  if (personSearchLabel) {
    personSearchLabel.addEventListener("click", event => {
      const resultBtn = event.target.closest("[data-person-result]");
      if (resultBtn) selectPatientFromSearch(resultBtn.dataset.personResult);
    });
  }

  document.addEventListener("click", event => {
    if (!event.target.closest("#personSearchLabel")) hidePersonSearchResults();
  });

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

document.getElementById("btnAddExpectedReport")?.addEventListener("click", addExpectedReportFromInputs);

document.getElementById("btnAttachDocuments")?.addEventListener("click", () => {
  const caseId = value("caseId");
  if (!caseId) {
    alert("A Case ID has not been generated yet.");
    return;
  }
  window.location.href = `DocumentsAndReports.html?caseId=${encodeURIComponent(caseId)}`;
});

document.getElementById("expectedReportsTableBody")?.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-expected-report]");
  if (!button) return;

  expectedReportsDraft.splice(Number(button.dataset.removeExpectedReport), 1);
  renderExpectedReportsTable();
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
document.getElementById("btnAddLabRequestFromCase")?.addEventListener("click", goToLabRequestFromCase);
document.getElementById("btnGenerateReportFromCase")?.addEventListener("click", goToReportFromCase);
} // This cleanly closes the bindEvents function structure

function populateFormForEditing(caseId) {
  const record = records.find(item => item.id === caseId);
  if (!record) return;

  isEditMode = true;

  // Switch tab and case type first — this resets IDs, sections and expected reports,
  // so all record values must be written AFTER these calls.
  activateTab("registration");
  activateCaseType("registration", record.type);
  setCategoryOptions(record.type);

  // Basic case info
  setValue("caseId", record.id);
  setValue("caseTypeDisplay", record.type === "clinical" ? "Clinical" : "Autopsy");
  setValue("caseStatus", record.status);
  setValue("registeredDateTime", record.registeredDateTime);
  setValue("registeredBy", record.registeredBy);
  setValue("casePriority", record.casePriority);

  // Patient / victim details (read-only, restored for display)
  setValue("patientId", record.patientId);
  setValue("personStatus", record.personStatus);
  setValue("identificationStatus", record.identificationStatus);
  setValue("patientName", record.patientName);
  setValue("patientNic", record.patientNic);
  setValue("patientDob", record.patientDob);
  setValue("patientAge", record.patientAge);
  setValue("patientGender", record.patientGender);
  setValue("patientContact", record.patientContact);
  setValue("patientBht", record.patientBht);
  setValue("patientAddress", record.patientAddress);
  setValue("personSearch", record.patientId ? `${record.patientId}${record.patientName ? " - " + record.patientName : ""}` : "");
  setValue("caseConsentStatus", record.consentStatus);
  setValue("caseConsentFormAvailability", record.consentFormAvailability);
  setValue("caseConsentGivenBy", record.consentGivenBy);
  setValue("minor", record.minor ? "Yes" : "No");
  setValue("sexualAssault", record.sexualAssault ? "Yes" : "No");

  // Category + confidentiality
  setValue(record.type === "clinical" ? "caseCategory" : "autopsyCategory", record.category);
  confidentialityFloor = "Normal";
  setValue("confidentiality", record.confidentiality || "Normal");

  // Clinical referral / MLEF details
  setValue("mlefNo", record.mlefNo);
  setValue("mlefFormNo", record.mlefFormNo);
  setValue("mlefDate", record.mlefDate);
  setValue("mlefReceivedDateTime", record.mlefReceivedDateTime);
  setValue("mlefIssuedBy", record.mlefIssuedBy);
  setValue("clinicalReason", record.clinicalReason);
  setValue("briefAllegation", record.briefAllegation);
  setValue("clinicalSubCategory", record.clinicalSubCategory);
  setValue("incidentDateTime", record.incidentDateTime);
  setValue("placeOfIncident", record.placeOfIncident);
  setValue("natureOfHarm", record.natureOfHarm);
  setValue("natureOfWeapon", record.natureOfWeapon);
  setValue("hurtCategory", record.hurtCategory);
  setValue("patientHistory", record.patientHistory);

  // Autopsy details
  setValue("dateOfDeath", record.dateOfDeath);
  setValue("dateTimeFound", record.dateTimeFound);
  setValue("deathLocation", record.deathLocation);
  setValue("placeOfDeath", record.placeOfDeath);
  setValue("mannerOfDeath", record.mannerOfDeath);
  setValue("orderType", record.orderType);
  setValue("inquestNo", record.inquestNo);
  setValue("courtOrderNo", record.courtOrderNo);
  setValue("deathReportNo", record.deathReportNo);
  setValue("orderDate", record.orderDate);
  setValue("orderedBy", record.orderedBy);
  setValue("dateOfInquest", record.dateOfInquest);
  setValue("pmRegistryNo", record.pmRegistryNo);
  setValue("bodyTagNumber", record.bodyTagNumber);
  setValue("bodyReceivedDateTime", record.bodyReceivedDateTime);
  setValue("bodyReceivedFrom", record.bodyReceivedFrom);
  setValue("placeOfPM", record.placeOfPM);
  setValue("bodyCondition", record.bodyCondition);
  setValue("causeSummary", record.causeSummary);

  // Police details (field ids differ between clinical and autopsy sections)
  if (record.type === "clinical") {
    setValue("policeStation", record.policeStation);
    setValue("policeRef", record.policeRef);
    setValue("policeOfficer", record.policeOfficer);
    setValue("policeOfficerContact", record.policeOfficerContact);
  } else {
    setValue("autopsyPoliceStation", record.policeStation);
    setValue("autopsyPoliceRef", record.policeRef);
    setValue("autopsyPoliceOfficer", record.policeOfficer);
    setValue("autopsyPoliceContact", record.policeOfficerContact);
  }
  setValue("policeDivision", record.policeDivision);
  setValue("policeOfficerRank", record.policeOfficerRank);
  setValue("policeOfficerRegNo", record.policeOfficerRegNo);

  // Examination & doctors
  setValue("examDateTime", record.examDateTime);
  setValue("examLocation", record.examLocation);
  setValue("primaryDoctor", record.primaryDoctor);
  setValue("supervisingConsultant", record.supervisingConsultant);
  setValue("femaleDoctorRequired", record.femaleDoctorRequired);
  setValue("assignedDate", record.assignedDate);

  // Investigation checkboxes
  setValue("reqXray", record.reqXray);
  setValue("reqCt", record.reqCt);
  setValue("reqBlood", record.reqBlood);
  setValue("reqUrine", record.reqUrine);
  setValue("reqSwabs", record.reqSwabs);
  setValue("reqDna", record.reqDna);
  setValue("reqPhotos", record.reqPhotos);
  setValue("chainOfCustodyRequired", record.chainOfCustodyRequired);

  // Court details
  setValue("courtName", record.courtName);
  setValue("courtRef", record.courtRef);
  setValue("trialDate", record.trialDate);

  // Expected reports (activateCaseType reset these to defaults, so restore saved list)
  expectedReportsDraft = record.expectedReports ? [...record.expectedReports] : defaultExpectedReports(record.type);
  renderExpectedReportsTable();

  // Re-apply sensitivity rules and role locks with restored values
  applySensitivityRules();
  applyRolePermissions();

  // Edit mode titles
  if (dom.formHeader) dom.formHeader.textContent = `Update Medico-Legal Case: ${record.id}`;
  if (dom.submitBtn) dom.submitBtn.textContent = "Update Case Records";

  window.scrollTo({ top: 0, behavior: "smooth" });
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

/* ===================== NOTIFICATIONS ===================== */

function buildNotificationItems() {
  const today = dateValue();
  const items = [];

  records.forEach(record => {
    if (record.status === "Draft") {
      items.push({
        caseId: record.id,
        icon: "\u{1F4DD}",
        tone: "warn",
        title: `Draft case ${record.id} is incomplete`,
        meta: "Resume registration to submit this case"
      });
    }

    (record.expectedReports || []).forEach(report => {
      if (report.status !== "Expected" || !report.dueDate) return;
      if (report.dueDate < today) {
        items.push({
          caseId: record.id,
          icon: "\u26A0\uFE0F",
          tone: "danger",
          title: `${display(report.reportType)} overdue for ${record.id}`,
          meta: `Was due ${formatDate(report.dueDate)}`
        });
      } else if (report.dueDate === today) {
        items.push({
          caseId: record.id,
          icon: "\u23F0",
          tone: "warn",
          title: `${display(report.reportType)} due today for ${record.id}`,
          meta: `Due ${formatDate(report.dueDate)}`
        });
      }
    });

    if (record.status !== "Closed") {
      const labPending = linkedEvidence(record.id)
        .filter(item => item.labRequired === "Yes" && item.sampleStatus !== "Result Received").length;
      if (labPending) {
        items.push({
          caseId: record.id,
          icon: "\u{1F9EA}",
          tone: "info",
          title: `${labPending} lab result${labPending === 1 ? "" : "s"} pending for ${record.id}`,
          meta: "Awaiting laboratory results"
        });
      }
    }

    if (
      record.casePriority && record.casePriority !== "Normal" &&
      !["Closed", "Report Submitted"].includes(record.status)
    ) {
      items.push({
        caseId: record.id,
        icon: "\u{1F512}",
        tone: "danger",
        title: `${record.casePriority}: ${record.id} still open`,
        meta: `Status: ${display(record.status)}`
      });
    }
  });

  return items;
}

function renderNotifications() {
  const badge = document.getElementById("notifyCount");
  const list = document.getElementById("notifyList");
  const headCount = document.getElementById("notifyHeadCount");
  if (!badge || !list) return;

  const items = buildNotificationItems();

  badge.textContent = items.length > 9 ? "9+" : items.length;
  badge.hidden = items.length === 0;
  if (headCount) headCount.textContent = items.length ? `${items.length} new` : "";

  list.innerHTML = items.length
    ? items.map(item => `
        <button type="button" class="notify-item ${item.tone}" data-notify-case="${item.caseId}">
          <span class="notify-item-icon">${item.icon}</span>
          <span class="notify-item-text"><strong>${item.title}</strong><small>${item.meta}</small></span>
        </button>`).join("")
    : `<div class="notify-empty">You're all caught up.</div>`;
}

function bindNotificationEvents() {
  const btn = document.getElementById("notifyBtn");
  const dropdown = document.getElementById("notifyDropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", event => {
    event.stopPropagation();
    renderNotifications();
    const willOpen = dropdown.hidden;
    dropdown.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".notify-wrap")) {
      dropdown.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });

  dropdown.addEventListener("click", event => {
    const item = event.target.closest("[data-notify-case]");
    if (!item) return;
    dropdown.hidden = true;
    btn.setAttribute("aria-expanded", "false");

    const record = records.find(entry => entry.id === item.dataset.notifyCase);
    if (!record) return;
    selectedCaseId = record.id;
    activateTab("details");
    renderPreview();
    renderLinkedRecords();
    populateFullCaseDetails(selectedCaseId);
  });
}

bindNotificationEvents();
renderNotifications();

/* ===================== GLOBAL SEARCH (TOPBAR) ===================== */

function globalSearchMatches(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results = [];
  const seen = new Set();

  const pushResult = (caseId, icon, label, sub) => {
    const key = `${icon}:${caseId}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ caseId, icon, label, sub });
  };

  // 1. Cases (IDs, references, doctors, status...)
  records.forEach(record => {
    const haystack = [
      record.id, record.patientId, record.patientName, record.category,
      record.status, record.primaryDoctor, record.mlefNo, record.mlrSerial,
      record.pmRegistryNo, record.inquestNo, record.courtOrderNo,
      record.policeStation, record.policeRef, record.courtName, record.courtRef
    ].join(" ").toLowerCase();
    if (haystack.includes(q)) {
      pushResult(record.id, "\u25A3",
        `${record.id} \u2014 ${display(record.patientName)}`,
        `${record.type === "autopsy" ? "Autopsy" : "Clinical"} \u2022 ${display(record.status)}`);
    }
  });

  // 2. Patients (resolved to their cases)
  loadStorageArray(PATIENT_STORAGE_KEY).forEach(patient => {
    const haystack = [
      patient.id, patient.fullName, patient.nicPassportNo,
      patient.hospitalNo, patient.bhtNo, patient.contactNo
    ].join(" ").toLowerCase();
    if (!haystack.includes(q)) return;
    records
      .filter(record => record.patientId === patient.id)
      .forEach(record => pushResult(record.id, "\u263A",
        `${display(patient.fullName)} (${patient.id})`,
        `Patient \u2022 Case ${record.id}`));
  });

  // 3. Reports (resolved to their cases)
  loadStorageArray(REPORT_STORAGE_KEY).forEach(report => {
    const haystack = [
      report.id, report.reportNo, report.reportType,
      report.reportStatus, report.caseId
    ].join(" ").toLowerCase();
    if (!haystack.includes(q)) return;
    if (records.some(record => record.id === report.caseId)) {
      pushResult(report.caseId, "\u2637",
        `${display(report.reportType)} \u2014 ${display(report.reportNo || report.id)}`,
        `Report \u2022 Case ${report.caseId}`);
    }
  });

  return results.slice(0, 8);
}

function renderGlobalSearchResults(items) {
  const panel = document.getElementById("globalSearchResults");
  if (!panel) return;

  if (!items.length) {
    panel.innerHTML = `<div class="global-search-empty">No matches found</div>`;
    panel.hidden = false;
    return;
  }

  panel.innerHTML = items.map(item => `
    <button type="button" class="global-search-item" data-global-result="${item.caseId}">
      <span class="global-search-item-icon">${item.icon}</span>
      <span class="global-search-item-text">
        <strong>${item.label}</strong>
        <small>${item.sub}</small>
      </span>
    </button>`).join("");
  panel.hidden = false;
}

function hideGlobalSearchResults() {
  const panel = document.getElementById("globalSearchResults");
  if (panel) panel.hidden = true;
}

function openCaseFromGlobalSearch(caseId) {
  const record = records.find(entry => entry.id === caseId);
  if (!record) return;
  hideGlobalSearchResults();
  const input = document.getElementById("globalSearch");
  if (input) input.value = "";
  selectedCaseId = record.id;
  activateTab("details");
  renderPreview();
  renderLinkedRecords();
  populateFullCaseDetails(selectedCaseId);
}

function bindGlobalSearchEvents() {
  const input = document.getElementById("globalSearch");
  const label = document.getElementById("globalSearchLabel");
  const panel = document.getElementById("globalSearchResults");
  if (!input || !panel) return;

  input.addEventListener("input", () => {
    const query = input.value;
    if (!query.trim()) {
      hideGlobalSearchResults();
      return;
    }
    renderGlobalSearchResults(globalSearchMatches(query));
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      input.value = "";
      hideGlobalSearchResults();
      input.blur();
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    const matches = globalSearchMatches(input.value);
    if (matches.length) openCaseFromGlobalSearch(matches[0].caseId);
  });

  panel.addEventListener("click", event => {
    const item = event.target.closest("[data-global-result]");
    if (item) openCaseFromGlobalSearch(item.dataset.globalResult);
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("#globalSearchLabel")) hideGlobalSearchResults();
  });

  // Ctrl + K (or Cmd + K) focuses the search box
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      input.focus();
      input.select();
    }
  });
}

bindGlobalSearchEvents();
