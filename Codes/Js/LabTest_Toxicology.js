const LAB_STORAGE_KEY = "fmdis_lab_requests_v1";

function loadLabRequests() {
  try {
    const stored = localStorage.getItem(LAB_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Saved lab requests could not be read.", error);
    return [];
  }
}

function saveLabRequests() {
  try {
    localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(labRequests));
  } catch (error) {
    console.warn("Lab requests could not be saved.", error);
  }
}

const labRequests = loadLabRequests();

let currentPage = 1;
const ROWS_PER_PAGE = 10;

const tableBody = document.getElementById("requestTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const caseTypeFilter = document.getElementById("caseTypeFilter");
const testTypeFilter = document.getElementById("testTypeFilter");
const statusFilter = document.getElementById("statusFilter");
const resetFiltersButton = document.getElementById("resetFiltersButton");
const resultCountText = document.getElementById("resultCountText");
const tabs = document.querySelectorAll(".tab");
const tableTitle = document.getElementById("tableTitle");
const tableSubtitle = document.getElementById("tableSubtitle");
const exportButton = document.getElementById("exportButton");
const newRequestModal = document.getElementById("newRequestModal");
const detailsModal = document.getElementById("detailsModal");
const newRequestForm = document.getElementById("newRequestForm");
const openNewRequestButton = document.getElementById("openNewRequestButton");
const saveDraftButton = document.getElementById("saveDraftButton");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const sidebar = document.getElementById("sidebar");
const toast = document.getElementById("toast");

const ROLE_KEY = "fmdis_active_role_v1";
const roleSelect = document.getElementById("roleSelect");
let activeRole = localStorage.getItem(ROLE_KEY) || "JMO";
roleSelect.value = activeRole;

roleSelect.addEventListener("change", () => {
  activeRole = roleSelect.value;
  localStorage.setItem(ROLE_KEY, activeRole);
  if (!detailsModal.hidden && selectedRequest) renderWorkflowBar();
});

let activeTab = "all";
let selectedRequest = null;
let toastTimer = null;

const tabConfig = {
  all: {
    title: "Laboratory Test Requests",
    subtitle: "All requests linked to clinical and postmortem cases."
  },
  samples: {
    title: "Samples Received",
    subtitle: "Requests with specimens received by the laboratory."
  },
  results: {
    title: "Laboratory Results",
    subtitle: "Requests with results entered or verified."
  },
  approval: {
    title: "Pending Approval",
    subtitle: "Results waiting for laboratory verification or JMO review."
  },
  completed: {
    title: "Completed Tests",
    subtitle: "Completed and reviewed laboratory investigations."
  }
};

const mandatoryRequestFields = [
  "caseIdInput",
  "caseTypeInput",
  "personNameInput",
  "testTypeInput",
  "specificTestInput",
  "reasonInput",
  "sampleTypeInput",
  "priorityInput",
  "laboratoryInput",
  "requestingJmoInput"
];

function getMissingMandatoryField() {
  return mandatoryRequestFields
    .map((fieldId) => document.getElementById(fieldId))
    .find((field) => !field.value.trim());
}

function normalizeClassName(value) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function formatDate(dateString) {
  if (!dateString || dateString === "Not received") return dateString || "—";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getFilteredRequests() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return labRequests.filter((request) => {
    const matchesSearch = [
      request.requestId,
      request.caseId,
      request.personName,
      request.sampleId,
      request.testType,
      request.specificTest
    ].some((value) => String(value).toLowerCase().includes(searchTerm));

    const matchesCaseType =
      caseTypeFilter.value === "all" || request.caseType === caseTypeFilter.value;

    const matchesTestType =
      testTypeFilter.value === "all" || request.testType === testTypeFilter.value;

    const matchesStatus =
      statusFilter.value === "all" || request.status === statusFilter.value;

    const matchesTab = (() => {
      switch (activeTab) {
        case "samples":
          return !["Pending", "Draft"].includes(request.status);
        case "results":
          return ["Awaiting Review", "Completed"].includes(request.status);
        case "approval":
          return request.status === "Awaiting Review";
        case "completed":
          return request.status === "Completed";
        default:
          return true;
      }
    })();

    return matchesSearch && matchesCaseType && matchesTestType && matchesStatus && matchesTab;
  });
}

function renderPagination(totalPages) {
  const container = document.getElementById("paginationButtons");
  container.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    currentPage--;
    renderTable();
  });
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("current-page");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTable();
    });
    container.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    currentPage++;
    renderTable();
  });
  container.appendChild(nextBtn);
}

