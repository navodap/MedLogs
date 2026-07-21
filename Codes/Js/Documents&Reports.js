/* ============ MedLogs - Documents & Reports ============ */

/* ---------- Sample data (replace with API calls) ---------- */
let documents = [
  { id: 1, name: "PM-2026-0142_Toxicology_2026-07-02_v1.pdf", caseId: "PM-2026-0142", type: "Lab / Toxicology Report", uploaded: "2026-07-02", by: "Dr. N. Wickrama", version: 1, restricted: false },
  { id: 2, name: "PM-2026-0142_Photograph-Postmortem_2026-06-28_v1.jpg", caseId: "PM-2026-0142", type: "Photograph - Postmortem", uploaded: "2026-06-28", by: "T. Bandara", version: 1, restricted: true },
  { id: 3, name: "CL-2026-0388_Scanned-MLEF_2026-06-27_v1.pdf", caseId: "CL-2026-0388", type: "Scanned MLEF", uploaded: "2026-06-27", by: "Clerk S. Herath", version: 1, restricted: false },
  { id: 4, name: "CL-2026-0388_Xray-CT_2026-06-29_v2.pdf", caseId: "CL-2026-0388", type: "X-ray / CT Scan", uploaded: "2026-06-29", by: "Dr. A. Perera", version: 2, restricted: false },
  { id: 5, name: "PM-2026-0142_Certificate-of-Receipt_2026-07-10_v1.pdf", caseId: "PM-2026-0142", type: "Certificate of Receipt", uploaded: "2026-07-10", by: "Clerk S. Herath", version: 1, restricted: false }
];

let reports = [
  { id: 1, title: "Postmortem Report", caseId: "PM-2026-0142", type: "Postmortem Report", generated: "2026-07-05", submitted: "2026-07-12", status: "Submitted" },
  { id: 2, title: "Toxicology Report", caseId: "PM-2026-0142", type: "Toxicology Report", generated: "2026-07-08", submitted: "-", status: "Pending Approval" },
  { id: 3, title: "Medico-Legal Report (MLR)", caseId: "CL-2026-0388", type: "Medico-Legal Report (MLR)", generated: "2026-07-15", submitted: "-", status: "Draft" },
  { id: 4, title: "Monthly Statistical Report - June", caseId: "-", type: "Monthly Statistical Report", generated: "2026-07-01", submitted: "2026-07-03", status: "Approved" }
];

let nextDocId = 6;
let nextRepId = 5;

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.hidden = true), 2600);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fileIcon(name) {
  if (/\.(jpe?g|png|tiff?)$/i.test(name)) return "ti-photo";
  return "ti-file-text";
}

function statusClass(status) {
  return {
    "Draft": "draft",
    "Pending Approval": "pending",
    "Approved": "approved",
    "Submitted": "submitted",
    "Amended": "amended"
  }[status] || "draft";
}

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-" + btn.dataset.tab).classList.add("active");
  });
});

