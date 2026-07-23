const API_URL = "http://127.0.0.1:5000/api/police-court";
let records = [];
const $ = id => document.getElementById(id);
const modal = $("recordModal");

function safe(value) {
  const element = document.createElement("div");
  element.textContent = value || "—";
  return element.innerHTML;
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function statusClass(value) {
  return String(value).toLowerCase().replace(/\s+/g, "-");
}

function showToast(message, isError = false) {
  const toast = $("toast");
  toast.querySelector("span").textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {"Content-Type": "application/json", ...(options.headers || {})}
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The server could not process the request.");
  return data;
}

async function loadRecords() {
  try {
    records = await apiRequest(API_URL);
  } catch (error) {
    records = [];
    showToast("Cannot reach Flask. Start the backend on port 5000.", true);
  }
  render();
}

function renderStats() {
  $("policeCount").textContent = records.filter(
    record => record.type === "Police Referral" && record.status !== "Completed"
  ).length;
  $("courtCount").textContent = records.filter(
    record => record.type === "Court Matter"
  ).length;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + 30);
  $("hearingCount").textContent = records.filter(record => {
    if (record.type !== "Court Matter" || !record.actionDate || record.status === "Completed") return false;
    const date = new Date(`${record.actionDate}T00:00:00`);
    return date >= now && date <= end;
  }).length;
  $("completedCount").textContent = records.filter(
    record => ["Completed", "Submitted"].includes(record.status)
  ).length;
}

function filteredRecords() {
  const query = $("globalSearch").value.toLowerCase().trim();
  const type = $("typeFilter").value;
  const status = $("statusFilter").value;
  return records.filter(record =>
    (type === "all" || record.type === type) &&
    (status === "all" || record.status === status) &&
    (!query || Object.values(record).join(" ").toLowerCase().includes(query))
  );
}

function renderTable() {
  const data = filteredRecords();
  $("recordsBody").innerHTML = data.map(record => `<tr>
    <td><strong>${safe(record.reference)}</strong><small>${safe(record.contact)}</small></td>
    <td><strong>${safe(record.caseId)}</strong><small>${safe(record.authority)}</small></td>
    <td><span class="type-chip ${record.type === "Court Matter" ? "court" : ""}">${safe(record.type)}</span></td>
    <td><strong>${formatDate(record.actionDate)}</strong><small>${safe(record.priority)}</small></td>
    <td><span class="status-chip ${statusClass(record.status)}">${safe(record.status)}</span></td>
    <td><button class="row-action" data-complete="${record.id}" title="Mark completed"><i data-lucide="check"></i></button></td>
  </tr>`).join("");
  $("emptyState").hidden = data.length > 0;
  lucide.createIcons();
}

function renderSchedule() {
  const upcoming = records
    .filter(record => record.actionDate && record.status !== "Completed")
    .sort((a, b) => a.actionDate.localeCompare(b.actionDate))
    .slice(0, 4);
  $("scheduleList").innerHTML = upcoming.length
    ? upcoming.map(record => {
      const date = new Date(`${record.actionDate}T00:00:00`);
      return `<div class="schedule-item"><div class="date-tile">
        <strong>${date.getDate()}</strong><small>${date.toLocaleString("en", {month: "short"})}</small>
      </div><div><h5>${safe(record.authority)}</h5>
      <p>${safe(record.caseId)} · ${safe(record.reference)}<br>${safe(record.type)}</p></div></div>`;
    }).join("")
    : '<div class="empty"><p>No upcoming dates.</p></div>';
}

function render() {
  renderStats();
  renderTable();
  renderSchedule();
}

function openModal(type) {
  $("recordForm").reset();
  if (type) $("recordType").value = type;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => $("caseId").focus(), 50);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

$("recordForm").addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const record = await apiRequest(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: $("recordType").value,
        caseId: $("caseId").value.trim(),
        reference: $("referenceNo").value.trim(),
        authority: $("authority").value.trim(),
        contact: $("contactPerson").value.trim(),
        actionDate: $("actionDate").value,
        status: $("recordStatus").value,
        priority: $("priority").value,
        notes: $("notes").value.trim()
      })
    });
    records.unshift(record);
    render();
    closeModal();
    showToast("Record saved to PostgreSQL.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
});

$("recordsBody").addEventListener("click", async event => {
  const button = event.target.closest("[data-complete]");
  if (!button) return;
  button.disabled = true;
  try {
    const updated = await apiRequest(`${API_URL}/${button.dataset.complete}`, {
      method: "PATCH",
      body: JSON.stringify({status: "Completed"})
    });
    const index = records.findIndex(record => record.id === updated.id);
    if (index !== -1) records[index] = updated;
    render();
    showToast("Record marked as completed.");
  } catch (error) {
    button.disabled = false;
    showToast(error.message, true);
  }
});

$("newRecordBtn").addEventListener("click", () => openModal());
document.querySelectorAll("[data-new-type]").forEach(
  button => button.addEventListener("click", () => openModal(button.dataset.newType))
);
$("closeModalBtn").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
[$("globalSearch"), $("typeFilter"), $("statusFilter")].forEach(element =>
  element.addEventListener(element.tagName === "INPUT" ? "input" : "change", renderTable)
);
$("menuBtn").addEventListener("click", () => {
  $("sidebar").classList.add("open");
  $("sidebarOverlay").classList.add("active");
});
$("sidebarOverlay").addEventListener("click", () => {
  $("sidebar").classList.remove("open");
  $("sidebarOverlay").classList.remove("active");
});
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("globalSearch").focus();
  }
  if (event.key === "Escape") closeModal();
});

lucide.createIcons();
loadRecords();