function renderTable() {
  const requests = getFilteredRequests();
  tableBody.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(requests.length / ROWS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRequests = requests.slice(start, start + ROWS_PER_PAGE);

  pageRequests.forEach((request) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <span class="mono">${request.requestId}</span>
      </td>
      <td>
        <span class="cell-primary">${request.caseId}</span>
        <span class="cell-secondary">${request.personName} · ${request.caseType}</span>
      </td>
      <td>
        <span class="cell-primary">${request.testType}</span>
        <span class="cell-secondary">${request.specificTest}</span>
      </td>
      <td>
        <span class="cell-primary">${request.sampleType}</span>
        <span class="cell-secondary">${request.sampleId}</span>
      </td>
      <td>${formatDate(request.requestedDate)}</td>
      <td>
        <span class="badge priority-${normalizeClassName(request.priority)}">${request.priority}</span>
      </td>
      <td>
        <span class="badge ${normalizeClassName(request.status)}">${request.status}</span>
      </td>
      <td class="actions-column">
        ${request.status === "Draft"
          ? `<button class="action-button submit-action" type="button" data-submit-request="${request.requestId}">Submit</button>`
          : ""}
        <button class="action-button" type="button" data-view-request="${request.requestId}">
          View
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  emptyState.hidden = requests.length !== 0;
  tableBody.closest("table").style.display = requests.length ? "table" : "none";
  const from = requests.length ? start + 1 : 0;
  const to = Math.min(start + ROWS_PER_PAGE, requests.length);
  resultCountText.textContent = `Showing ${from}–${to} of ${requests.length} request${requests.length === 1 ? "" : "s"}`;

  document.querySelectorAll("[data-view-request]").forEach((button) => {
    button.addEventListener("click", () => {
      openRequestDetails(button.dataset.viewRequest);
    });
  });

  document.querySelectorAll("[data-submit-request]").forEach((button) => {
    button.addEventListener("click", () => {
      submitDraft(button.dataset.submitRequest);
    });
  });

  updateSummaryCounts();
  renderNotifications();
  renderPagination(totalPages);
}

function updateSummaryCounts() {
  const count = (status) => labRequests.filter((item) => item.status === status).length;

  document.getElementById("pendingCount").textContent = count("Pending");
  document.getElementById("progressCount").textContent =
    count("In Progress") + count("Sample Received");
  document.getElementById("reviewCount").textContent = count("Awaiting Review");
  document.getElementById("completedCount").textContent = count("Completed");
  document.getElementById("urgentCount").textContent = labRequests.filter((item) =>
    ["Urgent", "Court Urgent", "Emergency"].includes(item.priority)
  ).length;
}

function setActiveTab(tabName) {
  activeTab = tabName;
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  tableTitle.textContent = tabConfig[tabName].title;
  tableSubtitle.textContent = tabConfig[tabName].subtitle;
  renderTable();
}

function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function openRequestDetails(requestId) {
  selectedRequest = labRequests.find((request) => request.requestId === requestId);
  if (!selectedRequest) return;

  document.getElementById("detailsModalTitle").textContent =
    `${selectedRequest.testType} Request`;
  document.getElementById("detailsModalSubtitle").textContent =
    `${selectedRequest.personName} · ${selectedRequest.caseId}`;

  document.getElementById("detailRequestId").textContent = selectedRequest.requestId;
  document.getElementById("detailCaseId").textContent = selectedRequest.caseId;
  document.getElementById("detailPriority").textContent = selectedRequest.priority;
  document.getElementById("detailStatus").textContent = selectedRequest.status;

  document.getElementById("detailPerson").textContent = selectedRequest.personName;
  document.getElementById("detailCaseType").textContent = selectedRequest.caseType;
  document.getElementById("detailReference").textContent = selectedRequest.referenceNumber;
  document.getElementById("detailJmo").textContent = selectedRequest.requestingJmo;
  document.getElementById("detailTestType").textContent = selectedRequest.testType;
  document.getElementById("detailSpecificTest").textContent = selectedRequest.specificTest;
  document.getElementById("detailLaboratory").textContent = selectedRequest.laboratory;
  document.getElementById("detailRequestedDate").textContent =
    formatDate(selectedRequest.requestedDate);

  document.getElementById("detailSampleId").textContent = selectedRequest.sampleId;
  document.getElementById("detailSampleType").textContent = selectedRequest.sampleType;
  document.getElementById("detailSeal").textContent = selectedRequest.sealNumber;
  document.getElementById("detailSampleCondition").textContent =
    selectedRequest.sampleCondition;
  document.getElementById("detailStorage").textContent =
    selectedRequest.storageCondition;

  document.getElementById("detailLabRef").textContent = selectedRequest.labReference;
  document.getElementById("detailReceivedDate").textContent =
    formatDate(selectedRequest.receivedDate);
  document.getElementById("detailAnalyst").textContent = selectedRequest.analyst;
  document.getElementById("detailMethod").textContent = selectedRequest.method;
  document.getElementById("detailQuality").textContent = selectedRequest.qualityControl;

  document.getElementById("detailResultSummary").innerHTML =
    selectedRequest.resultSummary;

  document.getElementById("approvalEntered").textContent =
    selectedRequest.approval.entered;
  document.getElementById("approvalVerified").textContent =
    selectedRequest.approval.verified;
  document.getElementById("approvalJmo").textContent =
    selectedRequest.approval.jmo;

  const verificationIcon = document.getElementById("verificationIcon");
  const jmoReviewIcon = document.getElementById("jmoReviewIcon");

  verificationIcon.classList.toggle(
    "complete",
    !selectedRequest.approval.verified.toLowerCase().includes("pending") &&
      !selectedRequest.approval.verified.toLowerCase().includes("not")
  );

  jmoReviewIcon.classList.toggle(
    "complete",
    selectedRequest.status === "Completed"
  );

  document.getElementById("submitDraftButton").hidden =
    selectedRequest.status !== "Draft";

  renderProgressTimeline(selectedRequest.status);
  renderHistory(selectedRequest.history);
  renderWorkflowBar();
  setDetailTab("overview");
  openModal(detailsModal);
}

function renderProgressTimeline(status) {
  const stages = [
    "Request Created",
    "Sample Collected",
    "Received by Lab",
    "Testing",
    "Result Entered",
    "JMO Reviewed"
  ];

  const completionMap = {
    Pending: 1,
    "Sample Received": 3,
    "In Progress": 4,
    "Awaiting Review": 5,
    Completed: 6,
    Rejected: 3
  };

  const completedStages = completionMap[status] || 1;
  const timeline = document.getElementById("progressTimeline");

  timeline.innerHTML = stages
    .map((stage, index) => {
      const complete = index < completedStages;
      return `
        <div class="progress-node ${complete ? "complete" : ""}">
          <div class="progress-dot">${complete ? "✓" : index + 1}</div>
          <strong>${stage}</strong>
        </div>
      `;
    })
    .join("");
}

function renderHistory(history) {
  const historyContainer = document.getElementById("detailHistory");
  historyContainer.innerHTML = history
    .map(
      ([date, action]) => `
        <div class="history-item">
          <strong>${action}</strong>
          <span>${date}</span>
        </div>
      `
    )
    .join("");
}

function setDetailTab(tabName) {
  document.querySelectorAll(".detail-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.detailTab === tabName);
  });

  document.querySelectorAll(".detail-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.detailPanel === tabName);
  });
}

