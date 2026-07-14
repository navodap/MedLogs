const STORAGE_KEY = "medlogs_lab_toxicology_v1";

const sampleResults = [
  {
    id: "LAB-2026-0003",
    caseType: "Autopsy",
    caseId: "PM-2026-000045",
    personName: "Saman Kumara",
    legalRef: "INQ-2026-337",
    requestedBy: "Dr. K. Rajapaksha",
    requestDate: "2026-06-29",
    priority: "Court Priority",
    specimenType: "Blood",
    sampleId: "SMP-2026-0142",
    collectedAt: "2026-06-29T11:20",
    collectedBy: "Dr. K. Rajapaksha",
    sealNo: "SEAL-88421",
    custodyStatus: "Complete",
    sentAt: "2026-06-29T14:30",
    receivedAt: "2026-06-30T09:15",
    custodyNotes: "Blood sample sealed and handed over through police escort to Government Analyst.",
    testCategory: "Toxicology - Poison",
    resultStatus: "Pending",
    resultDate: "",
    labName: "Government Analyst Department",
    analyst: "Pending assignment",
    findings: "Result not received yet.",
    interpretation: "Cause of death opinion pending toxicology result.",
    reportType: "Postmortem Report",
    reviewStatus: "Needs JMO Review",
    reviewedBy: "",
    reviewedDate: ""
  },
  {
    id: "LAB-2026-0002",
    caseType: "Clinical",
    caseId: "CL-2026-000122",
    personName: "Kasun Silva",
    legalRef: "MLEF/KDW/2026/219",
    requestedBy: "Dr. T. Wijesinghe",
    requestDate: "2026-06-27",
    priority: "Normal",
    specimenType: "Urine",
    sampleId: "SMP-2026-0138",
    collectedAt: "2026-06-27T12:15",
    collectedBy: "MO Medico-Legal",
    sealNo: "SEAL-88396",
    custodyStatus: "Complete",
    sentAt: "2026-06-27T15:00",
    receivedAt: "2026-06-28T08:40",
    custodyNotes: "Urine sample sent with signed custody form.",
    testCategory: "Toxicology - Alcohol",
    resultStatus: "Received - Positive",
    resultDate: "2026-07-02",
    labName: "Hospital Toxicology Laboratory",
    analyst: "Dr. L. Fernando",
    findings: "Ethanol detected above screening threshold. Other tested drugs not detected.",
    interpretation: "Finding should be reviewed against alleged road traffic accident history.",
    reportType: "Medico-Legal Report",
    reviewStatus: "Reviewed",
    reviewedBy: "Dr. T. Wijesinghe",
    reviewedDate: "2026-07-03"
  },
  {
    id: "LAB-2026-0001",
    caseType: "Clinical",
    caseId: "CL-2026-000121",
    personName: "Restricted record",
    legalRef: "MLEF/KLN/2026/176",
    requestedBy: "Dr. A. Peris",
    requestDate: "2026-06-24",
    priority: "Restricted Case",
    specimenType: "Swab",
    sampleId: "SMP-2026-0129",
    collectedAt: "2026-06-24T16:10",
    collectedBy: "Dr. A. Peris",
    sealNo: "",
    custodyStatus: "Seal Number Missing",
    sentAt: "2026-06-24T17:30",
    receivedAt: "2026-06-25T10:00",
    custodyNotes: "Restricted sexual assault record. Seal number must be verified before final report approval.",
    testCategory: "DNA / Serology",
    resultStatus: "Received - Negative",
    resultDate: "2026-07-01",
    labName: "Forensic DNA Laboratory",
    analyst: "Dr. M. Silva",
    findings: "No reportable foreign DNA profile detected in submitted swab.",
    interpretation: "Result reviewed with examination findings. Access remains restricted.",
    reportType: "Medico-Legal Report",
    reviewStatus: "Approved For Final Report",
    reviewedBy: "Dr. A. Peris",
    reviewedDate: "2026-07-02"
  }
];

