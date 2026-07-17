const labRequests = [];

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
          return !["Pending"].includes(request.status);
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

  updateSummaryCounts();
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

  renderProgressTimeline(selectedRequest.status);
  renderHistory(selectedRequest.history);
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

function generateRequestId() {
  const lastNumbers = labRequests.map((request) =>
    Number(request.requestId.split("-").pop())
  );
  const nextNumber = Math.max(...lastNumbers) + 1;
  return `LR-2026-${String(nextNumber).padStart(4, "0")}`;
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

  createRequestFromForm("Pending");
});

exportButton.addEventListener("click", exportToCsv);

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

renderTable();