function stampNow() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function isLabVerified(request) {
  const value = String(request.approval.verified).toLowerCase();
  return !value.includes("pending") && !value.includes("not");
}

function getNextWorkflowStep(request) {
  switch (request.status) {
    case "Pending":
      return {
        role: "Lab Officer",
        label: "Mark Sample Received",
        note: "Confirm the specimen arrived at the laboratory and record its seal and condition.",
        fields: [
          { id: "wfSampleId", label: "Sample ID *", placeholder: "S-2026-0001", required: true },
          { id: "wfSeal", label: "Seal Number *", required: true },
          { id: "wfCondition", label: "Sample Condition", type: "select", options: ["Intact", "Acceptable", "Damaged", "Leaking"] },
          { id: "wfLabRef", label: "Laboratory Reference", placeholder: "LAB-2026-001" }
        ],
        apply(req, v) {
          req.status = "Sample Received";
          req.sampleId = v.wfSampleId;
          req.sealNumber = v.wfSeal;
          req.sampleCondition = v.wfCondition || "Intact";
          req.labReference = v.wfLabRef || "Not assigned";
          req.receivedDate = new Date().toISOString().slice(0, 10);
        },
        historyLabel: (req, v) => `Sample ${v.wfSampleId} received by the laboratory`
      };

    case "Sample Received":
      return {
        role: "Lab Officer",
        label: "Start Testing",
        note: "Assign the analyst and analysis method to begin testing.",
        fields: [
          { id: "wfAnalyst", label: "Analyst *", required: true },
          { id: "wfMethod", label: "Method / Technique *", placeholder: "e.g. GC-MS, Immunoassay", required: true }
        ],
        apply(req, v) {
          req.status = "In Progress";
          req.analyst = v.wfAnalyst;
          req.method = v.wfMethod;
        },
        historyLabel: (req, v) => `Testing started by ${v.wfAnalyst} (${v.wfMethod})`
      };

    case "In Progress":
      return {
        role: "Lab Officer",
        label: "Enter Result",
        note: "Record the laboratory findings. The result will go to verification and JMO review.",
        fields: [
          { id: "wfResult", label: "Result Summary *", type: "textarea", required: true },
          { id: "wfQuality", label: "Quality Control", type: "select", options: ["Passed", "Repeated", "Pending"] }
        ],
        apply(req, v) {
          req.status = "Awaiting Review";
          req.resultSummary = v.wfResult;
          req.qualityControl = v.wfQuality || "Passed";
          req.approval.entered = `Entered by ${req.analyst} on ${stampNow()}`;
        },
        historyLabel: () => "Laboratory result entered"
      };

    case "Awaiting Review":
      if (!isLabVerified(request)) {
        return {
          role: "Lab Officer",
          label: "Verify Result (Laboratory)",
          note: "Senior laboratory verification before the result goes to the JMO.",
          fields: [
            { id: "wfVerifier", label: "Verified By *", placeholder: "Senior analyst / lab head", required: true }
          ],
          apply(req, v) {
            req.approval.verified = `Verified by ${v.wfVerifier} on ${stampNow()}`;
          },
          historyLabel: (req, v) => `Result verified by ${v.wfVerifier}`
        };
      }
      return {
        role: "JMO",
        label: "Approve & Complete (JMO Review)",
        note: "Final medico-legal review of the verified laboratory findings.",
        fields: [
          { id: "wfJmoRemarks", label: "JMO Remarks", placeholder: "Optional remarks" }
        ],
        apply(req, v) {
          req.status = "Completed";
          req.approval.jmo = `Reviewed by ${req.requestingJmo} on ${stampNow()}`;
          if (v.wfJmoRemarks) {
            req.resultSummary += `<br><strong>JMO remarks:</strong> ${v.wfJmoRemarks}`;
          }
        },
        historyLabel: (req) => `JMO review completed by ${req.requestingJmo}`
      };

    default:
      return null;
  }
}