const dom = {
  tabButtons: document.querySelectorAll(".tab-btn"),
  entryPanel: document.getElementById("entryPanel"),
  recordsPanel: document.getElementById("recordsPanel"),
  modeButtons: document.querySelectorAll(".case-switch-btn"),
  form: document.getElementById("resultForm"),
  resultId: document.getElementById("resultId"),
  resultTableBody: document.getElementById("resultTableBody"),
  recentBody: document.getElementById("recentBody"),
  resultDetailCard: document.getElementById("resultDetailCard"),
  resultSearch: document.getElementById("resultSearch"),
  statusFilter: document.getElementById("statusFilter"),
  emptyMessage: document.getElementById("emptyMessage"),
  clearFormBtn: document.getElementById("clearFormBtn"),
  saveDraftBtn: document.getElementById("saveDraftBtn"),
  viewRecentBtn: document.getElementById("viewRecentBtn"),
  menuBtn: document.querySelector(".menu-btn"),
  sidebar: document.querySelector(".sidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  dateDisplay: document.getElementById("currentDateDisplay"),
  dayDisplay: document.getElementById("currentDayDisplay"),
  toast: document.getElementById("toast"),
  pendingResultsCount: document.getElementById("pendingResultsCount"),
  positiveResultsCount: document.getElementById("positiveResultsCount"),
  readyResultsCount: document.getElementById("readyResultsCount"),
  pendingResultsNote: document.getElementById("pendingResultsNote"),
  positiveResultsNote: document.getElementById("positiveResultsNote"),
  readyResultsNote: document.getElementById("readyResultsNote")
};

let records = loadRecords();
let selectedResultId = records[0]?.id || null;

function loadRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleResults];
  } catch (error) {
    console.warn("Saved lab results could not be read. Sample results were loaded.", error);
    return [...sampleResults];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function pad(number, size = 4) {
  return String(number).padStart(size, "0");
}

function currentYear() {
  return new Date().getFullYear();
}

function generateResultId() {
  const year = currentYear();
  const highest = records.reduce((max, record) => {
    const parts = record.id.split("-");
    if (parts[1] !== String(year)) return max;
    const number = Number(parts[2]);
    return Number.isFinite(number) && number > max ? number : max;
  }, 0);
  return `LAB-${year}-${pad(highest + 1)}`;
}

function showToast(message) {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => dom.toast.classList.remove("show"), 2600);
}

function setActiveTab(tab) {
  dom.tabButtons.forEach(button => button.classList.toggle("active", button.dataset.tab === tab));
  dom.entryPanel.classList.toggle("active", tab === "entry");
  dom.recordsPanel.classList.toggle("active", tab === "records");
  dom.modeButtons.forEach(button => button.classList.toggle("active", button.dataset.mode === tab));
}

function isCustodyAlert(record) {
  return record.custodyStatus !== "Complete" || !record.sealNo;
}

function isReady(record) {
  return record.reviewStatus === "Approved For Final Report";
}

function statusClass(status) {
  if (status === "Pending") return "pending";
  if (status === "Received - Positive" || status === "Rejected Sample") return "positive";
  if (status === "Received - Negative") return "negative";
  return "";
}

function formatDateTime(value) {
  return value ? value.replace("T", " ") : "Not recorded";
}

function field(label, value) {
  return `
    <div class="field-row">
      <dt>${label}</dt>
      <dd>${value || "Not recorded"}</dd>
    </div>
  `;
}

function formValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function renderStats() {
  const pending = records.filter(record => record.resultStatus === "Pending").length;
  const positive = records.filter(record => record.resultStatus === "Received - Positive").length;
  const ready = records.filter(isReady).length;

  dom.pendingResultsCount.textContent = pending;
  dom.positiveResultsCount.textContent = positive;
  dom.readyResultsCount.textContent = ready;
  dom.pendingResultsNote.textContent = pending ? `${pending} result${pending === 1 ? "" : "s"} awaiting lab` : "No pending lab reports";
  dom.positiveResultsNote.textContent = positive ? `${positive} positive finding${positive === 1 ? "" : "s"}` : "No positive toxicology alerts";
  dom.readyResultsNote.textContent = ready ? `${ready} approved for reports` : "No approved result links yet";
}

function matchesFilters(record) {
  const query = dom.resultSearch.value.trim().toLowerCase();
  const status = dom.statusFilter.value;
  const queryMatch = !query || Object.values(record).join(" ").toLowerCase().includes(query);
  const statusMatch = status === "all" || record.resultStatus === status;
  return queryMatch && statusMatch;
}

function renderTable() {
  const visible = records.filter(matchesFilters);
  dom.resultTableBody.innerHTML = "";
  dom.emptyMessage.hidden = visible.length > 0;

  visible.forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${record.id}</strong><br><small>${record.testCategory}</small></td>
      <td>${record.caseId}<br><small>${record.personName}</small></td>
      <td>${record.specimenType}<br><small>${record.sampleId}</small></td>
      <td><span class="status-pill ${statusClass(record.resultStatus)}">${record.resultStatus}</span></td>
      <td><span class="status-pill ${isReady(record) ? "ready" : "pending"}">${record.reviewStatus}</span></td>
      <td><button type="button" class="text-btn" data-view-result="${record.id}">View</button></td>
    `;
    dom.resultTableBody.appendChild(row);
  });
}

function renderRecent() {
  dom.recentBody.innerHTML = "";
  records.slice(0, 5).forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.id}</td>
      <td>${record.caseId}</td>
      <td>${record.specimenType}</td>
      <td>${record.resultStatus}</td>
      <td>${record.reviewStatus}</td>
    `;
    dom.recentBody.appendChild(row);
  });
}

