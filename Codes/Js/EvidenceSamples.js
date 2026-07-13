const STORAGE_KEY = "fmdis_evidence_samples_v1";
const EXAM_STORAGE_KEY = "fmdis_examinations_v1";
const CASE_STORAGE_KEY = "fmdis_cases_v2";

const sampleCases = [
  {
    id: "CL-2026-000123",
    type: "clinical",
    category: "Assault",
    status: "Under Examination",
    patientId: "PV-2026-00124",
    patientName: "Wijesinghe, A. K.",
    patientAge: "17",
    patientGender: "Female",
    confidentiality: "Restricted",
    primaryDoctor: "Dr. N. Perera",
    jmoOffice: "Colombo JMO Office",
    mlefNo: "MLEF/2026/145",
    policeStation: "Borella Police Station",
    policeRef: "BOR/CR/2026/321",
    courtName: "Colombo Magistrate Court",
    courtRef: "MC/2026/114"
  },
  {
    id: "PM-2026-000045",
    type: "autopsy",
    category: "Accidental Death",
    status: "Report Drafting",
    patientId: "PV-2026-00126",
    patientName: "Fernando, R. T.",
    patientAge: "47",
    patientGender: "Male",
    confidentiality: "Restricted",
    primaryDoctor: "Dr. H. Jayasinghe",
    jmoOffice: "Galle JMO Office",
    pmRegistryNo: "PM-REG-2026-045",
    inquestNo: "INQ/2026/310",
    policeStation: "Galle Police Station",
    policeRef: "GAL/ACC/2026/056",
    courtName: "Galle Magistrate Court",
    courtRef: "MC-GAL/2026/77"
  }
];

const sampleExaminations = [
  {
    id: "EXAM-2026-000001",
    caseId: "CL-2026-000123",
    patientId: "PV-2026-00124",
    patientName: "Wijesinghe, A. K.",
    caseType: "clinical",
    caseCategory: "Assault",
    examType: "Clinical Forensic Examination",
    status: "Completed",
    examDateTime: "2026-05-27T09:30",
    examPlace: "JMO Office - Colombo",
    primaryDoctor: "Dr. N. Perera",
    privacyLevel: "Restricted",
    samples: ["Photographs", "X-ray / CT"],
    temporarySealNo: "",
    storageCondition: "Room temperature",
    labRequestNeeded: "Yes",
    samplePriority: "Normal"
  },
  {
    id: "EXAM-2026-000002",
    caseId: "PM-2026-000045",
    patientId: "PV-2026-00126",
    patientName: "Fernando, R. T.",
    caseType: "autopsy",
    caseCategory: "Accidental Death",
    examType: "Postmortem / Autopsy Examination",
    status: "Pending Lab Results",
    examDateTime: "2026-05-26T12:00",
    examPlace: "Galle Mortuary",
    primaryDoctor: "Dr. H. Jayasinghe",
    privacyLevel: "Restricted",
    samples: ["Blood", "Urine", "Vitreous Humor", "Stomach Contents", "Histology", "Toxicology", "Photographs"],
    temporarySealNo: "SEAL/GAL/2026/045",
    storageCondition: "Refrigerated",
    labRequestNeeded: "Yes",
    samplePriority: "Court Priority"
  }
];

const sampleEvidenceRecords = [
  {
    id: "SMP-2026-000001",
    caseId: "PM-2026-000045",
    examId: "EXAM-2026-000002",
    patientId: "PV-2026-00126",
    patientName: "Fernando, R. T.",
    caseType: "autopsy",
    caseCategory: "Accidental Death",
    evidenceCategory: "Biological Sample",
    sampleType: "Blood",
    bodySource: "Femoral blood",
    sampleQuantity: "10 ml",
    containerType: "Fluoride tube",
    evidencePriority: "Court Priority",
    collectedDateTime: "2026-05-26T13:05",
    collectedBy: "Dr. H. Jayasinghe",
    sealNo: "SEAL/GAL/2026/045-A",
    barcodeNo: "BC-GAL-045-A",
    storageCondition: "Refrigerated",
    storageLocation: "Galle Mortuary evidence fridge",
    sampleStatus: "Stored",
    chainRequired: "Yes",
    labRequired: "Yes",
    preferredLab: "Government Analyst Department",
    requestedBy: "Dr. H. Jayasinghe",
    requestPriority: "Court Priority",
    requestedTests: ["Alcohol", "Poison / Toxicology"],
    accessLevel: "Restricted",
    documentType: "Sample Label Scan",
    evidenceDocument: { fileName: "", preview: "" },
    evidenceNotes: "Sample sealed after collection and stored under refrigerated condition pending toxicology dispatch.",
    custodyEvents: [
      {
        id: "CUS-2026-000001",
        actionType: "Collected",
        fromUser: "Dr. H. Jayasinghe",
        toUser: "JMO Evidence Storage",
        transferDateTime: "2026-05-26T13:10",
        sealStatus: "Intact",
        location: "Galle Mortuary",
        remarks: "Collected during postmortem and sealed immediately."
      }
    ],
    updatedAt: "2026-05-26T13:15"
  },
  {
    id: "SMP-2026-000002",
    caseId: "CL-2026-000123",
    examId: "EXAM-2026-000001",
    patientId: "PV-2026-00124",
    patientName: "Wijesinghe, A. K.",
    caseType: "clinical",
    caseCategory: "Assault",
    evidenceCategory: "Photographic Evidence",
    sampleType: "Photographs",
    bodySource: "Left forearm and right cheek injuries",
    sampleQuantity: "6 images",
    containerType: "Digital media",
    evidencePriority: "Sensitive Case",
    collectedDateTime: "2026-05-27T09:55",
    collectedBy: "Dr. N. Perera",
    sealNo: "DIGI/CL/2026/123-PHOTO",
    barcodeNo: "",
    storageCondition: "Digital archive",
    storageLocation: "Restricted case folder",
    sampleStatus: "Archived",
    chainRequired: "Yes",
    labRequired: "No",
    preferredLab: "",
    requestedBy: "Dr. N. Perera",
    requestPriority: "Normal",
    requestedTests: [],
    accessLevel: "Restricted",
    documentType: "Evidence Photograph",
    evidenceDocument: { fileName: "", preview: "" },
    evidenceNotes: "Injury photographs linked to clinical examination markers.",
    custodyEvents: [
      {
        id: "CUS-2026-000002",
        actionType: "Collected",
        fromUser: "Dr. N. Perera",
        toUser: "Restricted Digital Evidence Archive",
        transferDateTime: "2026-05-27T10:00",
        sealStatus: "Not Applicable",
        location: "Colombo JMO Office",
        remarks: "Photographs saved in restricted archive."
      }
    ],
    updatedAt: "2026-05-27T10:05"
  }
];