function renderWorkflowBar() {
  const bar = document.getElementById("workflowBar");
  const fieldsBox = document.getElementById("workflowFields");
  const button = document.getElementById("workflowActionButton");
  const label = document.getElementById("workflowStepLabel");
  const note = document.getElementById("workflowStepNote");

  const step = selectedRequest ? getNextWorkflowStep(selectedRequest) : null;
  if (!step) {
    bar.hidden = true;
    return;
  }

  bar.hidden = false;
  label.textContent = step.label;

  if (step.role !== activeRole) {
    note.textContent = `This step is performed by the ${step.role}. Switch the "Acting as" role in the top bar to continue.`;
    fieldsBox.hidden = true;
    fieldsBox.innerHTML = "";
    button.hidden = true;
    return;
  }

  note.textContent = step.note || "";
  button.hidden = false;
  button.textContent = step.label;
  fieldsBox.hidden = !step.fields.length;
  fieldsBox.innerHTML = step.fields
    .map((field) => {
      if (field.type === "textarea") {
        return `<label class="workflow-field full">${field.label}<textarea id="${field.id}" rows="3" placeholder="${field.placeholder || ""}"></textarea></label>`;
      }
      if (field.type === "select") {
        return `<label class="workflow-field">${field.label}<select id="${field.id}">${field.options.map((option) => `<option>${option}</option>`).join("")}</select></label>`;
      }
      return `<label class="workflow-field">${field.label}<input id="${field.id}" type="text" placeholder="${field.placeholder || ""}" /></label>`;
    })
    .join("");
}