/* ---------- Documents: render ---------- */
function renderDocuments() {
  const q = $("#docSearch").value.trim().toLowerCase();
  const type = $("#docFilterType").value;
  const body = $("#docTableBody");
  body.innerHTML = "";

  const rows = documents.filter((d) => {
    const matchQ = !q || d.name.toLowerCase().includes(q) || d.caseId.toLowerCase().includes(q);
    const matchT = !type || d.type === type;
    return matchQ && matchT;
  });

  $("#docEmpty").hidden = rows.length > 0;

  rows.forEach((d) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="file-name" data-view="${d.id}"><i class="ti ${fileIcon(d.name)}"></i>${d.name}</span></td>
      <td>${d.caseId}</td>
      <td>${d.type}</td>
      <td>${d.uploaded}</td>
      <td>${d.by}</td>
      <td>v${d.version}</td>
      <td>${d.restricted ? '<span class="badge restricted"><i class="ti ti-lock"></i> Restricted</span>' : '<span class="badge open">Open</span>'}</td>
      <td class="actions">
        <button class="btn icon" title="View" data-view="${d.id}"><i class="ti ti-eye"></i></button>
        <button class="btn icon" title="Download" data-download="${d.id}"><i class="ti ti-download"></i></button>
        <button class="btn icon danger" title="Archive (soft delete)" data-archive="${d.id}"><i class="ti ti-archive"></i></button>
      </td>`;
    body.appendChild(tr);
  });
}

/* ---------- Documents: viewer ---------- */
function viewDocument(id) {
  const d = documents.find((x) => x.id === id);
  if (!d) return;

  const img = $("#viewerImg");
  const pdf = $("#viewerPdf");
  const empty = $("#viewerEmpty");

  empty.hidden = true;
  img.hidden = true;
  pdf.hidden = true;

  if (d.fileUrl && /\.(jpe?g|png|tiff?)$/i.test(d.name)) {
    img.src = d.fileUrl;
    img.hidden = false;
  } else if (d.fileUrl) {
    pdf.src = d.fileUrl;
    pdf.hidden = false;
  } else {
    /* No real file attached (sample data) - show placeholder message */
    empty.hidden = false;
    empty.innerHTML = `<i class="ti ${fileIcon(d.name)}"></i><p><strong>${d.name}</strong><br>Preview available when connected to file storage backend.</p>`;
  }

  $("#viewerMeta").hidden = false;
  $("#metaName").textContent = d.name;
  $("#metaInfo").textContent = `${d.type} | Uploaded ${d.uploaded} by ${d.by} | v${d.version}${d.restricted ? " | RESTRICTED" : ""}`;
  $("#btnDownloadDoc").disabled = false;
  $("#btnDownloadDoc").dataset.id = id;
}

/* ---------- Documents: table actions ---------- */
$("#docTableBody").addEventListener("click", (e) => {
  const view = e.target.closest("[data-view]");
  const download = e.target.closest("[data-download]");
  const archive = e.target.closest("[data-archive]");

  if (view) viewDocument(Number(view.dataset.view));

  if (download) {
    const d = documents.find((x) => x.id === Number(download.dataset.download));
    if (d && d.fileUrl) {
      const a = document.createElement("a");
      a.href = d.fileUrl;
      a.download = d.name;
      a.click();
    } else {
      toast("Download will be available when connected to file storage.");
    }
  }

  if (archive) {
    const d = documents.find((x) => x.id === Number(archive.dataset.archive));
    if (d && confirm(`Archive "${d.name}"?\n\nFiles are never permanently deleted (soft delete only, per audit policy).`)) {
      documents = documents.filter((x) => x.id !== d.id);
      renderDocuments();
      toast("Document archived. It remains recoverable in the archive tier.");
    }
  }
});

/* ---------- Documents: upload ---------- */
const dropzone = $("#dropzone");
const fileInput = $("#fileInput");
let pendingFiles = [];

dropzone.addEventListener("click", (e) => {
  if (e.target.tagName !== "LABEL") fileInput.click();
});
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

function handleFiles(fileList) {
  pendingFiles = Array.from(fileList).filter((f) =>
    /\.(pdf|jpe?g|png|tiff?)$/i.test(f.name)
  );
  if (pendingFiles.length === 0) {
    toast("Only PDF, JPEG, PNG or TIFF files are allowed.");
    return;
  }
  dropzone.querySelector("p").innerHTML =
    `<strong>${pendingFiles.length} file(s) selected:</strong> ` +
    pendingFiles.map((f) => f.name).join(", ");
}

$("#uploadForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const caseId = $("#docCaseId").value.trim();
  const type = $("#docType").value;
  if (!caseId || !type) return;

  if (pendingFiles.length === 0) {
    toast("Select at least one file to upload.");
    return;
  }

  const date = ($("#docDate").value || today());
  const restricted = $("#docRestricted").value === "yes";

  pendingFiles.forEach((f) => {
    /* Naming convention: [CaseNumber]_[DocumentType]_[Date]_[Version] */
    const ext = f.name.split(".").pop();
    const cleanType = type.replace(/[^a-zA-Z0-9]+/g, "-");
    documents.unshift({
      id: nextDocId++,
      name: `${caseId}_${cleanType}_${date}_v1.${ext}`,
      caseId: caseId,
      type: type,
      uploaded: today(),
      by: "Current User", /* replace with logged-in user */
      version: 1,
      restricted: restricted,
      fileUrl: URL.createObjectURL(f)
    });
  });

  renderDocuments();
  toast(`${pendingFiles.length} document(s) uploaded and linked to ${caseId}.`);

  pendingFiles = [];
  e.target.reset();
  dropzone.querySelector("p").innerHTML =
    'Drag &amp; drop files here or <label for="fileInput" class="browse">browse</label>';
});

$("#btnDownloadDoc").addEventListener("click", () => {
  const d = documents.find((x) => x.id === Number($("#btnDownloadDoc").dataset.id));
  if (d && d.fileUrl) {
    const a = document.createElement("a");
    a.href = d.fileUrl;
    a.download = d.name;
    a.click();
  } else {
    toast("Download will be available when connected to file storage.");
  }
});

$("#docSearch").addEventListener("input", renderDocuments);
$("#docFilterType").addEventListener("change", renderDocuments);

/* ---------- Reports: render ---------- */
function renderReports() {
  const q = $("#repSearch").value.trim().toLowerCase();
  const status = $("#repFilterStatus").value;
  const body = $("#repTableBody");
  body.innerHTML = "";

  const rows = reports.filter((r) => {
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.caseId.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    const matchS = !status || r.status === status;
    return matchQ && matchS;
  });

  $("#repEmpty").hidden = rows.length > 0;

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    const approveBtn = r.status === "Pending Approval"
      ? `<button class="btn icon" title="Approve & sign (JMO only)" data-approve="${r.id}"><i class="ti ti-signature"></i></button>` : "";
    const exportBtns = (r.status === "Approved" || r.status === "Submitted")
      ? `<button class="btn icon" title="Export PDF" data-export="${r.id}"><i class="ti ti-download"></i></button>
         <button class="btn icon" title="Print" data-print="${r.id}"><i class="ti ti-printer"></i></button>` : "";
    const editBtn = (r.status === "Draft")
      ? `<button class="btn icon" title="Edit draft" data-edit="${r.id}"><i class="ti ti-edit"></i></button>` : "";

    tr.innerHTML = `
      <td><span class="file-name"><i class="ti ti-file-text"></i>${r.title}</span></td>
      <td>${r.caseId}</td>
      <td>${r.type}</td>
      <td>${r.generated}</td>
      <td>${r.submitted}</td>
      <td><span class="badge ${statusClass(r.status)}">${r.status}</span></td>
      <td class="actions">${editBtn}${approveBtn}${exportBtns}</td>`;
    body.appendChild(tr);
  });
}

/* ---------- Reports: generate ---------- */
$("#reportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const caseVal = $("#repCase").value;
  const typeVal = $("#repType").value;
  if (!caseVal || !typeVal) return;

  const caseId = caseVal.split(" - ")[0];

  reports.unshift({
    id: nextRepId++,
    title: typeVal,
    caseId: typeVal.includes("Statistical") || typeVal.includes("Annual") ? "-" : caseId,
    type: typeVal,
    generated: today(),
    submitted: "-",
    status: "Draft"
  });

  renderReports();
  document.querySelector('[data-tab="reports"]').click();
  toast(`${typeVal} generated as Draft from stored case data.`);
  e.target.reset();
});

/* ---------- Reports: table actions ---------- */
$("#repTableBody").addEventListener("click", (e) => {
  const approve = e.target.closest("[data-approve]");
  const exportBtn = e.target.closest("[data-export]");
  const printBtn = e.target.closest("[data-print]");
  const editBtn = e.target.closest("[data-edit]");

  if (approve) {
    const r = reports.find((x) => x.id === Number(approve.dataset.approve));
    if (r && confirm(`Approve and digitally sign "${r.title}" (${r.caseId})?\n\nOnce approved, the report is locked from editing.`)) {
      r.status = "Approved";
      renderReports();
      toast("Report approved and signed. Locked from further editing.");
    }
  }

  if (editBtn) {
    const r = reports.find((x) => x.id === Number(editBtn.dataset.edit));
    if (r) {
      /* In real system: navigate to case/examination edit page, then regenerate */
      r.status = "Pending Approval";
      renderReports();
      toast("Draft updated and sent for JMO approval.");
    }
  }

  if (exportBtn) toast("PDF export will run on the server in the real system.");
  if (printBtn) window.print();
});

$("#repSearch").addEventListener("input", renderReports);
$("#repFilterStatus").addEventListener("change", renderReports);

/* ---------- Init ---------- */
renderDocuments();
renderReports();