const dom = {
  tabButtons: document.querySelectorAll(".tab-btn"),
  entryPanel: document.getElementById("entryPanel"),
  recordsPanel: document.getElementById("recordsPanel"),
  switchButtons: document.querySelectorAll(".case-switch-btn"),
  form: document.getElementById("evidenceForm"),
  sourceSearchInput: document.getElementById("sourceSearchInput"),
  examinationSelect: document.getElementById("examinationSelect"),
  sourceSummaryPanel: document.getElementById("sourceSummaryPanel"),
  sampleId: document.getElementById("sampleId"),
  sampleCaseId: document.getElementById("sampleCaseId"),
  samplePatientId: document.getElementById("samplePatientId"),
  sampleExamId: document.getElementById("sampleExamId"),
  sampleType: document.getElementById("sampleType"),
  collectedDateTime: document.getElementById("collectedDateTime"),
  custodyDateTime: document.getElementById("custodyDateTime"),
  custodyTableBody: document.getElementById("custodyTableBody"),
  custodyEmptyMessage: document.getElementById("custodyEmptyMessage"),
  evidenceDocumentUpload: document.getElementById("evidenceDocumentUpload"),
  evidenceDocumentPreviewWrap: document.getElementById("evidenceDocumentPreviewWrap"),
  evidenceDocumentPreview: document.getElementById("evidenceDocumentPreview"),
  evidenceDocumentFileName: document.getElementById("evidenceDocumentFileName"),
  evidenceSearch: document.getElementById("evidenceSearch"),
  evidenceStatusFilter: document.getElementById("evidenceStatusFilter"),
  evidenceTableBody: document.getElementById("evidenceTableBody"),
  evidenceEmptyMessage: document.getElementById("evidenceEmptyMessage"),
  fullEvidenceDetailsContainer: document.getElementById("fullEvidenceDetailsContainer"),
  totalSampleStat: document.getElementById("totalSampleStat"),
  sealedSampleStat: document.getElementById("sealedSampleStat"),
  labPendingStat: document.getElementById("labPendingStat"),
  recentEvidenceBody: document.getElementById("recentEvidenceBody"),
  clearFormBtn: document.getElementById("clearFormBtn"),
  btnSaveDraft: document.getElementById("btnSaveDraft"),
  btnRegisterEvidence: document.getElementById("btnRegisterEvidence"),
  btnAddCustodyEvent: document.getElementById("btnAddCustodyEvent"),
  btnClearCustodyEvents: document.getElementById("btnClearCustodyEvents"),
  viewRecentBtn: document.getElementById("viewRecentBtn"),
  menuBtn: document.querySelector(".menu-btn"),
  sidebar: document.querySelector(".sidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  dateDisplay: document.getElementById("currentDateDisplay"),
  dayDisplay: document.getElementById("currentDayDisplay"),
  globalSearch: document.getElementById("globalEvidenceSearch"),
  btnSuccessClose: document.getElementById("btnSuccessClose"),
  btnSuccessGoLab: document.getElementById("btnSuccessGoLab"),
  btnSuccessGoDocuments: document.getElementById("btnSuccessGoDocuments")
};

let caseRecords = loadCaseRecords();
let examinationRecords = loadExaminations();
let evidenceRecords = loadEvidenceRecords();
let selectedExam = null;
let selectedCase = null;
let selectedEvidenceId = null;
let currentEntryMode = "sample";
let currentDetailsType = "all";
let custodyEvents = [];
let evidenceDocumentDataUrl = "";
let evidenceDocumentName = "";
let isEditMode = false;
let lastSavedRecord = null;

function loadCaseRecords() {
  try {
    const stored = localStorage.getItem(CASE_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleCases];
  } catch (error) {
    console.warn("Case records could not be loaded. Sample cases were used.", error);
    return [...sampleCases];
  }
}

function loadExaminations() {
  try {
    const stored = localStorage.getItem(EXAM_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleExaminations];
  } catch (error) {
    console.warn("Examination records could not be loaded. Sample examinations were used.", error);
    return [...sampleExaminations];
  }
}

function loadEvidenceRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleEvidenceRecords];
  } catch (error) {
    console.warn("Evidence records could not be loaded. Sample evidence was used.", error);
    return [...sampleEvidenceRecords];
  }
}

function saveEvidenceRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evidenceRecords));
}

function pad(number, size = 6) {
  return String(number).padStart(size, "0");
}

function currentYear() {
  return new Date().getFullYear();
}

function generateSampleId() {
  const year = currentYear();
  const sameSeries = evidenceRecords.filter(record => record.id && record.id.startsWith(`SMP-${year}-`));
  const next = sameSeries.length
    ? Math.max(...sameSeries.map(record => Number(record.id.split("-").pop()) || 0)) + 1
    : 1;
  return `SMP-${year}-${pad(next)}`;
}

function generateCustodyId() {
  const year = currentYear();
  const allEvents = evidenceRecords.flatMap(record => record.custodyEvents || []).concat(custodyEvents || []);
  const sameSeries = allEvents.filter(event => event.id && event.id.startsWith(`CUS-${year}-`));
  const next = sameSeries.length
    ? Math.max(...sameSeries.map(event => Number(event.id.split("-").pop()) || 0)) + 1
    : 1;
  return `CUS-${year}-${pad(next)}`;
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function value(id) {
  const element = document.getElementById(id);
  if (!element) return "";
  if (element.type === "checkbox") return element.checked;
  return element.value && element.value.trim ? element.value.trim() : element.value;
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

function typeLabel(type) {
  return type === "autopsy" ? "Autopsy / PM" : "Clinical";
}

function statusClass(status) {
  if (["Sealed", "Stored", "Archived", "Result Received"].includes(status)) return "success";
  if (["Sent to Laboratory", "Received by Laboratory"].includes(status)) return "warn";
  if (["Draft", "Collected"].includes(status)) return "purple";
  if (["Broken", "Highly Restricted"].includes(status)) return "danger";
  return "light";
}

function updateTopbarLiveDate() {
  const now = new Date();
  dom.dateDisplay.textContent = now.toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });
  dom.dayDisplay.textContent = now.toLocaleDateString(undefined, { weekday: "long" });
}

function findCase(caseId) {
  return caseRecords.find(record => record.id === caseId) || null;
}

function findExam(examId) {
  return examinationRecords.find(record => record.id === examId) || null;
}

function mainReference(caseRecord) {
  if (!caseRecord) return "";
  return caseRecord.type === "autopsy"
    ? caseRecord.pmRegistryNo || caseRecord.inquestNo || caseRecord.courtOrderNo || caseRecord.policeRef || "Not recorded"
    : caseRecord.mlefNo || caseRecord.mlrSerial || caseRecord.policeRef || "Not recorded";
}

function selectedTests() {
  return [...document.querySelectorAll(".test-checkbox")]
    .filter(input => input.checked)
    .map(input => input.dataset.test);
}

function setSelectedTests(tests = []) {
  document.querySelectorAll(".test-checkbox").forEach(input => {
    input.checked = tests.includes(input.dataset.test);
  });
}

function populateExaminationSelect(filter = "") {
  const query = filter.toLowerCase().trim();

  const filtered = examinationRecords.filter(exam => {
    if (!query) return true;
    const caseRecord = findCase(exam.caseId);
    return [
      exam.id,
      exam.caseId,
      exam.patientId,
      exam.patientName,
      exam.caseCategory,
      exam.examType,
      exam.primaryDoctor,
      exam.status,
      caseRecord?.mlefNo,
      caseRecord?.pmRegistryNo,
      caseRecord?.inquestNo,
      (exam.samples || []).join(" ")
    ].join(" ").toLowerCase().includes(query);
  });

  dom.examinationSelect.innerHTML = `
    <option value="">Select examination</option>
    ${filtered.map(exam => `
      <option value="${exam.id}">
        ${exam.id} • ${exam.caseId} • ${display(exam.patientName)} • ${typeLabel(exam.caseType)}
      </option>
    `).join("")}
  `;
}