document.getElementById("workflowActionButton").addEventListener("click", () => {
  if (!selectedRequest) return;
  const step = getNextWorkflowStep(selectedRequest);
  if (!step || step.role !== activeRole) return;

  const values = {};
  let missingField = null;

  (step.fields || []).forEach((field) => {
    const element = document.getElementById(field.id);
    values[field.id] = element ? element.value.trim() : "";
    if (field.required && !values[field.id] && !missingField) missingField = element;
  });

  if (missingField) {
    missingField.focus();
    showToast("Complete the required fields for this step.");
    return;
  }

  step.apply(selectedRequest, values);
  selectedRequest.history.push([stampNow(), step.historyLabel(selectedRequest, values)]);
  saveLabRequests();
  renderTable();
  openRequestDetails(selectedRequest.requestId);
  showToast(`${selectedRequest.requestId}: ${step.label} done.`);
});

function submitDraft(requestId) {
  const request = labRequests.find((item) => item.requestId === requestId);
  if (!request || request.status !== "Draft") return;

  request.status = "Pending";
  request.requestedDate = new Date().toISOString().slice(0, 10);
  request.resultSummary =
    "The request has been submitted. Sample collection and laboratory processing are pending.";
  request.history.push([
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date()),
    `Draft submitted by ${request.requestingJmo}`
  ]);

  saveLabRequests();
  renderTable();
  showToast(`${requestId} was submitted successfully.`);
}

function generateRequestId() {
  const year = new Date().getFullYear();
  const lastNumbers = labRequests
    .map((request) => Number(request.requestId.split("-").pop()))
    .filter((value) => Number.isFinite(value));
  const nextNumber = lastNumbers.length ? Math.max(...lastNumbers) + 1 : 1;
  return `LR-${year}-${String(nextNumber).padStart(4, "0")}`;
}

