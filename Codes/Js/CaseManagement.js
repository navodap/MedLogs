const STORAGE_KEY = "fmdis_cases_v2";

const sampleCases = [];

const clinicalCategories = ["Accident", "Assault", "Sexual Assault", "Toxicology", "Detainee Examination", "Age Estimation", "DNA Sampling"];
const autopsyCategories = ["Natural Death", "Accidental Death", "Suicidal Death", "Homicidal Death", "Undetermined Death"];

const ALWAYS_LOCKED = ["caseId", "caseTypeDisplay", "registeredDateTime", "caseStatus"];

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
  dom.caseId.value = generateCaseId(currentRegistrationType);
  dom.registeredDateTime.value = localDateTimeValue();
  dom.assignedDate.value = dateValue();
  dom.caseType.value = currentRegistrationType;
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
      if (document.getElementById("caseTypeDisplay")) document.getElementById("caseTypeDisplay").value = "Autopsy";
      dom.caseId.value = generateCaseId("autopsy");
      document.getElementById("personSearchLabel").firstChild.textContent = "Search Existing Deceased Person ";
      document.getElementById("personIdLabel").firstChild.textContent = "Deceased Person ID * ";
    } else {
      if (dom.formHeader) dom.formHeader.textContent = "Register a Medico-Legal Case";
      if (dom.submitBtn) dom.submitBtn.textContent = "Register Clinical Case";
      if (document.getElementById("caseTypeDisplay")) document.getElementById("caseTypeDisplay").value = "Clinical";
      dom.caseId.value = generateCaseId("clinical");
      document.getElementById("personSearchLabel").firstChild.textContent = "Search Existing Patient ";
      document.getElementById("personIdLabel").firstChild.textContent = "Patient ID * ";
    }
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

  return {
    id: value("caseId") || generateCaseId(type),
    type,
    status: value("caseStatus") || "Registered",
    registeredDateTime: value("registeredDateTime"),
    registeredBy: value("registeredBy"),
    casePriority: value("casePriority"),

    patientId: value("patientId"),
    patientName: value("patientName"),
    patientNic: value("patientNic"),
    patientDob: value("patientDob"),
    patientAge: value("patientAge"),
    patientGender: value("patientGender"),
    patientContact: value("patientContact"),
    patientBht: value("patientBht"),
    patientAddress: value("patientAddress"),
    identificationStatus: value("identificationStatus"),

    category: isClinical ? value("caseCategory") : value("autopsyCategory"),
    confidentiality: value("confidentiality") || "Normal",

    mlefNo: value("mlefNo"),
    mlefFormNo: value("mlefFormNo"),
    mlefDate: value("mlefDate"),
    mlefIssuedBy: value("mlefIssuedBy"),
    clinicalReason: value("clinicalReason"),
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
    mannerOfDeath: value("mannerOfDeath"),
    orderType: value("orderType"),
    inquestNo: value("inquestNo"),
    orderDate: value("orderDate"),
    orderedBy: value("orderedBy"),
    pmRegistryNo: value("pmRegistryNo"),
    bodyTagNumber: value("bodyTagNumber"),
    bodyReceivedDateTime: value("bodyReceivedDateTime"),
    placeOfPM: value("placeOfPM"),
    bodyCondition: value("bodyCondition"),
    causeSummary: value("causeSummary"),

    policeStation: value("policeStation"),
    policeDivision: value("policeDivision"),
    policeOfficer: value("policeOfficer"),
    policeOfficerContact: value("policeOfficerContact"),

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
    expectedReportType: value("expectedReportType"),
    expectedSubmissionDate: value("expectedSubmissionDate")
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

  return missing;
}