function renderSourceSummary(exam) {
  if (!exam) {
    dom.sourceSummaryPanel.innerHTML = `
      <div class="preview-empty compact-empty">
        <div><span>⌕</span><h4>No examination selected</h4><p>Select a completed or draft examination to register collected evidence.</p></div>
      </div>
    `;
    return;
  }

  const caseRecord = findCase(exam.caseId);

  dom.sourceSummaryPanel.innerHTML = `
    <div class="selected-case-summary">
      <div class="summary-main">
        <small>Selected Examination</small>
        <strong>${exam.id}</strong>
        <span class="badge ${exam.caseType === "clinical" ? "success" : "warn"}">${typeLabel(exam.caseType)}</span>
        <span class="badge ${statusClass(exam.status)}">${display(exam.status)}</span>
      </div>
      <div class="summary-cell"><small>Case / Patient</small><span>${display(exam.caseId)}<br>${display(exam.patientName)} • ${display(exam.patientId)}</span></div>
      <div class="summary-cell"><small>Category</small><span>${display(exam.caseCategory || caseRecord?.category)}</span></div>
      <div class="summary-cell"><small>Doctor</small><span>${display(exam.primaryDoctor)}</span></div>
      <div class="summary-cell"><small>Reference</small><span>${display(mainReference(caseRecord))}</span></div>
      <div class="summary-cell"><small>Samples from Exam</small><span>${(exam.samples || []).length ? exam.samples.join(", ") : "None marked"}</span></div>
      <div class="summary-cell"><small>Police</small><span>${display(caseRecord?.policeStation)}<br>${display(caseRecord?.policeRef)}</span></div>
      <div class="summary-cell"><small>Court</small><span>${display(caseRecord?.courtName)}<br>${display(caseRecord?.courtRef)}</span></div>
      <div class="summary-cell"><small>Privacy</small><span>${display(exam.privacyLevel || caseRecord?.confidentiality)}</span></div>
    </div>
  `;
}

function selectExamination(examId) {
  selectedExam = findExam(examId);
  selectedCase = selectedExam ? findCase(selectedExam.caseId) : null;

  if (!selectedExam) {
    renderSourceSummary(null);
    return;
  }

  setValue("sampleCaseId", selectedExam.caseId);
  setValue("samplePatientId", selectedExam.patientId);
  setValue("sampleExamId", selectedExam.id);
  setValue("collectedBy", selectedExam.primaryDoctor || "");
  setValue("requestedBy", selectedExam.primaryDoctor || "");
  setValue("storageCondition", selectedExam.storageCondition || "Room temperature");
  setValue("evidencePriority", selectedExam.samplePriority || selectedCase?.casePriority || "Normal");
  setValue("accessLevel", selectedExam.privacyLevel || selectedCase?.confidentiality || "Normal");

  const samples = selectedExam.samples || [];
  if (samples.length && !isEditMode) {
    setValue("sampleType", samples[0]);
    setSuggestedFieldsFromSample(samples[0]);
  }

  renderSourceSummary(selectedExam);
}

function setSuggestedFieldsFromSample(sampleType) {
  const type = sampleType || value("sampleType");
  const map = {
    "Blood": { category: "Biological Sample", container: "Fluoride tube", lab: "Yes", tests: ["Alcohol", "Poison / Toxicology"] },
    "Urine": { category: "Biological Sample", container: "Sterile container", lab: "Yes", tests: ["Drug Screen", "Poison / Toxicology"] },
    "Swab": { category: "Swab", container: "Sterile container", lab: "Yes", tests: ["DNA", "Serology"] },
    "DNA": { category: "Biological Sample", container: "Sterile container", lab: "Yes", tests: ["DNA"] },
    "Hair": { category: "Biological Sample", container: "Paper envelope", lab: "Yes", tests: ["DNA", "Poison / Toxicology"] },
    "Nails": { category: "Biological Sample", container: "Paper envelope", lab: "Yes", tests: ["DNA"] },
    "Vitreous Humor": { category: "Biological Sample", container: "Plain tube", lab: "Yes", tests: ["Poison / Toxicology"] },
    "Stomach Contents": { category: "Biological Sample", container: "Sterile container", lab: "Yes", tests: ["Poison / Toxicology"] },
    "Clothing": { category: "Physical Evidence", container: "Evidence bag", lab: "Pending Decision", tests: ["Serology", "DNA"] },
    "Photographs": { category: "Photographic Evidence", container: "Digital media", lab: "No", tests: [] },
    "X-ray / CT Reference": { category: "Radiology Reference", container: "Digital media", lab: "No", tests: ["Radiology"] },
    "Histology": { category: "Biological Sample", container: "Sterile container", lab: "Yes", tests: ["Histopathology"] },
    "Toxicology": { category: "Biological Sample", container: "Plain tube", lab: "Yes", tests: ["Poison / Toxicology"] },
    "Histology Tissue": { category: "Biological Sample", container: "Sterile container", lab: "Yes", tests: ["Histopathology"] },
    "Toxicology Sample": { category: "Biological Sample", container: "Plain tube", lab: "Yes", tests: ["Poison / Toxicology"] }
  };

  const suggestion = map[type];
  if (!suggestion) return;

  setValue("evidenceCategory", suggestion.category);
  setValue("containerType", suggestion.container);
  setValue("labRequired", suggestion.lab);
  setSelectedTests(suggestion.tests);
}

function setInitialFormValues() {
  setValue("sampleId", generateSampleId());
  setValue("collectedDateTime", localDateTimeValue());
  setValue("custodyDateTime", localDateTimeValue());
  setValue("sampleStatus", "Sealed");
  setValue("chainRequired", "Yes");
  setValue("labRequired", "Yes");
}