function createRequestFromForm(status) {
  const formData = new FormData(newRequestForm);
  const newRequest = {
    requestId: generateRequestId(),
    caseId: formData.get("caseId"),
    caseType: formData.get("caseType"),
    personName: formData.get("personName"),
    referenceNumber: formData.get("referenceNumber") || "Not provided",
    testType: formData.get("testType"),
    specificTest: formData.get("specificTest"),
    sampleType: formData.get("sampleType"),
    sampleId: "Pending allocation",
    sealNumber: "Pending",
    sampleCondition: "Not collected",
    storageCondition: formData.get("storage") || "Not specified",
    requestedDate: new Date().toISOString().slice(0, 10),
    priority: formData.get("priority"),
    status,
    laboratory: formData.get("laboratory"),
    requestingJmo: formData.get("requestingJmo"),
    labReference: "Not assigned",
    receivedDate: "Not received",
    analyst: formData.get("labOfficer") || "Not assigned",
    method: "Pending",
    qualityControl: "Pending",
    resultSummary:
      status === "Pending"
        ? "The request has been submitted. Sample collection and laboratory processing are pending."
        : "This request is saved as a draft and has not been submitted.",
    approval: {
      entered: "Not entered",
      verified: "Not started",
      jmo: "Not started"
    },
    history: [
      [
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }).format(new Date()),
        status === "Pending"
          ? `Laboratory request created by ${formData.get("requestingJmo")}`
          : `Draft request saved by ${formData.get("requestingJmo")}`
      ]
    ]
  };

  labRequests.unshift(newRequest);
  saveLabRequests();
  closeModal(newRequestModal);
  newRequestForm.reset();
  document.getElementById("requestingJmoInput").value = "Dr. A. Perera";
  document.getElementById("containerCountInput").value = 1;
  setActiveTab("all");
  showToast(
    status === "Pending"
      ? `${newRequest.requestId} was created successfully.`
      : `${newRequest.requestId} was saved as a draft.`
  );
}

function exportToCsv() {
  const requests = getFilteredRequests();

  const headers = [
    "Request ID",
    "Case ID",
    "Case Type",
    "Person",
    "Test Type",
    "Specific Test",
    "Sample Type",
    "Requested Date",
    "Priority",
    "Status",
    "Laboratory"
  ];

  const rows = requests.map((request) => [
    request.requestId,
    request.caseId,
    request.caseType,
    request.personName,
    request.testType,
    request.specificTest,
    request.sampleType,
    request.requestedDate,
    request.priority,
    request.status,
    request.laboratory
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "MedLogs_Lab_Requests.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast("The current request list was exported.");
}

/* Event listeners */
[searchInput, caseTypeFilter, testTypeFilter, statusFilter].forEach((control) => {
  control.addEventListener("input", () => { currentPage = 1; renderTable(); });
  control.addEventListener("change", () => { currentPage = 1; renderTable(); });
});

resetFiltersButton.addEventListener("click", () => {
  currentPage = 1;
  searchInput.value = "";
  caseTypeFilter.value = "all";
  testTypeFilter.value = "all";
  statusFilter.value = "all";
  setActiveTab("all");
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

document.querySelectorAll(".detail-tab").forEach((tab) => {
  tab.addEventListener("click", () => setDetailTab(tab.dataset.detailTab));
});

openNewRequestButton.addEventListener("click", () => {
  openModal(newRequestModal);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.getElementById(button.dataset.closeModal);
    closeModal(modal);
  });
});

[newRequestModal, detailsModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

newRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const missingField = getMissingMandatoryField();
  if (missingField) {
    missingField.focus();
    newRequestForm.reportValidity();
    showToast("Complete all mandatory laboratory request fields before submitting.");
    return;
  }
  createRequestFromForm("Pending");
});

saveDraftButton.addEventListener("click", () => {
  const invalidField = getMissingMandatoryField();
  if (invalidField) {
    invalidField.focus();
    showToast("Complete the required fields before saving the draft.");
    return;
  }

  createRequestFromForm("Draft");
});

exportButton.addEventListener("click", exportToCsv);

document.getElementById("submitDraftButton").addEventListener("click", () => {
  if (!selectedRequest) return;
  submitDraft(selectedRequest.requestId);
  closeModal(detailsModal);
});

document.getElementById("printRequestButton").addEventListener("click", () => {
  if (!selectedRequest) return;
  showToast(`Print view prepared for ${selectedRequest.requestId}.`);
  window.print();
});

mobileMenuButton.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (
    window.innerWidth <= 980 &&
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !mobileMenuButton.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (!newRequestModal.hidden) closeModal(newRequestModal);
  if (!detailsModal.hidden) closeModal(detailsModal);
  sidebar.classList.remove("open");
});