function resetForm() {
  dom.caseForm.reset();
  isEditMode = false;
  activateCaseType("registration", currentRegistrationType);
  setInitialFormValues();
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

  // Reveal Container
  container.style.display = "block";

  // A. Header Sync Elements
  document.getElementById("detHeaderId").textContent = record.id;
  document.getElementById("detHeaderType").textContent = record.type === "clinical" ? "Clinical Case" : "Autopsy Case";
  document.getElementById("detHeaderStatus").textContent = display(record.status);
  document.getElementById("detHeaderStatus").className = `badge ${statusClass(record.status)}`;
  document.getElementById("detHeaderPatient").textContent = `Patient: ${display(record.patientName)}`;
  document.getElementById("detHeaderConfidentiality").textContent = display(record.confidentiality);
  document.getElementById("detHeaderConfidentiality").className = `badge ${record.confidentiality === "Restricted" ? "danger" : "light"}`;
  document.getElementById("detHeaderPriority").textContent = display(record.casePriority || "Normal");

  // B. Basic Block Information
  document.getElementById("detBasicDateTime").textContent = formatDate(record.registeredDateTime);
  document.getElementById("detBasicBy").textContent = display(record.registeredBy || "Administrative Clerk");

  // C. Patient Target Block
  document.getElementById("detPatId").textContent = display(record.patientId);
  document.getElementById("detPatName").textContent = display(record.patientName);
  document.getElementById("detPatAgeGender").textContent = `${display(record.patientAge || "34 Years")} / ${display(record.patientGender || "Male")}`;
  document.getElementById("detPatNic").textContent = display(record.patientNic || "Not recorded");
  document.getElementById("detPatBht").textContent = display(record.patientBht || "Not recorded");
  document.getElementById("detPatContact").textContent = display(record.patientContact || "Not recorded");

  // D. Clinical Evaluation Properties
  document.getElementById("detClinCategory").textContent = display(record.category);
  document.getElementById("detClinReason").textContent = display(record.clinicalReason);
  document.getElementById("detClinHistory").textContent = display(record.patientHistory);
  document.getElementById("detClinHarm").textContent = display(record.natureOfHarm);
  document.getElementById("detClinWeapon").textContent = display(record.natureOfWeapon);
  document.getElementById("detClinHurt").textContent = display(record.hurtCategory);
  document.getElementById("detClinAlcohol").textContent = display(record.alcoholStatus);
  document.getElementById("detClinDrug").textContent = display(record.drugStatus);

  // E. Referrals & Core MLEF Matrix Trackers
  document.getElementById("detMlefNoForm").textContent = `${display(record.mlefNo)} ${record.mlefFormNo ? ' / ' + record.mlefFormNo : ''}`;
  document.getElementById("detMlefDate").textContent = formatDate(record.mlefDate);
  document.getElementById("detMlefReceived").textContent = formatDate(record.mlefReceivedDateTime);
  document.getElementById("detMlefIssuedBy").textContent = display(record.mlefIssuedBy);
  document.getElementById("detMlefSource").textContent = display(record.referralSource || record.referralDocument);
  document.getElementById("detMlefPoliceRef").textContent = display(record.policeRef);

  // F. Police Unit Fields
  document.getElementById("detPolStationDiv").textContent = `${display(record.policeStation)} ${record.policeDivision ? ' / ' + record.policeDivision : ''}`;
  document.getElementById("detPolOfficer").textContent = display(record.policeOfficer);
  document.getElementById("detPolRankReg").textContent = `${display(record.policeOfficerRank || "PC")} [${display(record.policeOfficerRegNo || "N/A")}]`;
  document.getElementById("detPolContact").textContent = display(record.policeOfficerContact);
  document.getElementById("detPolStatement").textContent = display(record.policeStatementReceived || "No");

  // G. Hospital Ward Properties
  document.getElementById("detHospSource").textContent = display(record.patientSource);
  document.getElementById("detHospName").textContent = display(record.hospital);
  document.getElementById("detHospWardBed").textContent = record.wardBed ? `${record.wardBed} ${record.bedNo ? '/ Bed ' + record.bedNo : ''}` : "Not recorded";
  document.getElementById("detHospAdmitted").textContent = formatDate(record.admittedDateTime);
  document.getElementById("detHospDischarged").textContent = formatDate(record.dischargedDateTime);
  document.getElementById("detHospExamined").textContent = formatDate(record.examDateTime);

  // H. Incident Properties
  document.getElementById("detIncDateTime").textContent = formatDate(record.incidentDateTime);
  document.getElementById("detIncPlace").textContent = display(record.placeOfIncident);
  document.getElementById("detIncType").textContent = display(record.allegedIncidentType || record.category);

  // I. Diagnostics Flag Processing Engine
  document.getElementById("detReqExam").textContent = display(record.examRequired || "Yes");
  document.getElementById("detReqDateTime").textContent = formatDate(record.preferredExamDateTime);
  document.getElementById("detReqLocation").textContent = display(record.examLocation);
  document.getElementById("detReqSpecialist").textContent = display(record.specialistReferral || "None");
  
  // Conditionally format diagnostic checkbox arrays strings
  let diagnostics = [];
  if (record.reqXray) diagnostics.push("X-Ray");
  if (record.reqCt) diagnostics.push("CT Scan");
  if (record.reqBlood) diagnostics.push("Blood Analysis");
  if (record.reqUrine) diagnostics.push("Urine Toxicology");
  if (record.reqSwabs) diagnostics.push("Forensic Swabs");
  if (record.reqDna) diagnostics.push("DNA Sample");
  if (record.reqPhotos) diagnostics.push("Injury Photos");
  document.getElementById("detReqDiagnostics").textContent = diagnostics.length ? diagnostics.join(", ") : "None Requested";
  document.getElementById("detReqInstructions").textContent = display(record.examSpecialInstructions);

  // J. JMO Doctor Roster Assignments
  document.getElementById("detDocPrimary").textContent = display(record.primaryDoctor);
  document.getElementById("detDocAssisting").textContent = record.assistingDoctors && record.assistingDoctors.length ? record.assistingDoctors.join(", ") : "None Assigned";
  document.getElementById("detDocSupervisor").textContent = display(record.supervisingConsultant || "None");
  document.getElementById("detDocFemaleReq").textContent = display(record.femaleDoctorRequired || "No");
  document.getElementById("detDocNotes").textContent = display(record.assignmentNotes);

  // K. Legal Court Properties
  document.getElementById("detCourtName").textContent = display(record.courtName);
  document.getElementById("detCourtRef").textContent = display(record.courtRef);
  document.getElementById("detCourtTrialDate").textContent = formatDate(record.trialDate);
  document.getElementById("detCourtSubmission").textContent = display(record.courtSubmissionRequired || "No");
  document.getElementById("detCourtRemarks").textContent = display(record.courtRemarks);

  // L. Verification Document Upload Subsystem State Simulator
  const docsList = document.getElementById("detDocumentsList");
  const docFields = [
    { label: "MLEF Document", provided: true }, // Required context
    { label: "Police Request Letter", provided: !!record.policeRef },
    { label: "Police Statement", provided: record.policeStatementReceived === "Yes" },
    { label: "Consent Form", provided: record.confidentiality === "Restricted" },
    { label: "Hospital Admission Record", provided: record.patientSource === "In-ward Patient" }
  ];
  docsList.innerHTML = docFields.map(f => `
    <div style="display:flex; justify-content:space-between; padding:4px; background:var(--soft); border-radius:4px;">
      <span>${f.label}</span>
      <span style="color:${f.provided ? 'var(--green-700)':'var(--muted)'}; font-weight:bold;">${f.provided ? '✓ Uploaded' : '⏳ Pending'}</span>
    </div>
  `).join("");

  // M. Medico-Legal Report Tracker Metrics
  document.getElementById("detRepType").textContent = display(record.expectedReportType || "Medico-Legal Report");
  document.getElementById("detRepStatus").textContent = display(record.reportStatus || "Not Started");
  document.getElementById("detRepDate").textContent = formatDate(record.expectedSubmissionDate);
  document.getElementById("detRepRemarks").textContent = display(record.reportRemarks);
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

function bindEvents() {
  dom.tabButtons.forEach(button => button.addEventListener("click", () => activateTab(button.dataset.tab)));
  dom.caseSwitchButtons.forEach(button => button.addEventListener("click", () => activateCaseType(button.dataset.context, button.dataset.type)));
  dom.caseForm.addEventListener("submit", saveCase);
  dom.clearFormBtn.addEventListener("click", resetForm);

  ["minor", "sexualAssault"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", () => {
      const minor = value("minor") === "Yes";
      const sexualAssault = value("sexualAssault") === "Yes";
      if (minor || sexualAssault) {
        document.getElementById("confidentiality").value = "Restricted";
      }
    });
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
  renderPreview();
  renderLinkedRecords();
  renderRecentRecords();
  renderCaseTable();
  renderStats();
  applyRolePermissions();
}

init();