function activateTab(tab) {
  dom.tabButtons.forEach(button => button.classList.toggle("active", button.dataset.tab === tab));
  dom.entryPanel.classList.toggle("active", tab === "entry");
  dom.recordsPanel.classList.toggle("active", tab === "records");
  if (tab === "records") renderEvidenceTable();
}

function setEntryMode(type) {
  currentEntryMode = type;
  document.querySelectorAll(`.case-switch-btn[data-context="entryMode"]`).forEach(button => {
    button.classList.toggle("active", button.dataset.type === type);
  });

  if (type === "physical") {
    document.getElementById("entryFormHeader").textContent = "Register Physical Evidence";
    setValue("evidenceCategory", "Physical Evidence");
    setValue("sampleType", "Clothing");
    setSuggestedFieldsFromSample("Clothing");
  } else {
    document.getElementById("entryFormHeader").textContent = "Register Evidence or Sample";
    setValue("evidenceCategory", "Biological Sample");
  }
}

function setDetailsType(type) {
  currentDetailsType = type;
  document.querySelectorAll(`.case-switch-btn[data-context="details"]`).forEach(button => {
    button.classList.toggle("active", button.dataset.type === type);
  });
  renderEvidenceTable();
  dom.fullEvidenceDetailsContainer.style.display = "none";
}

function addCustodyEvent() {
  const event = {
    id: generateCustodyId(),
    actionType: value("custodyActionType"),
    fromUser: value("custodyFrom"),
    toUser: value("custodyTo"),
    transferDateTime: value("custodyDateTime") || localDateTimeValue(),
    sealStatus: value("custodySealStatus"),
    location: value("custodyLocation"),
    remarks: value("custodyRemarks")
  };

  custodyEvents.push(event);

  setValue("custodyRemarks", "");
  setValue("custodyDateTime", localDateTimeValue());
  renderCustodyTable();
}