/* Notifications */
function buildLabNotifications() {
  const items = [];

  labRequests.forEach((request) => {
    if (request.status === "Draft") {
      items.push({
        requestId: request.requestId,
        icon: "\u{1F4DD}",
        tone: "warn",
        title: `Draft ${request.requestId} has not been submitted`,
        meta: `${request.caseId} \u00B7 ${request.testType}`
      });
    }

    if (
      ["Urgent", "Court Urgent", "Emergency"].includes(request.priority) &&
      request.status !== "Completed" &&
      request.status !== "Draft"
    ) {
      items.push({
        requestId: request.requestId,
        icon: "\u26A0\uFE0F",
        tone: "danger",
        title: `${request.priority}: ${request.requestId} is still ${request.status.toLowerCase()}`,
        meta: `${request.caseId} \u00B7 ${request.testType}`
      });
    }

    if (request.status === "Pending") {
      items.push({
        requestId: request.requestId,
        icon: "\u{1F9EA}",
        tone: "info",
        title: `Sample awaited by laboratory for ${request.requestId}`,
        meta: `${request.sampleType} \u00B7 ${request.caseId}`
      });
    }

    if (request.status === "Awaiting Review") {
      const verified = isLabVerified(request);
      items.push({
        requestId: request.requestId,
        icon: verified ? "\u2696\uFE0F" : "\u{1F50E}",
        tone: "warn",
        title: verified
          ? `${request.requestId} awaits JMO review`
          : `${request.requestId} awaits laboratory verification`,
        meta: `${request.caseId} \u00B7 ${request.testType}`
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

  const items = buildLabNotifications();

  badge.textContent = items.length > 9 ? "9+" : items.length;
  badge.hidden = items.length === 0;
  if (headCount) headCount.textContent = items.length ? `${items.length} new` : "";

  list.innerHTML = items.length
    ? items
        .map(
          (item) => `
        <button type="button" class="notify-item ${item.tone}" data-notify-request="${item.requestId}">
          <span class="notify-item-icon">${item.icon}</span>
          <span class="notify-item-text"><strong>${item.title}</strong><small>${item.meta}</small></span>
        </button>`
        )
        .join("")
    : `<div class="notify-empty">You're all caught up.</div>`;
}

function bindNotificationEvents() {
  const btn = document.getElementById("notifyBtn");
  const dropdown = document.getElementById("notifyDropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    renderNotifications();
    const willOpen = dropdown.hidden;
    dropdown.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".notify-wrap")) {
      dropdown.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });

  dropdown.addEventListener("click", (event) => {
    const item = event.target.closest("[data-notify-request]");
    if (!item) return;
    dropdown.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    openRequestDetails(item.dataset.notifyRequest);
  });
}

bindNotificationEvents();

/* Pre-fill the new request form when arriving from Case Management */
function prefillFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("caseId");
  if (!caseId) return;

  const setValue = (id, value) => {
    if (value) document.getElementById(id).value = value;
  };

  setValue("caseIdInput", caseId);
  setValue("caseTypeInput", params.get("caseType"));
  setValue("personNameInput", params.get("personName"));
  setValue("patientIdInput", params.get("patientId"));
  setValue("referenceNumberInput", params.get("ref"));

  showToast(`Case ${caseId} is ready. Press "New Lab Request" to continue.`);
}

renderTable();
prefillFromUrl();