function renderDetail() {
  const record = records.find(item => item.id === selectedResultId) || records[0];
  if (!record) {
    dom.resultDetailCard.innerHTML = `<p class="empty-state">Select a result to preview details.</p>`;
    return;
  }

  dom.resultDetailCard.innerHTML = `
    <h3>${record.id}</h3>
    <div class="detail-meta">
      <span class="status-pill ${statusClass(record.resultStatus)}">${record.resultStatus}</span>
      <span class="status-pill ${isCustodyAlert(record) ? "alert" : "ready"}">${isCustodyAlert(record) ? "Custody alert" : "Custody complete"}</span>
      <span class="status-pill ${isReady(record) ? "ready" : "pending"}">${record.reviewStatus}</span>
    </div>
    <section class="detail-section">
      <h4>Case Link</h4>
      <dl class="field-list">
        ${field("Case Type", record.caseType)}
        ${field("Case ID", record.caseId)}
        ${field("Name", record.personName)}
        ${field("Legal Ref", record.legalRef)}
        ${field("Requested By", record.requestedBy)}
        ${field("Request Date", record.requestDate)}
      </dl>
    </section>
    <section class="detail-section">
      <h4>Specimen Custody</h4>
      <dl class="field-list">
        ${field("Specimen", record.specimenType)}
        ${field("Sample ID", record.sampleId)}
        ${field("Collected", formatDateTime(record.collectedAt))}
        ${field("Collected By", record.collectedBy)}
        ${field("Seal No", record.sealNo)}
        ${field("Custody", record.custodyStatus)}
        ${field("Notes", record.custodyNotes)}
      </dl>
    </section>
    <section class="detail-section">
      <h4>Findings</h4>
      <dl class="field-list">
        ${field("Category", record.testCategory)}
        ${field("Lab", record.labName)}
        ${field("Analyst", record.analyst)}
        ${field("Result Date", record.resultDate)}
        ${field("Findings", record.findings)}
        ${field("Interpretation", record.interpretation)}
      </dl>
    </section>
    <section class="detail-section">
      <h4>Report Linkage</h4>
      <dl class="field-list">
        ${field("Report Type", record.reportType)}
        ${field("Reviewed By", record.reviewedBy)}
        ${field("Reviewed Date", record.reviewedDate)}
      </dl>
    </section>
  `;
}

function renderAll() {
  dom.resultId.value = generateResultId();
  renderStats();
  renderTable();
  renderRecent();
  renderDetail();
}

function buildRecordFromForm() {
  return {
    id: dom.resultId.value || generateResultId(),
    caseType: formValue("caseType"),
    caseId: formValue("caseId"),
    personName: formValue("personName"),
    legalRef: formValue("legalRef"),
    requestedBy: formValue("requestedBy"),
    requestDate: formValue("requestDate"),
    priority: formValue("priority"),
    specimenType: formValue("specimenType"),
    sampleId: formValue("sampleId"),
    collectedAt: formValue("collectedAt"),
    collectedBy: formValue("collectedBy"),
    sealNo: formValue("sealNo"),
    custodyStatus: formValue("custodyStatus"),
    sentAt: formValue("sentAt"),
    receivedAt: formValue("receivedAt"),
    custodyNotes: formValue("custodyNotes"),
    testCategory: formValue("testCategory"),
    resultStatus: formValue("resultStatus"),
    resultDate: formValue("resultDate"),
    labName: formValue("labName"),
    analyst: formValue("analyst"),
    findings: formValue("findings"),
    interpretation: formValue("interpretation"),
    reportType: formValue("reportType"),
    reviewStatus: formValue("reviewStatus"),
    reviewedBy: formValue("reviewedBy"),
    reviewedDate: formValue("reviewedDate")
  };
}

function resetForm() {
  dom.form.reset();
  dom.resultId.value = generateResultId();
}

function updateDateBox() {
  const now = new Date();
  dom.dateDisplay.textContent = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  dom.dayDisplay.textContent = now.toLocaleDateString("en-GB", { weekday: "long" });
}

dom.form.addEventListener("submit", event => {
  event.preventDefault();
  if (!dom.form.reportValidity()) return;
  const record = buildRecordFromForm();
  records.unshift(record);
  selectedResultId = record.id;
  saveRecords();
  resetForm();
  setActiveTab("records");
  renderAll();
  showToast(`${record.id} saved successfully.`);
});

dom.tabButtons.forEach(button => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

dom.modeButtons.forEach(button => {
  button.addEventListener("click", () => setActiveTab(button.dataset.mode));
});

dom.resultSearch.addEventListener("input", renderTable);
dom.statusFilter.addEventListener("change", renderTable);

dom.clearFormBtn.addEventListener("click", () => {
  resetForm();
  showToast("Form cleared.");
});

dom.saveDraftBtn.addEventListener("click", () => {
  showToast("Draft saved in this template session.");
});

dom.viewRecentBtn.addEventListener("click", () => setActiveTab("records"));

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view-result]");
  if (viewButton) {
    selectedResultId = viewButton.dataset.viewResult;
    renderDetail();
  }
});

dom.menuBtn.addEventListener("click", () => {
  dom.sidebar.classList.add("open");
  dom.sidebarOverlay.classList.add("show");
});

dom.sidebarOverlay.addEventListener("click", () => {
  dom.sidebar.classList.remove("open");
  dom.sidebarOverlay.classList.remove("show");
});

updateDateBox();
renderAll();