function renderCustodyTable() {
  dom.custodyTableBody.innerHTML = custodyEvents.map((event, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${display(event.actionType)}</strong><br><small>${display(event.location)}</small></td>
      <td>${display(event.fromUser)}<br><small>→ ${display(event.toUser)}</small></td>
      <td>${formatDate(event.transferDateTime)}</td>
      <td><span class="badge ${event.sealStatus === "Broken" ? "danger" : "success"}">${display(event.sealStatus)}</span></td>
      <td><button class="table-action" type="button" data-delete-custody="${event.id}">Delete</button></td>
    </tr>
  `).join("");

  dom.custodyEmptyMessage.hidden = custodyEvents.length !== 0;
}

function validateRecord(record, isDraft = false) {
  const missing = [];

  if (!record.examId) missing.push("Registered Examination ID");
  if (!record.caseId) missing.push("Case ID");
  if (!record.sampleType) missing.push("Sample / evidence type");

  if (!isDraft) {
    if (!record.collectedDateTime) missing.push("Collected date and time");
    if (!record.collectedBy) missing.push("Collected by doctor / officer");
    if (!record.sealNo) missing.push("Seal number");
    if (record.chainRequired === "Yes" && !record.custodyEvents.length) {
      missing.push("At least one chain of custody event");
    }
  }

  return missing;
}

function getFormData(statusOverride) {
  const existing = evidenceRecords.find(record => record.id === value("sampleId"));
  const status = statusOverride || value("sampleStatus") || "Sealed";

  return {
    id: value("sampleId") || generateSampleId(),
    caseId: value("sampleCaseId"),
    examId: value("sampleExamId"),
    patientId: value("samplePatientId"),
    patientName: selectedExam?.patientName || existing?.patientName || "",
    caseType: selectedExam?.caseType || existing?.caseType || selectedCase?.type || "clinical",
    caseCategory: selectedExam?.caseCategory || selectedCase?.category || existing?.caseCategory || "",
    evidenceCategory: value("evidenceCategory"),
    sampleType: value("sampleType"),
    bodySource: value("bodySource"),
    sampleQuantity: value("sampleQuantity"),
    containerType: value("containerType"),
    evidencePriority: value("evidencePriority"),
    collectedDateTime: value("collectedDateTime"),
    collectedBy: value("collectedBy"),
    sealNo: value("sealNo"),
    barcodeNo: value("barcodeNo"),
    storageCondition: value("storageCondition"),
    storageLocation: value("storageLocation"),
    sampleStatus: status,
    chainRequired: value("chainRequired"),
    labRequired: value("labRequired"),
    preferredLab: value("preferredLab"),
    requestedBy: value("requestedBy"),
    requestPriority: value("requestPriority"),
    requestedTests: selectedTests(),
    accessLevel: value("accessLevel"),
    documentType: value("documentType"),
    evidenceDocument: {
      fileName: evidenceDocumentName,
      preview: evidenceDocumentDataUrl
    },
    evidenceNotes: value("evidenceNotes"),
    custodyEvents: [...custodyEvents],
    updatedAt: localDateTimeValue()
  };
}

function saveEvidence(statusOverride) {
  const isDraft = statusOverride === "Draft";
  const record = getFormData(statusOverride);
  const missing = validateRecord(record, isDraft);

  if (missing.length) {
    document.getElementById("validationMissingList").innerHTML = missing.map(item => `<li>${item}</li>`).join("");
    document.getElementById("validationModal").style.display = "grid";
    return;
  }

  evidenceRecords = [record, ...evidenceRecords.filter(item => item.id !== record.id)];
  selectedEvidenceId = record.id;
  lastSavedRecord = record;

  saveEvidenceRecords();
  renderEvidenceTable();
  renderRecentEvidence();
  updateStats();

  document.getElementById("successModalMessage").textContent =
    `${record.id} saved successfully. Status: ${record.sampleStatus}.`;
  document.getElementById("successModal").style.display = "grid";

  if (!isDraft) {
    resetForm();
  }
}

function resetForm() {
  dom.form.reset();
  selectedExam = null;
  selectedCase = null;
  custodyEvents = [];
  evidenceDocumentName = "";
  evidenceDocumentDataUrl = "";
  isEditMode = false;
  dom.evidenceDocumentPreviewWrap.hidden = true;
  renderSourceSummary(null);
  populateExaminationSelect();
  setInitialFormValues();
  setSelectedTests([]);
  renderCustodyTable();
}

function filteredEvidenceRecords() {
  const query = ((dom.evidenceSearch.value || dom.globalSearch.value || "").toLowerCase()).trim();
  const status = dom.evidenceStatusFilter.value;

  return evidenceRecords.filter(record => {
    if (currentDetailsType !== "all" && record.caseType !== currentDetailsType) return false;
    if (status !== "all" && record.sampleStatus !== status) return false;
    if (!query) return true;

    return [
      record.id,
      record.caseId,
      record.examId,
      record.patientId,
      record.patientName,
      record.evidenceCategory,
      record.sampleType,
      record.bodySource,
      record.sealNo,
      record.barcodeNo,
      record.sampleStatus,
      record.storageLocation,
      record.preferredLab,
      (record.requestedTests || []).join(" "),
      (record.custodyEvents || []).map(event => `${event.actionType} ${event.fromUser} ${event.toUser} ${event.sealStatus} ${event.remarks}`).join(" ")
    ].join(" ").toLowerCase().includes(query);
  });
}

function renderEvidenceTable() {
  const data = filteredEvidenceRecords();

  dom.evidenceTableBody.innerHTML = data.map(record => `
    <tr>
      <td><strong>${record.id}</strong></td>
      <td>${display(record.caseId)}<br><small>${display(record.examId)} • ${display(record.patientName)}</small></td>
      <td>${display(record.sampleType)}<br><small>${display(record.evidenceCategory)}</small></td>
      <td>${display(record.sealNo)}</td>
      <td><span class="badge ${statusClass(record.sampleStatus)}">${display(record.sampleStatus)}</span></td>
      <td><span class="badge ${record.labRequired === "Yes" ? "warn" : "light"}">${display(record.labRequired)}</span></td>
      <td><button class="table-action" type="button" data-evidence-id="${record.id}">View</button></td>
    </tr>
  `).join("");

  dom.evidenceEmptyMessage.hidden = data.length !== 0;
}

function renderRecentEvidence() {
  const recent = evidenceRecords.slice(0, 5);

  dom.recentEvidenceBody.innerHTML = recent.map(record => `
    <tr>
      <td><strong>${record.id}</strong></td>
      <td>${display(record.caseId)}</td>
      <td>${display(record.sampleType)}</td>
      <td><span class="badge ${statusClass(record.sampleStatus)}">${display(record.sampleStatus)}</span></td>
      <td>${formatDate(record.updatedAt)}</td>
    </tr>
  `).join("");
}

function updateStats() {
  dom.totalSampleStat.textContent = evidenceRecords.length;
  dom.sealedSampleStat.textContent = evidenceRecords.filter(record => ["Sealed", "Stored", "Archived", "Result Received"].includes(record.sampleStatus)).length;
  dom.labPendingStat.textContent = evidenceRecords.filter(record => record.labRequired === "Yes" && !["Result Received", "Archived"].includes(record.sampleStatus)).length;
}

function renderCustodyTimeline(record) {
  const events = record.custodyEvents || [];
  if (!events.length) {
    return `<p class="empty-state" style="padding:12px;">No custody events recorded.</p>`;
  }

  return events.map((event, index) => `
    <div class="custody-step" data-step="${index + 1}">
      <strong>${display(event.actionType)} • ${display(event.sealStatus)}</strong>
      <small>${display(event.fromUser)} → ${display(event.toUser)} • ${formatDate(event.transferDateTime)}</small>
      <small>Location: ${display(event.location)}</small>
      <p>${display(event.remarks)}</p>
    </div>
  `).join("");
}

function populateFullEvidenceDetails(recordId) {
  const record = evidenceRecords.find(item => item.id === recordId);

  if (!record) {
    dom.fullEvidenceDetailsContainer.style.display = "none";
    return;
  }

  dom.fullEvidenceDetailsContainer.style.display = "block";

  document.getElementById("detHeaderSampleId").textContent = record.id;
  document.getElementById("detHeaderType").textContent = display(record.evidenceCategory);
  document.getElementById("detHeaderType").className = `badge ${record.caseType === "clinical" ? "success" : "warn"}`;
  document.getElementById("detHeaderStatus").textContent = display(record.sampleStatus);
  document.getElementById("detHeaderStatus").className = `badge ${statusClass(record.sampleStatus)}`;
  document.getElementById("detHeaderCasePatient").textContent = `Case: ${display(record.caseId)} • ${display(record.patientName)}`;
  document.getElementById("detHeaderSeal").textContent = `Seal: ${display(record.sealNo)}`;
  document.getElementById("detHeaderCustody").textContent = `${record.custodyEvents?.length || 0} custody events`;

  document.getElementById("detCaseId").textContent = display(record.caseId);
  document.getElementById("detExamId").textContent = display(record.examId);
  document.getElementById("detPatientId").textContent = display(record.patientId);
  document.getElementById("detEvidenceCategory").textContent = display(record.evidenceCategory);
  document.getElementById("detSampleType").textContent = display(record.sampleType);
  document.getElementById("detBodySource").textContent = display(record.bodySource);

  document.getElementById("detCollectedDate").textContent = formatDate(record.collectedDateTime);
  document.getElementById("detCollectedBy").textContent = display(record.collectedBy);
  document.getElementById("detQuantity").textContent = display(record.sampleQuantity);
  document.getElementById("detContainer").textContent = display(record.containerType);
  document.getElementById("detStorageCondition").textContent = display(record.storageCondition);
  document.getElementById("detStorageLocation").textContent = display(record.storageLocation);

  document.getElementById("detLabRequired").textContent = display(record.labRequired);
  document.getElementById("detPreferredLab").textContent = display(record.preferredLab);
  document.getElementById("detRequestedBy").textContent = display(record.requestedBy);
  document.getElementById("detRequestPriority").textContent = display(record.requestPriority);
  document.getElementById("detRequestedTests").textContent = (record.requestedTests || []).join(", ") || "None";

  document.getElementById("detDocumentType").textContent = display(record.documentType);
  document.getElementById("detDocumentName").textContent = display(record.evidenceDocument?.fileName);
  document.getElementById("detAccessLevel").textContent = display(record.accessLevel);
  document.getElementById("detBarcodeNo").textContent = display(record.barcodeNo);
  document.getElementById("detUpdatedAt").textContent = formatDate(record.updatedAt);

  document.getElementById("detCustodyTimeline").innerHTML = renderCustodyTimeline(record);
  document.getElementById("detEvidenceNotes").textContent = display(record.evidenceNotes);
}

function populateFormForEditing(recordId) {
  const record = evidenceRecords.find(item => item.id === recordId);
  if (!record) return;

  isEditMode = true;
  activateTab("entry");

  setValue("sampleId", record.id);
  populateExaminationSelect();
  dom.examinationSelect.value = record.examId;
  selectExamination(record.examId);

  setValue("sampleCaseId", record.caseId);
  setValue("samplePatientId", record.patientId);
  setValue("sampleExamId", record.examId);
  setValue("evidenceCategory", record.evidenceCategory);
  setValue("sampleType", record.sampleType);
  setValue("bodySource", record.bodySource);
  setValue("sampleQuantity", record.sampleQuantity);
  setValue("containerType", record.containerType);
  setValue("evidencePriority", record.evidencePriority);
  setValue("collectedDateTime", record.collectedDateTime);
  setValue("collectedBy", record.collectedBy);
  setValue("sealNo", record.sealNo);
  setValue("barcodeNo", record.barcodeNo);
  setValue("storageCondition", record.storageCondition);
  setValue("storageLocation", record.storageLocation);
  setValue("sampleStatus", record.sampleStatus);
  setValue("chainRequired", record.chainRequired);
  setValue("labRequired", record.labRequired);
  setValue("preferredLab", record.preferredLab);
  setValue("requestedBy", record.requestedBy);
  setValue("requestPriority", record.requestPriority);
  setSelectedTests(record.requestedTests || []);
  setValue("accessLevel", record.accessLevel);
  setValue("documentType", record.documentType);
  setValue("evidenceNotes", record.evidenceNotes);

  custodyEvents = [...(record.custodyEvents || [])];
  evidenceDocumentName = record.evidenceDocument?.fileName || "";
  evidenceDocumentDataUrl = record.evidenceDocument?.preview || "";

  if (evidenceDocumentDataUrl) {
    dom.evidenceDocumentPreview.src = evidenceDocumentDataUrl;
    dom.evidenceDocumentFileName.textContent = evidenceDocumentName;
    dom.evidenceDocumentPreviewWrap.hidden = false;
  }

  renderCustodyTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToLab(record) {
  if (!record) return;
  window.location.href = `LabToxicology.html?caseId=${encodeURIComponent(record.caseId)}&examId=${encodeURIComponent(record.examId)}&sampleId=${encodeURIComponent(record.id)}`;
}

function goToDocuments(record) {
  if (!record) return;
  window.location.href = `Documents.html?caseId=${encodeURIComponent(record.caseId)}&examId=${encodeURIComponent(record.examId)}&sampleId=${encodeURIComponent(record.id)}`;
}

function bindEvents() {
  dom.tabButtons.forEach(button => button.addEventListener("click", () => activateTab(button.dataset.tab)));

  dom.switchButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.context === "entryMode") setEntryMode(button.dataset.type);
      if (button.dataset.context === "details") setDetailsType(button.dataset.type);
    });
  });

  dom.sourceSearchInput.addEventListener("input", () => populateExaminationSelect(dom.sourceSearchInput.value));
  dom.examinationSelect.addEventListener("change", () => selectExamination(dom.examinationSelect.value));
  dom.sampleType.addEventListener("change", () => setSuggestedFieldsFromSample(value("sampleType")));

  dom.btnAddCustodyEvent.addEventListener("click", addCustodyEvent);
  dom.btnClearCustodyEvents.addEventListener("click", () => {
    custodyEvents = [];
    renderCustodyTable();
  });

  dom.custodyTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-delete-custody]");
    if (!button) return;
    custodyEvents = custodyEvents.filter(item => item.id !== button.dataset.deleteCustody);
    renderCustodyTable();
  });

  dom.evidenceDocumentUpload.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;

    evidenceDocumentName = file.name;
    dom.evidenceDocumentFileName.textContent = file.name;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        evidenceDocumentDataUrl = reader.result;
        dom.evidenceDocumentPreview.src = evidenceDocumentDataUrl;
        dom.evidenceDocumentPreviewWrap.hidden = false;
      };
      reader.readAsDataURL(file);
    } else {
      evidenceDocumentDataUrl = "";
      dom.evidenceDocumentPreview.removeAttribute("src");
      dom.evidenceDocumentPreviewWrap.hidden = false;
    }
  });

  dom.btnSaveDraft.addEventListener("click", () => saveEvidence("Draft"));
  dom.btnRegisterEvidence.addEventListener("click", () => saveEvidence(value("sampleStatus") || "Sealed"));
  dom.clearFormBtn.addEventListener("click", resetForm);

  dom.evidenceSearch.addEventListener("input", renderEvidenceTable);
  dom.evidenceStatusFilter.addEventListener("change", renderEvidenceTable);
  dom.globalSearch.addEventListener("input", () => {
    activateTab("records");
    dom.evidenceSearch.value = dom.globalSearch.value;
    renderEvidenceTable();
  });

  dom.evidenceTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-evidence-id]");
    if (!button) return;
    selectedEvidenceId = button.dataset.evidenceId;
    populateFullEvidenceDetails(selectedEvidenceId);
  });

  document.getElementById("btnEditEvidenceDetails").addEventListener("click", () => {
    if (selectedEvidenceId) populateFormForEditing(selectedEvidenceId);
    else alert("Please select an evidence record first.");
  });

  document.getElementById("btnOpenLabPage").addEventListener("click", () => {
    const record = evidenceRecords.find(item => item.id === selectedEvidenceId);
    goToLab(record);
  });

  document.getElementById("btnOpenDocumentsPage").addEventListener("click", () => {
    const record = evidenceRecords.find(item => item.id === selectedEvidenceId);
    goToDocuments(record);
  });

  dom.viewRecentBtn.addEventListener("click", () => activateTab("records"));

  dom.menuBtn.addEventListener("click", () => {
    dom.sidebar.classList.add("open");
    dom.sidebarOverlay.classList.add("active");
  });

  dom.sidebarOverlay.addEventListener("click", () => {
    dom.sidebar.classList.remove("open");
    dom.sidebarOverlay.classList.remove("active");
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      dom.sidebar.classList.remove("open");
      dom.sidebarOverlay.classList.remove("active");
    });
  });

  document.getElementById("btnCloseValidationModal").addEventListener("click", () => {
    document.getElementById("validationModal").style.display = "none";
  });

  dom.btnSuccessClose.addEventListener("click", () => {
    document.getElementById("successModal").style.display = "none";
  });

  dom.btnSuccessGoLab.addEventListener("click", () => goToLab(lastSavedRecord));
  dom.btnSuccessGoDocuments.addEventListener("click", () => goToDocuments(lastSavedRecord));
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    caseId: params.get("caseId"),
    examId: params.get("examId"),
    sampleId: params.get("sampleId")
  };
}

function initFromUrl() {
  const { caseId, examId, sampleId } = readUrlParams();

  if (sampleId) {
    const record = evidenceRecords.find(item => item.id === sampleId);
    if (record) {
      activateTab("records");
      selectedEvidenceId = sampleId;
      populateFullEvidenceDetails(sampleId);
      return;
    }
  }

  if (examId && findExam(examId)) {
    dom.examinationSelect.value = examId;
    selectExamination(examId);
    return;
  }

  if (caseId) {
    const exam = examinationRecords.find(item => item.caseId === caseId);
    if (exam) {
      dom.examinationSelect.value = exam.id;
      selectExamination(exam.id);
    }
  }
}

function init() {
  bindEvents();
  populateExaminationSelect();
  setInitialFormValues();
  renderSourceSummary(null);
  renderCustodyTable();
  renderEvidenceTable();
  renderRecentEvidence();
  updateStats();
  updateTopbarLiveDate();
  initFromUrl();
}

init();
