/* ============ MedLogs - Documents & Reports ============ */

/* ---------- Sample data (replace with API calls) ---------- */
let documents = [];

let reports = [];

let nextDocId = 1;
let nextRepId = 1;
let fileSeq = 0;

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.hidden = true), 3200);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fileIcon(name) {
  if (/\.(jpe?g|png|tiff?)$/i.test(name)) return "ti-photo";
  return "ti-file-text";
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return Math.round(bytes / 1024) + " KB";
  return bytes + " B";
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function statusClass(status) {
  return {
    "Draft": "draft",
    "Pending Approval": "pending",
    "Approved": "approved",
    "Submitted": "submitted",
    "Amended": "amended",
    "Rejected": "rejected",
    "Cancelled": "cancelled"
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
      <td>v${d.version}${d.active === false ? ' <span class="badge superseded">superseded</span>' : ""}</td>
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
    empty.hidden = false;
    empty.innerHTML = `<i class="ti ${fileIcon(d.name)}"></i><p><strong>${d.name}</strong><br>Preview available when connected to file storage backend.</p>`;
  }

  $("#viewerMeta").hidden = false;
  $("#metaName").textContent = d.name;
  $("#metaInfo").textContent = `${d.type} | Uploaded ${d.uploaded} by ${d.by} | v${d.version}${d.access ? " | " + d.access : ""}${d.restricted ? " | RESTRICTED" : ""}`;
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

/* ==================================================================
   UPLOAD WIZARD
   ================================================================== */
let pendingFiles = [];
let uploading = false;

const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED = /\.(pdf|jpe?g|png|tiff?)$/i;

/* ---------- Step navigation ---------- */
function openStep(n) {
  document.querySelectorAll("#uploadWizard .wstep").forEach((s) => {
    s.classList.toggle("open", Number(s.dataset.step) === n);
  });
  if (n === 4) refreshPrevDocOptions();
  if (n === 5) buildReview();
}

document.querySelectorAll("#uploadWizard .wstep-head").forEach((head) => {
  head.addEventListener("click", () => {
    if (uploading) return;
    const step = head.parentElement;
    if (step.classList.contains("open")) {
      step.classList.remove("open");
      return;
    }
    openStep(Number(step.dataset.step));
  });
});

document.querySelectorAll("#uploadWizard [data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (uploading) return;
    const target = Number(btn.dataset.goto);
    const current = Number(btn.closest(".wstep").dataset.step);
    if (target > current) {
      for (let s = current; s < target; s++) {
        if (!validateStep(s)) return;
      }
    }
    openStep(target);
  });
});

function validateStep(n) {
  if (n === 1 && pendingFiles.length === 0) {
    toast("Select at least one file first.");
    return false;
  }
  if (n === 2 && !currentCaseId()) {
    toast("Enter the Case ID this document belongs to.");
    return false;
  }
  if (n === 3) {
    if (!$("#docTitle").value.trim()) { toast("Enter a document title."); return false; }
    if (!$("#docType").value) { toast("Select the document type."); return false; }
  }
  if (n === 4) {
    if ($("#verVersion").checked && !$("#prevDoc").value) {
      toast("Select the previous document this new version replaces.");
      return false;
    }
    if ($("#docAccess").value !== "Normal authorized staff" && !$("#docRestrictReason").value.trim()) {
      toast("Give a reason for the access restriction.");
      return false;
    }
  }
  return true;
}

/* ---------- Step 1: file selection ---------- */
const dropzone = $("#dropzone");
const fileInput = $("#fileInput");

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
fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
  fileInput.value = "";
});

function handleFiles(fileList) {
  const rejected = [];
  Array.from(fileList).forEach((f) => {
    if (!ALLOWED.test(f.name)) {
      rejected.push(`${f.name} (unsupported type)`);
    } else if (f.size > MAX_SIZE) {
      rejected.push(`${f.name} (larger than 25 MB)`);
    } else if (!pendingFiles.some((p) => p.file.name === f.name && p.file.size === f.size)) {
      pendingFiles.push({ id: ++fileSeq, file: f, url: URL.createObjectURL(f), progress: 0 });
    }
  });
  if (rejected.length) toast("Rejected: " + rejected.join(", "));
  renderFileList();
}

function renderFileList() {
  const list = $("#fileList");
  list.innerHTML = pendingFiles.map((p) => {
    const isImg = /\.(jpe?g|png)$/i.test(p.file.name);
    const thumb = isImg
      ? `<img class="fthumb" src="${p.url}" alt="preview" />`
      : `<span class="fthumb ficon"><i class="ti ${fileIcon(p.file.name)}"></i></span>`;
    const ext = p.file.name.split(".").pop().toUpperCase();
    return `
      <li class="file-item" data-fid="${p.id}">
        ${thumb}
        <div class="fmeta">
          <strong>${esc(p.file.name)}</strong>
          <span>${ext} &middot; ${formatSize(p.file.size)}</span>
          <div class="fprog"><div class="fprog-bar" style="width:${p.progress}%"></div></div>
        </div>
        <button type="button" class="btn icon danger fremove" title="Remove" data-remove-file="${p.id}"><i class="ti ti-x"></i></button>
      </li>`;
  }).join("");

  const total = pendingFiles.reduce((s, p) => s + p.file.size, 0);
  $("#sumStep1").textContent = pendingFiles.length
    ? `${pendingFiles.length} file(s) selected - ${formatSize(total)} total`
    : "No files selected yet";
}

$("#fileList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove-file]");
  if (!btn || uploading) return;
  const p = pendingFiles.find((x) => x.id === Number(btn.dataset.removeFile));
  if (p) URL.revokeObjectURL(p.url);
  pendingFiles = pendingFiles.filter((x) => x.id !== Number(btn.dataset.removeFile));
  renderFileList();
});

/* ---------- Step 2: case ID passed from Case Management ---------- */
const caseIdInput = $("#docCaseId");
const urlCaseId = new URLSearchParams(window.location.search).get("caseId");

function currentCaseId() {
  return caseIdInput.value.trim();
}

if (urlCaseId) {
  caseIdInput.value = urlCaseId;
  caseIdInput.readOnly = true;
  $("#caseIdHint").textContent = "Case ID filled automatically from Case Management.";
  $("#sumStep2").textContent = urlCaseId;
}

caseIdInput.addEventListener("input", () => {
  $("#sumStep2").textContent = currentCaseId() || "No case selected";
  refreshPrevDocOptions();
});

/* ---------- Step 3: conditional fields by document type ---------- */
function groupForType(type) {
  if (type.startsWith("Photograph")) return "photo";
  if (type === "Lab / Toxicology Report" || type === "Histopathology Report") return "lab";
  if (type === "Court Document") return "court";
  if (type === "Historical Scanned Report" || type === "Scanned MLEF") return "hist";
  return null;
}

$("#docType").addEventListener("change", () => {
  const type = $("#docType").value;
  const group = type ? groupForType(type) : null;
  ["photo", "lab", "court", "hist"].forEach((g) => {
    $("#grp-" + g).hidden = g !== group;
  });
  if (group === "photo") {
    const cat = type.split(" - ")[1];
    if (cat) $("#photoCategory").value = cat;
  }
  updateSumStep3();
});
$("#docTitle").addEventListener("input", updateSumStep3);

function updateSumStep3() {
  const title = $("#docTitle").value.trim();
  const type = $("#docType").value;
  $("#sumStep3").textContent = title || type
    ? [title, type].filter(Boolean).join(" - ")
    : "Title, type and source";
}

/* ---------- Step 4: access, sensitivity, versioning ---------- */
$("#docAccess").addEventListener("change", () => {
  $("#restrictReasonField").hidden = $("#docAccess").value === "Normal authorized staff";
  updateSumStep4();
});

["flagMinor", "flagAssault"].forEach((id) => {
  $("#" + id).addEventListener("change", (e) => {
    if (e.target.checked) {
      $("#flagSensitive").checked = true;
      if ($("#docAccess").value === "Normal authorized staff") {
        $("#docAccess").value = "Highly restricted";
        $("#restrictReasonField").hidden = false;
        toast("Access level raised to Highly restricted for this sensitive category.");
      }
      updateSumStep4();
    }
  });
});

document.querySelectorAll('input[name="verMode"]').forEach((r) => {
  r.addEventListener("change", () => {
    $("#verFields").hidden = !$("#verVersion").checked;
    if ($("#verVersion").checked) refreshPrevDocOptions();
    updateSumStep4();
  });
});

function refreshPrevDocOptions() {
  const sel = $("#prevDoc");
  const current = sel.value;
  const cid = currentCaseId();
  const opts = cid
    ? documents.filter((d) => d.caseId === cid && d.active !== false)
    : [];
  sel.innerHTML = '<option value="">Select the document this replaces&hellip;</option>' +
    opts.map((d) => `<option value="${d.id}">${esc(d.name)} (v${d.version})</option>`).join("");
  if (opts.some((d) => String(d.id) === current)) sel.value = current;
  updateVerAutoNote();
}

$("#prevDoc").addEventListener("change", updateVerAutoNote);

function updateVerAutoNote() {
  const note = $("#verAutoNote");
  const prev = documents.find((d) => d.id === Number($("#prevDoc").value));
  if ($("#verVersion") && $("#verVersion").checked && prev) {
    note.hidden = false;
    note.textContent = `This upload will be saved automatically as version v${prev.version + 1}. v${prev.version} stays available for audit.`;
  } else {
    note.hidden = true;
  }
  updateSumStep4();
}

$("#docStatus").addEventListener("change", updateSumStep4);

function updateSumStep4() {
  const bits = [$("#docStatus").value, $("#docAccess").value];
  if ($("#verVersion").checked) {
    const prev = documents.find((d) => d.id === Number($("#prevDoc").value));
    bits.push(prev ? `new version v${prev.version + 1}` : "new version");
  }
  $("#sumStep4").textContent = bits.join(" - ");
}

/* ---------- Step 5: review summary ---------- */
function computeVersion() {
  if ($("#verVersion").checked) {
    const prev = documents.find((d) => d.id === Number($("#prevDoc").value));
    if (prev) return { version: prev.version + 1, prev };
  }
  return { version: 1, prev: null };
}

function generatedName(p, version) {
  const ext = p.file.name.split(".").pop().toLowerCase();
  const cleanType = ($("#docType").value || "Document").replace(/[^a-zA-Z0-9]+/g, "-");
  const date = $("#docDate").value || today();
  const caseId = currentCaseId() || "CASE";
  return `${caseId}_${cleanType}_${date}_v${version}.${ext}`;
}

function buildReview() {
  const rev = $("#reviewSummary");
  const row = (label, val) => val
    ? `<div class="rev-row"><span>${label}</span><strong>${esc(val)}</strong></div>` : "";
  const section = (title, rows) => rows.trim()
    ? `<div class="rev-section"><h5>${title}</h5>${rows}</div>` : "";

  const { version, prev } = computeVersion();
  const type = $("#docType").value;
  const group = type ? groupForType(type) : null;

  const filesRows = pendingFiles.map((p) =>
    `<div class="rev-row"><span><i class="ti ${fileIcon(p.file.name)}"></i></span><strong>${esc(p.file.name)} <em>(${formatSize(p.file.size)})</em> &rarr; ${esc(generatedName(p, version))}</strong></div>`
  ).join("");

  const flags = [
    $("#flagSensitive").checked && "Sensitive case",
    $("#flagMinor").checked && "Minor involved",
    $("#flagAssault").checked && "Sexual assault-related",
    $("#flagPolice").checked && "Police-access permission"
  ].filter(Boolean).join(", ");

  let condRows = "";
  if (group === "photo") {
    condRows =
      row("Photographer", $("#photoBy").value) +
      row("Taken at", $("#photoTakenAt").value.replace("T", " ")) +
      row("Category", $("#photoCategory").value) +
      row("Location / body region", $("#photoRegion").value) +
      row("Photograph no.", $("#photoNumber").value) +
      row("Sensitive image", $("#photoSensitive").checked ? "Yes" : "");
  } else if (group === "lab") {
    condRows =
      row("Laboratory", $("#labName").value) +
      row("Sample ID", $("#labSampleId").value) +
      row("Test request ID", $("#labRequestId").value) +
      row("Test type", $("#labTestType").value) +
      row("Sample collected", $("#labCollected").value) +
      row("Report issued", $("#labIssued").value) +
      row("Laboratory officer", $("#labOfficer").value) +
      row("Result status", $("#labResultStatus").value);
  } else if (group === "court") {
    condRows =
      row("Police station / court", $("#cpOffice").value) +
      row("Police reference", $("#cpPoliceRef").value) +
      row("Court case no.", $("#cpCourtCase").value) +
      row("Inquest no.", $("#cpInquest").value) +
      row("Issuing officer", $("#cpIssuedBy").value) +
      row("Date issued", $("#cpDateIssued").value) +
      row("Date received", $("#cpDateReceived").value);
  } else if (group === "hist") {
    condRows =
      row("Original document date", $("#histOriginalDate").value) +
      row("Scanned by", $("#histScannedBy").value) +
      row("Scanning date", $("#histScanDate").value) +
      row("Physical file location", $("#histLocation").value) +
      row("OCR completed", $("#histOcr").checked ? "Yes" : "No") +
      row("Physical copy retained", $("#histRetained").checked ? "Yes" : "No");
  }

  rev.innerHTML =
    section("Files", filesRows || row("Files", "None selected")) +
    section("Case link",
      row("Case ID", currentCaseId())) +
    section("Document",
      row("Title", $("#docTitle").value) +
      row("Type", type) +
      row("Description", $("#docDesc").value) +
      row("Date", $("#docDate").value) +
      row("Source", $("#docSource").value) +
      row("Reference no.", $("#docRef").value) +
      row("Issued by", $("#docIssuedBy").value) +
      row("Department / institution", $("#docDept").value)) +
    section(group === "photo" ? "Photograph details"
      : group === "lab" ? "Laboratory details"
      : group === "court" ? "Court / police details"
      : group === "hist" ? "Historical scan details" : "", condRows) +
    section("Security & version",
      row("Status", $("#docStatus").value) +
      row("Access level", $("#docAccess").value) +
      row("Restriction reason", $("#docRestrictReason").value) +
      row("Flags", flags) +
      row("Version", prev
        ? `v${version} - replaces ${prev.name} (kept for audit)`
        : "v1 - new document") +
      row("Amendment reason", $("#verReason").value) +
      row("Version notes", $("#verNotes").value)) +
    section("Generated automatically",
      row("Uploaded by", "Current User (logged-in account)") +
      row("Upload date & time", new Date().toLocaleString()) +
      row("Storage location", currentCaseId() ? `/storage/${currentCaseId()}/documents/` : "") +
      row("Audit log", "Upload event will be written to the case audit trail"));
}

/* ---------- Upload ---------- */
$("#btnUpload").addEventListener("click", () => {
  if (uploading) return;
  for (let s = 1; s <= 4; s++) {
    if (!validateStep(s)) { openStep(s); return; }
  }

  uploading = true;
  $("#btnUpload").disabled = true;
  $("#fileList").classList.add("uploading");
  openStep(1);

  const timer = setInterval(() => {
    pendingFiles.forEach((p) => {
      p.progress = Math.min(100, p.progress + 10 + Math.random() * 14);
    });
    document.querySelectorAll(".file-item").forEach((li) => {
      const p = pendingFiles.find((x) => x.id === Number(li.dataset.fid));
      if (p) li.querySelector(".fprog-bar").style.width = p.progress + "%";
    });
    if (pendingFiles.every((p) => p.progress >= 100)) {
      clearInterval(timer);
      setTimeout(commitUpload, 250);
    }
  }, 90);
});

function commitUpload() {
  const cid = currentCaseId();
  const type = $("#docType").value;
  const date = $("#docDate").value || today();
  const { version, prev } = computeVersion();
  const access = $("#docAccess").value;
  const restricted = access !== "Normal authorized staff" ||
    $("#flagSensitive").checked || $("#flagMinor").checked || $("#flagAssault").checked;

  if (prev) prev.active = false;

  pendingFiles.forEach((p) => {
    documents.unshift({
      id: nextDocId++,
      name: generatedName(p, version),
      caseId: cid,
      type: type,
      uploaded: today(),
      by: "Current User", /* replace with logged-in user */
      version: version,
      restricted: restricted,
      access: access,
      status: $("#docStatus").value,
      active: true,
      fileUrl: p.url
    });
  });

  renderDocuments();
  toast(prev
    ? `Saved as v${version} of ${prev.name.split("_")[1] || "document"} for ${cid}. Previous version kept for audit.`
    : `${pendingFiles.length} document(s) uploaded and linked to ${cid}. Audit-log entry recorded.`);

  resetWizard();
}

function resetWizard() {
  uploading = false;
  pendingFiles = [];
  $("#btnUpload").disabled = false;
  $("#fileList").classList.remove("uploading");

  document.querySelectorAll("#uploadWizard input").forEach((el) => {
    if (el.id === "docCaseId") return; /* keep case ID from Case Management */
    if (el.type === "checkbox") el.checked = el.id === "histRetained";
    else if (el.type === "radio") el.checked = el.id === "verNew";
    else el.value = "";
  });
  document.querySelectorAll("#uploadWizard select").forEach((el) => (el.selectedIndex = 0));

  ["grp-photo", "grp-lab", "grp-court", "grp-hist",
   "verFields", "restrictReasonField", "verAutoNote"].forEach((id) => {
    document.getElementById(id).hidden = true;
  });

  renderFileList();
  $("#sumStep2").textContent = currentCaseId() || "No case selected";
  $("#sumStep3").textContent = "Title, type and source";
  $("#sumStep4").textContent = "Access level, sensitivity and versioning";
  $("#reviewSummary").innerHTML = "";
  openStep(1);
}

/* ==================================================================
   REPORT GENERATION WORKFLOW
   ================================================================== */

/* Sample case registry with stored case data (replace with API calls).
   Some cases intentionally have missing data to demonstrate validation. */
const REPORT_CASES = [
  {
    caseId: "PM-2026-0142", person: "W.A. Silva", caseType: "Death",
    refs: { mlef: "", serial: "PMR-0142", pmNo: "PM-REG-2026-041", inquest: "INQ-2026-0098", policeRef: "CIB 214/2026", courtCase: "MC-COL-4471" },
    patient: { name: "W.A. Silva", age: 54, gender: "Male", address: "112/4 Galle Road, Colombo 03", nic: "721453377V" },
    examDate: "2026-06-28 09:30", examPlace: "JMO Office, Colombo",
    history: "Found unresponsive at home on 2026-06-27. Referred for medico-legal autopsy on inquest order.",
    injuries: [],
    external: "No external injuries. Cyanosis of lips and nail beds. Body well nourished.",
    internal: "Concentric left ventricular hypertrophy; 90% occlusion of left anterior descending artery; pulmonary oedema.",
    investigations: ["Histology: myocardial fibrosis", "X-ray: no skeletal injury"],
    lab: ["Histopathology report received 2026-07-04"],
    tox: ["Blood alcohol: negative", "Screen for common poisons: negative"],
    opinion: "Death consistent with ischaemic heart disease. No evidence of trauma or poisoning.",
    cod: { immediate: "Acute myocardial infarction", underlying: "Coronary atherosclerosis", contributory: "Hypertension" },
    manner: "Natural",
    police: { station: "Kollupitiya Police", officer: "PS 4471 K. Weerasinghe" },
    court: { name: "Colombo Magistrate's Court", caseNo: "MC-COL-4471", trialDate: "2026-09-14", magistrate: "Hon. R. Dias (Magistrate)" },
    doctors: [
      { name: "Dr. N. Wickrama", role: "Primary JMO", designation: "Consultant JMO" },
      { name: "Dr. A. Perera", role: "Assisting doctor", designation: "MOML" }
    ]
  },
  {
    caseId: "PM-2026-0151", person: "Unknown Male", caseType: "Death",
    refs: { mlef: "", serial: "", pmNo: "PM-REG-2026-047", inquest: "INQ-2026-0104", policeRef: "CIB 231/2026", courtCase: "" },
    patient: { name: "Unknown Male", age: "About 40", gender: "Male", address: "Unknown", nic: "" },
    examDate: "2026-07-04 10:15", examPlace: "JMO Office, Colombo",
    history: "Body recovered from Beira Lake on 2026-07-03.",
    injuries: [],
    external: "Maceration of skin; no ante-mortem injuries identified.",
    internal: "Airways containing froth; lungs waterlogged.",
    investigations: [], lab: [], tox: [],
    opinion: "", cod: null, manner: "",
    police: { station: "Slave Island Police", officer: "PC 8123 D. Marasinghe" },
    court: { name: "", caseNo: "", trialDate: "", magistrate: "" },
    doctors: [{ name: "Dr. N. Wickrama", role: "Primary JMO", designation: "Consultant JMO" }]
  },
  {
    caseId: "CL-2026-0388", person: "K. Fernando", caseType: "Clinical",
    refs: { mlef: "MLEF-2026-0812", serial: "MLR-0388", pmNo: "", inquest: "", policeRef: "GCR 118/2026", courtCase: "MC-COL-4512" },
    patient: { name: "K. Fernando", age: 31, gender: "Male", address: "8 Temple Lane, Nugegoda", nic: "952214410V" },
    examDate: "2026-06-27 14:20", examPlace: "Ward 12, National Hospital",
    history: "Alleged assault with a wooden pole near his residence on 2026-06-26 around 21:00.",
    injuries: [
      "1. Contusion 6 x 4 cm over left scapular region",
      "2. Laceration 3 cm over right eyebrow, sutured",
      "3. Fracture of right ulna (confirmed by X-ray)"
    ],
    external: "", internal: "",
    investigations: ["X-ray right forearm: fracture of ulna shaft", "CT brain: no intracranial haemorrhage"],
    lab: [], tox: ["Breath alcohol: negative"],
    opinion: "Injury No. 3 is grievous under Section 311 of the Penal Code (fracture). Injuries consistent with blunt weapon assault as per history.",
    cod: null, manner: "",
    police: { station: "Nugegoda Police", officer: "PS 3310 T. Jayalath" },
    court: { name: "Colombo Magistrate's Court", caseNo: "MC-COL-4512", trialDate: "2026-08-30", magistrate: "Hon. S. de Alwis (Magistrate)" },
    doctors: [
      { name: "Dr. A. Perera", role: "Primary examiner", designation: "MOML" },
      { name: "Dr. N. Wickrama", role: "Supervising consultant", designation: "Consultant JMO" }
    ]
  },
  {
    caseId: "CL-2026-0391", person: "R. Perera", caseType: "Clinical",
    refs: { mlef: "MLEF-2026-0819", serial: "", pmNo: "", inquest: "", policeRef: "GCR 121/2026", courtCase: "" },
    patient: { name: "R. Perera", age: 27, gender: "Female", address: "45 Station Road, Dehiwala", nic: "998812234V" },
    examDate: "2026-07-01 11:05", examPlace: "JMO Office, Colombo",
    history: "Road traffic accident - motorcycle rider hit by a van at Dehiwala junction.",
    injuries: ["1. Abrasion 10 x 3 cm over left forearm", "2. Contusion over left hip"],
    external: "", internal: "",
    investigations: [], lab: [], tox: [],
    opinion: "", cod: null, manner: "",
    police: { station: "Dehiwala Police", officer: "PC 5561 H. Fonseka" },
    court: { name: "", caseNo: "", trialDate: "", magistrate: "" },
    doctors: [{ name: "Dr. A. Perera", role: "Primary examiner", designation: "MOML" }]
  }
];

/* ---------- Validation requirements ---------- */
const FIELD_LABELS = {
  patient: "Patient / deceased details", mlef: "MLEF number", examDate: "Examination date and time",
  injuries: "Injury descriptions", investigations: "Investigation results", opinion: "Doctor's opinion",
  police: "Police information", court: "Court information", pmNo: "PM registry number",
  inquest: "Inquest / court order", external: "External examination findings",
  internal: "Internal examination findings", lab: "Laboratory results", cod: "Cause of death",
  manner: "Manner of death", tox: "Toxicology results"
};

const REPORT_REQUIREMENTS = {
  "Medico-Legal Examination Form (MLEF)": ["patient", "police", "examDate", "injuries"],
  "Medico-Legal Report (MLR)": ["patient", "mlef", "examDate", "injuries", "investigations", "opinion", "police", "court"],
  "Post-Mortem Report": ["patient", "pmNo", "inquest", "external", "internal", "lab", "cod", "manner"],
  "Cause of Death Form": ["patient", "pmNo", "cod", "manner"],
  "Toxicology Report": ["patient", "tox"],
  "Supplementary Report": ["patient"],
  "Amendment Report": ["patient"],
  "Monthly Statistical Report": [],
  "Annual Summary Report": []
};

function hasField(c, key) {
  switch (key) {
    case "patient": return !!(c.patient && c.patient.name);
    case "mlef": return !!c.refs.mlef;
    case "examDate": return !!c.examDate;
    case "injuries": return c.injuries.length > 0;
    case "investigations": return c.investigations.length > 0;
    case "opinion": return !!c.opinion;
    case "police": return !!c.police.station;
    case "court": return !!c.court.name;
    case "pmNo": return !!c.refs.pmNo;
    case "inquest": return !!c.refs.inquest;
    case "external": return !!c.external;
    case "internal": return !!c.internal;
    case "lab": return c.lab.length > 0;
    case "cod": return !!(c.cod && c.cod.immediate);
    case "manner": return !!c.manner;
    case "tox": return c.tox.length > 0;
  }
  return true;
}

/* ---------- Role-based permissions ---------- */
const PERMS = {
  "Consultant JMO": ["draft", "submit", "approve", "print", "submitCourt", "version"],
  "Doctor / MOML": ["draft", "submit", "print", "submitCourt", "version"],
  "Assistant JMO": [],
  "Clerk": ["draft", "print", "submitCourt"],
  "Lab Staff": [],
  "Administrator": ["print"]
};
function role() { return $("#actingRole").value; }
function can(action) { return (PERMS[role()] || []).includes(action); }

/* ---------- Wizard state ---------- */
let selectedRepCase = null;
let currentReport = null;
let nextReportSeq = 1;

function openRStep(n) {
  document.querySelectorAll("#reportWizard .wstep").forEach((s) => {
    s.classList.toggle("open", Number(s.dataset.step) === n);
  });
  if (n === 2) renderCaseData();
  if (n === 3) populateReportTypes();
  if (n === 5) renderApprovalPanel();
}

document.querySelectorAll("#reportWizard .wstep-head").forEach((head) => {
  head.addEventListener("click", () => {
    const step = head.parentElement;
    if (step.classList.contains("open")) { step.classList.remove("open"); return; }
    openRStep(Number(step.dataset.step));
  });
});

document.querySelectorAll("[data-rgoto]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = Number(btn.dataset.rgoto);
    if (target > 1 && !selectedRepCase) { toast("Select a case first."); return; }
    openRStep(target);
  });
});

/* ---------- Step 1: case search ---------- */
const repCaseSearch = $("#repCaseSearch");
const repCaseOptions = $("#repCaseOptions");

function caseMatches(c, q) {
  const hay = [c.caseId, c.person, c.refs.mlef, c.refs.pmNo, c.refs.policeRef, c.refs.courtCase, c.refs.inquest]
    .join(" ").toLowerCase();
  return hay.includes(q);
}

function renderRepCaseOptions(q) {
  const query = (q || "").trim().toLowerCase();
  const matches = REPORT_CASES.filter((c) => !query || caseMatches(c, query));
  repCaseOptions.innerHTML = matches.length
    ? matches.map((c) => `
        <button type="button" class="case-option" data-repcase="${c.caseId}">
          <strong>${c.caseId}</strong>
          <span>${esc(c.person)} &middot; ${c.caseType} case
            ${c.refs.mlef ? " &middot; " + c.refs.mlef : ""}${c.refs.pmNo ? " &middot; " + c.refs.pmNo : ""}
            ${c.refs.policeRef ? " &middot; " + c.refs.policeRef : ""}</span>
        </button>`).join("")
    : '<p class="case-none">No matching case found.</p>';
  repCaseOptions.hidden = false;
}

repCaseSearch.addEventListener("input", () => renderRepCaseOptions(repCaseSearch.value));
repCaseSearch.addEventListener("focus", () => renderRepCaseOptions(repCaseSearch.value));
document.addEventListener("click", (e) => {
  if (!e.target.closest("#repCaseSelect")) repCaseOptions.hidden = true;
});
repCaseOptions.addEventListener("click", (e) => {
  const opt = e.target.closest("[data-repcase]");
  if (opt) selectRepCase(opt.dataset.repcase);
});

function selectRepCase(caseId, quiet) {
  const c = REPORT_CASES.find((x) => x.caseId === caseId);
  if (!c) { if (!quiet) toast(`Case ${caseId} not found in the register.`); return; }
  selectedRepCase = c;
  repCaseOptions.hidden = true;
  repCaseSearch.value = "";
  $("#repCaseChip").hidden = false;
  $("#repChipCase").textContent = c.caseId;
  $("#repChipMeta").textContent = `${c.person} - ${c.caseType} case`;
  $("#rsum1").textContent = `${c.caseId} - ${c.person} (${c.caseType})`;
  if (!quiet) openRStep(2);
}

$("#repChipClear").addEventListener("click", () => {
  selectedRepCase = null;
  $("#repCaseChip").hidden = true;
  $("#rsum1").textContent = "No case selected";
});

/* ---------- Step 2: case data view ---------- */
function rrow(label, val) {
  return val ? `<div class="rev-row"><span>${label}</span><strong>${esc(val)}</strong></div>` : "";
}
function rsection(title, rows) {
  return rows.trim() ? `<div class="rev-section"><h5>${title}</h5>${rows}</div>` : "";
}

function renderCaseData() {
  const c = selectedRepCase;
  const view = $("#caseDataView");
  if (!c) { view.innerHTML = '<p class="hint">Select a case first.</p>'; return; }
  view.innerHTML =
    rsection("Patient / deceased person",
      rrow("Name", c.patient.name) + rrow("Age", String(c.patient.age)) + rrow("Gender", c.patient.gender) +
      rrow("NIC", c.patient.nic) + rrow("Address", c.patient.address)) +
    rsection("Case",
      rrow("Case ID", c.caseId) + rrow("Case type", c.caseType) +
      rrow("MLEF no", c.refs.mlef) + rrow("PM registry no", c.refs.pmNo) +
      rrow("Inquest / court order", c.refs.inquest)) +
    rsection("Examination",
      rrow("Date & time", c.examDate) + rrow("Place", c.examPlace) + rrow("History", c.history) +
      rrow("External findings", c.external) + rrow("Internal findings", c.internal)) +
    rsection("Injuries", c.injuries.length
      ? c.injuries.map((i) => rrow("Injury", i)).join("")
      : rrow("Injuries", c.caseType === "Death" ? "None recorded" : "")) +
    rsection("Laboratory & toxicology",
      c.lab.map((l) => rrow("Lab", l)).join("") + c.tox.map((t) => rrow("Toxicology", t)).join("")) +
    rsection("Cause of death", c.cod
      ? rrow("Immediate", c.cod.immediate) + rrow("Underlying", c.cod.underlying) +
        rrow("Contributory", c.cod.contributory) + rrow("Manner of death", c.manner) : "") +
    rsection("Doctor's opinion", rrow("Opinion", c.opinion)) +
    rsection("Police information", rrow("Station", c.police.station) + rrow("Officer", c.police.officer)) +
    rsection("Court information",
      rrow("Court", c.court.name) + rrow("Case no", c.court.caseNo) +
      rrow("Trial date", c.court.trialDate) + rrow("Magistrate", c.court.magistrate)) +
    rsection("Assigned doctors",
      c.doctors.map((d) => rrow(d.role, `${d.name} (${d.designation})`)).join(""));
  $("#rsum2").textContent = `${c.caseId} data loaded from stored records`;
}

/* ---------- Step 3: report types + validation ---------- */
function availableReportTypes(c) {
  const t = [];
  if (c) {
    if (c.caseType === "Clinical") t.push("Medico-Legal Examination Form (MLEF)", "Medico-Legal Report (MLR)");
    if (c.caseType === "Death") t.push("Post-Mortem Report", "Cause of Death Form");
    if (c.tox.length) t.push("Toxicology Report");
    t.push("Supplementary Report", "Amendment Report");
  }
  t.push("Monthly Statistical Report", "Annual Summary Report");
  return t;
}

function populateReportTypes() {
  const sel = $("#repTypeSel");
  const current = sel.value;
  const types = availableReportTypes(selectedRepCase);
  sel.innerHTML = '<option value="">Select type…</option>' +
    types.map((t) => `<option>${t}</option>`).join("");
  if (types.includes(current)) sel.value = current;
  $("#reqCheck").hidden = true;
}

function validateReport(c, type) {
  const missing = [];
  (REPORT_REQUIREMENTS[type] || []).forEach((key) => {
    if (!hasField(c, key)) missing.push(FIELD_LABELS[key]);
  });
  return missing;
}

$("#btnValidateGenerate").addEventListener("click", () => {
  const type = $("#repTypeSel").value;
  const check = $("#reqCheck");
  if (!type) { toast("Select a report type."); return; }
  if (!can("draft")) { toast(`${role()} is not permitted to generate report drafts.`); return; }
  const isStat = type.includes("Statistical") || type.includes("Annual");
  if (!isStat && !selectedRepCase) { toast("Select a case first."); return; }

  if (!isStat) {
    const missing = validateReport(selectedRepCase, type);
    if (missing.length) {
      check.hidden = false;
      check.className = "req-check err";
      check.innerHTML = `<i class="ti ti-alert-triangle"></i> Cannot generate the final report. ` +
        `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} missing. ` +
        `Complete the case record and try again.`;
      return;
    }
    check.hidden = false;
    check.className = "req-check ok";
    check.innerHTML = '<i class="ti ti-circle-check"></i> All required information is available. Draft generated.';
  } else {
    check.hidden = true;
  }

  currentReport = {
    id: nextRepId++,
    reportNo: `RPT-2026-${String(nextReportSeq++).padStart(4, "0")}`,
    caseId: isStat ? "-" : selectedRepCase.caseId,
    type: type,
    version: 1,
    createdBy: role(),
    approvedBy: "-",
    generated: today(),
    approvalDate: "-",
    submitted: "-",
    submittedTo: "",
    receivingOfficer: "",
    status: "Draft",
    comments: ""
  };
  reports.unshift(currentReport);
  renderReports();
  refreshPreview();
  $("#rsum3").textContent = `${type} - draft ${currentReport.reportNo}`;
  openRStep(4);
  toast(`${type} generated as Draft (${currentReport.reportNo}) from stored case data.`);
});

/* ---------- Step 4: preview ---------- */
function refreshPreview() {
  if (!currentReport) return;
  $("#reportPreview").srcdoc = reportDocHTML(currentReport, false);
  $("#rsum4").textContent = `${currentReport.reportNo} - ${currentReport.type} (v${currentReport.version}, ${currentReport.status})`;
}

$("#btnRegen").addEventListener("click", () => {
  if (!currentReport) { toast("Generate a draft first."); return; }
  if (["Approved", "Submitted"].includes(currentReport.status)) {
    toast("Approved reports are locked. Create an amendment or new version instead.");
    return;
  }
  currentReport.generated = today();
  refreshPreview();
  renderReports();
  toast("Draft regenerated from the current stored case data.");
});

$("#btnOpenPrint").addEventListener("click", () => {
  if (!currentReport) { toast("Generate a draft first."); return; }
  openReportWindow(currentReport);
});

$("#btnSubmitApproval").addEventListener("click", () => {
  if (!currentReport) { toast("Generate a draft first."); return; }
  if (!can("submit")) { toast(`${role()} cannot submit reports for approval.`); return; }
  if (currentReport.status !== "Draft" && currentReport.status !== "Rejected") {
    toast(`Report is already ${currentReport.status}.`); return;
  }
  currentReport.status = "Pending Approval";
  renderReports();
  refreshPreview();
  openRStep(5);
  toast(`${currentReport.reportNo} submitted for approval.`);
});

/* ---------- Step 5: approval panel ---------- */
function renderApprovalPanel() {
  const p = $("#approvalPanel");
  const r = currentReport;
  if (!r) {
    p.innerHTML = '<p class="hint">Generate a draft, or open a report from the register below (workflow button).</p>';
    return;
  }
  const head = `
    <div class="rev-section">
      <h5>Report</h5>
      ${rrow("Report No", r.reportNo)}${rrow("Type", r.type)}${rrow("Case", r.caseId)}
      ${rrow("Version", "v" + r.version)}${rrow("Status", r.status)}${rrow("Created by", r.createdBy)}
      ${r.approvedBy !== "-" ? rrow("Approved by", `${r.approvedBy} on ${r.approvalDate}`) : ""}
      ${r.comments ? rrow("Comments", r.comments) : ""}
      ${r.submittedTo ? rrow("Submitted to", `${r.submittedTo} (${r.receivingOfficer}) on ${r.submitted}`) : ""}
    </div>`;

  let body = "";
  if (r.status === "Pending Approval") {
    body = can("approve") ? `
      <div class="approval-box">
        <h5>Approve & Sign (Consultant JMO)</h5>
        <div class="form-grid">
          <div class="field"><label>Approving JMO Name <span class="req">*</span></label>
            <input type="text" id="apprName" placeholder="e.g. Dr. N. Wickrama" /></div>
          <div class="field"><label>Rejection Comments (if rejecting)</label>
            <input type="text" id="apprComments" placeholder="Reason for rejection" /></div>
        </div>
        <div class="wstep-actions" style="justify-content:flex-start">
          <button type="button" class="btn primary" id="btnApprove"><i class="ti ti-signature"></i> Approve, Sign &amp; Lock</button>
          <button type="button" class="btn" id="btnReject"><i class="ti ti-x"></i> Reject with Comments</button>
        </div>
        <p class="hint">Approval adds the digital signature and JMO office stamp, and locks the report from editing.</p>
      </div>`
      : `<p class="req-check err" style="display:block"><i class="ti ti-lock"></i> Only an authorized Consultant JMO can approve final reports. Current role: ${role()}.</p>`;
  } else if (r.status === "Approved") {
    body = `
      <div class="approval-box">
        <h5>Export, Print &amp; Submit</h5>
        <div class="wstep-actions" style="justify-content:flex-start">
          <button type="button" class="btn" id="btnExportPdf"><i class="ti ti-download"></i> Export PDF</button>
          <button type="button" class="btn" id="btnPrintRep"><i class="ti ti-printer"></i> Print</button>
        </div>
        <div class="form-grid">
          <div class="field"><label>Submission Destination <span class="req">*</span></label>
            <select id="subDest">
              <option value="">Select…</option>
              <option>Magistrate's Court</option>
              <option>Police Station</option>
              <option>Inquirer into Sudden Deaths (ISD)</option>
              <option>Attorney General's Office</option>
              <option>Hospital Authority</option>
            </select></div>
          <div class="field"><label>Receiving Officer / Court Registrar</label>
            <input type="text" id="subOfficer" placeholder="Name of receiving officer" /></div>
          <div class="field"><label>Submission Date</label>
            <input type="date" id="subDate" /></div>
          <div class="field"><label>Certificate of Receipt (upload when returned)</label>
            <input type="file" id="subCert" accept=".pdf,.jpg,.jpeg,.png" /></div>
        </div>
        <div class="wstep-actions" style="justify-content:flex-start">
          <button type="button" class="btn primary" id="btnMarkSubmitted"><i class="ti ti-send"></i> Mark as Submitted</button>
        </div>
      </div>`;
  } else if (r.status === "Submitted" || r.status === "Amended") {
    body = `
      <div class="approval-box">
        <h5>Versions &amp; Amendments</h5>
        <p class="hint">The ${r.status.toLowerCase()} report is locked. When additional results arrive (e.g. toxicology or histopathology), create a new version - the original stays stored for audit.</p>
        <div class="wstep-actions" style="justify-content:flex-start">
          <button type="button" class="btn" id="btnPrintRep"><i class="ti ti-printer"></i> Print</button>
          <button type="button" class="btn primary" id="btnNewVersion"><i class="ti ti-versions"></i> Create New Version / Amendment</button>
        </div>
      </div>`;
  } else if (r.status === "Rejected") {
    body = `
      <div class="approval-box">
        <h5>Rejected</h5>
        <p class="req-check err" style="display:block"><i class="ti ti-alert-triangle"></i> ${esc(r.comments || "Rejected by approving JMO.")}</p>
        <div class="wstep-actions" style="justify-content:flex-start">
          <button type="button" class="btn primary" id="btnBackToDraft"><i class="ti ti-edit"></i> Revise Draft</button>
        </div>
      </div>`;
  } else {
    body = `<p class="hint">Draft in progress - submit it for approval from Step 4.</p>`;
  }
  p.innerHTML = head + body;
  $("#rsum5").textContent = `${r.reportNo} - ${r.status}`;

  /* wire buttons */
  document.getElementById("btnApprove")?.addEventListener("click", () => {
    const name = document.getElementById("apprName").value.trim();
    if (!name) { toast("Enter the approving JMO's name to sign."); return; }
    r.status = "Approved";
    r.approvedBy = name;
    r.approvalDate = today();
    renderReports(); refreshPreview(); renderApprovalPanel();
    toast(`${r.reportNo} approved and digitally signed by ${name}. Locked from editing.`);
  });
  document.getElementById("btnReject")?.addEventListener("click", () => {
    const comments = document.getElementById("apprComments").value.trim();
    if (!comments) { toast("Enter rejection comments."); return; }
    r.status = "Rejected";
    r.comments = comments;
    renderReports(); refreshPreview(); renderApprovalPanel();
    toast(`${r.reportNo} rejected with comments.`);
  });
  document.getElementById("btnExportPdf")?.addEventListener("click", () => openReportWindow(r));
  document.getElementById("btnPrintRep")?.addEventListener("click", () => openReportWindow(r));
  document.getElementById("btnMarkSubmitted")?.addEventListener("click", () => {
    if (!can("submitCourt")) { toast(`${role()} cannot record submissions.`); return; }
    const dest = document.getElementById("subDest").value;
    if (!dest) { toast("Select the submission destination."); return; }
    r.submittedTo = dest;
    r.receivingOfficer = document.getElementById("subOfficer").value.trim() || "Not recorded";
    r.submitted = document.getElementById("subDate").value || today();
    r.status = "Submitted";
    const cert = document.getElementById("subCert").files[0];
    if (cert) {
      documents.unshift({
        id: nextDocId++,
        name: `${r.caseId}_Certificate-of-Receipt_${today()}_v1.${cert.name.split(".").pop()}`,
        caseId: r.caseId, type: "Certificate of Receipt", uploaded: today(),
        by: "Current User", version: 1, restricted: false, active: true,
        fileUrl: URL.createObjectURL(cert)
      });
      renderDocuments();
    }
    renderReports(); refreshPreview(); renderApprovalPanel();
    toast(`${r.reportNo} marked as submitted to ${dest}.${cert ? " Certificate of Receipt stored." : ""}`);
  });
  document.getElementById("btnNewVersion")?.addEventListener("click", () => {
    if (!can("version")) { toast(`${role()} cannot create report versions.`); return; }
    if (r.status === "Submitted" || r.status === "Approved") r.status = "Amended";
    const nv = {
      ...r,
      id: nextRepId++,
      version: r.version + 1,
      createdBy: role(),
      approvedBy: "-", approvalDate: "-",
      submitted: "-", submittedTo: "", receivingOfficer: "",
      generated: today(), status: "Draft", comments: ""
    };
    reports.unshift(nv);
    currentReport = nv;
    renderReports(); refreshPreview(); renderApprovalPanel();
    openRStep(4);
    toast(`Version v${nv.version} created as Draft. v${r.version} kept for audit.`);
  });
  document.getElementById("btnBackToDraft")?.addEventListener("click", () => {
    r.status = "Draft";
    renderReports(); refreshPreview(); renderApprovalPanel();
    openRStep(4);
    toast("Report returned to Draft for revision.");
  });
}

/* ---------- Reports register table ---------- */
function renderReports() {
  const q = $("#repSearch").value.trim().toLowerCase();
  const status = $("#repFilterStatus").value;
  const body = $("#repTableBody");
  body.innerHTML = "";

  const rows = reports.filter((r) => {
    const hay = `${r.reportNo} ${r.caseId} ${r.type} ${r.createdBy} ${r.approvedBy}`.toLowerCase();
    const matchQ = !q || hay.includes(q);
    const matchS = !status || r.status === status;
    return matchQ && matchS;
  });

  $("#repEmpty").hidden = rows.length > 0;

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="file-name" data-viewrep="${r.id}"><i class="ti ti-file-text"></i>${r.reportNo}</span></td>
      <td>${r.caseId}</td>
      <td>${r.type}</td>
      <td>v${r.version}</td>
      <td>${r.createdBy}</td>
      <td>${r.approvedBy}</td>
      <td>${r.generated}</td>
      <td>${r.approvalDate}</td>
      <td>${r.submitted}</td>
      <td><span class="badge ${statusClass(r.status)}">${r.status}</span></td>
      <td class="actions">
        <button class="btn icon" title="View / print report" data-viewrep="${r.id}"><i class="ti ti-file-search"></i></button>
        <button class="btn icon" title="Open workflow (approve / submit)" data-flow="${r.id}"><i class="ti ti-route"></i></button>
      </td>`;
    body.appendChild(tr);
  });
}

$("#repTableBody").addEventListener("click", (e) => {
  const view = e.target.closest("[data-viewrep]");
  const flow = e.target.closest("[data-flow]");
  if (view) {
    const r = reports.find((x) => x.id === Number(view.dataset.viewrep));
    if (r) openReportWindow(r);
  }
  if (flow) {
    const r = reports.find((x) => x.id === Number(flow.dataset.flow));
    if (r) {
      currentReport = r;
      if (r.caseId !== "-") selectRepCase(r.caseId, true);
      refreshPreview();
      openRStep(r.status === "Draft" || r.status === "Rejected" ? 4 : 5);
    }
  }
});

$("#repSearch").addEventListener("input", renderReports);
$("#repFilterStatus").addEventListener("change", renderReports);

/* ==================================================================
   REPORT DOCUMENT BUILDER (filled from stored case data)
   ================================================================== */
function dl(label, value) {
  return `<div class="fline"><span class="flabel">${label}</span><span class="dots">${value || ""}</span></div>`;
}
function para(title, text) {
  return text ? `<h3>${title}</h3><p class="body-text">${esc(text)}</p>` : "";
}
function listBlock(title, items) {
  return items && items.length
    ? `<h3>${title}</h3><ul class="body-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
}

function reportBody(r) {
  const c = REPORT_CASES.find((x) => x.caseId === r.caseId);
  const isStat = r.type.includes("Statistical") || r.type.includes("Annual");

  let content = "";
  if (isStat) {
    const byStatus = {};
    reports.forEach((x) => { byStatus[x.status] = (byStatus[x.status] || 0) + 1; });
    content = `
      <h3>Departmental Summary</h3>
      <table class="doc-table">
        <thead><tr><th>Metric</th><th>Count</th></tr></thead>
        <tbody>
          <tr><td>Registered cases (register extract)</td><td>${REPORT_CASES.length}</td></tr>
          <tr><td>Clinical cases</td><td>${REPORT_CASES.filter((x) => x.caseType === "Clinical").length}</td></tr>
          <tr><td>Death / postmortem cases</td><td>${REPORT_CASES.filter((x) => x.caseType === "Death").length}</td></tr>
          <tr><td>Reports generated</td><td>${reports.length}</td></tr>
          ${Object.entries(byStatus).map(([s, n]) => `<tr><td>Reports - ${s}</td><td>${n}</td></tr>`).join("")}
          <tr><td>Documents stored</td><td>${documents.length}</td></tr>
        </tbody>
      </table>
      <p class="small">Compiled automatically from the case, examination and document registers.</p>`;
  } else if (c) {
    const patientBlock = `
      <h3>A. Identification</h3>
      ${dl("Full Name", c.patient.name)}
      <div class="grid3">${dl("Age", String(c.patient.age))}${dl("Gender", c.patient.gender)}${dl("NIC", c.patient.nic)}</div>
      ${dl("Address", c.patient.address)}
      <div class="grid2">${dl("Place of examination", c.examPlace)}${dl("Date & time of examination", c.examDate)}</div>`;
    const policeCourt = `
      <h3>Police and Court References</h3>
      <div class="grid2">
        ${dl("Police station", c.police.station)}${dl("Investigating officer", c.police.officer)}
        ${dl("Police reference", c.refs.policeRef)}${dl("Court", c.court.name)}
        ${dl("Court case no", c.court.caseNo)}${dl("Date of trial", c.court.trialDate)}
      </div>`;
    const doctors = `
      <h3>Medical Officers</h3>
      ${c.doctors.map((d) => dl(d.role, `${d.name} - ${d.designation}`)).join("")}`;

    if (r.type === "Medico-Legal Examination Form (MLEF)") {
      content = `
        <h3>Part A - Issued by Police Officer</h3>
        <div class="grid3">${dl("Police Station", c.police.station)}${dl("Date of Issue", r.generated)}${dl("MLEF No", c.refs.mlef)}</div>
        ${dl("Full Name and Address of the examinee", `${c.patient.name}, ${c.patient.address}`)}
        <div class="grid3">${dl("Age", String(c.patient.age))}${dl("Sex", c.patient.gender)}${dl("NIC", c.patient.nic)}</div>
        ${dl("Reason for referring for examination", c.history)}
        ${dl("Police Officer Issuing - Rank / Reg No / Name", c.police.officer)}
        <h3>Part B - Filled by Medical Officer</h3>
        <div class="grid2">${dl("Examination - Date and Time", c.examDate)}${dl("Place", c.examPlace)}</div>` +
        listBlock("Nature of the Bodily Harm", c.injuries) +
        listBlock("Alcohol / Drug Examination", c.tox) +
        para("Remarks", c.opinion) + doctors;
    } else if (r.type === "Medico-Legal Report (MLR)") {
      content = patientBlock + policeCourt +
        para("B. Short History Given by Patient", c.history) +
        (c.injuries.length ? `
          <h3>C. Injuries</h3>
          <table class="doc-table">
            <thead><tr><th style="width:60px">No.</th><th>Nature, size, shape, disposition and site of injury</th></tr></thead>
            <tbody>${c.injuries.map((i, n) => `<tr><td>${n + 1}</td><td>${esc(i.replace(/^\d+\.\s*/, ""))}</td></tr>`).join("")}</tbody>
          </table>` : "") +
        listBlock("Special Investigations", c.investigations.concat(c.tox)) +
        para("D. Opinion", c.opinion) + doctors;
    } else if (r.type === "Post-Mortem Report") {
      content = patientBlock + policeCourt +
        `<div class="grid2">${dl("PM registry no", c.refs.pmNo)}${dl("Inquest / court order", c.refs.inquest)}</div>` +
        para("Circumstances / History", c.history) +
        para("External Examination", c.external) +
        para("Internal Examination", c.internal) +
        listBlock("Laboratory & Toxicology Findings", c.lab.concat(c.tox)) +
        (c.cod ? `
          <h3>Cause of Death</h3>
          ${dl("I (a) Immediate cause", c.cod.immediate)}
          ${dl("I (b) Underlying cause", c.cod.underlying)}
          ${dl("II Contributory", c.cod.contributory)}
          ${dl("Manner of death", c.manner)}` : "") +
        para("Opinion", c.opinion) + doctors;
    } else if (r.type === "Cause of Death Form") {
      content = patientBlock +
        `<div class="grid2">${dl("PM registry no", c.refs.pmNo)}${dl("Inquest no", c.refs.inquest)}</div>` +
        (c.cod ? `
          <h3>Cause of Death</h3>
          ${dl("I (a) Immediate cause", c.cod.immediate)}
          ${dl("I (b) Underlying cause", c.cod.underlying)}
          ${dl("II Contributory causes", c.cod.contributory)}
          ${dl("Manner of death", c.manner)}` : "") +
        `<p class="small">Issued for transmission to the Inquirer / Registrar of Deaths.</p>` + doctors;
    } else if (r.type === "Toxicology Report") {
      content = patientBlock +
        listBlock("Samples Analysed & Results", c.tox) +
        para("Remarks", c.opinion) + doctors;
    } else {
      /* Supplementary / Amendment */
      content = patientBlock + policeCourt +
        `<h3>${r.type} - Reference</h3>
         ${dl("Amends / supplements report", r.reportNo + " v" + Math.max(1, r.version - 1))}
         ${dl("Reason", "Additional findings received")}` +
        listBlock("Additional Findings", c.lab.concat(c.tox)) +
        para("Revised Opinion", c.opinion) + doctors;
    }
  } else {
    content = `<p class="small">Case ${r.caseId} not found in the register - report generated with references only.</p>`;
  }

  const approvalBlock = r.approvedBy !== "-"
    ? `<div class="approved-mark">APPROVED &amp; DIGITALLY SIGNED<br>${esc(r.approvedBy)} &mdash; ${r.approvalDate}</div>`
    : `<div class="draft-mark">${r.status.toUpperCase()}</div>`;

  return `
  <div class="form-doc">
    <p class="office">Office of the Judicial Medical Officer<br>National Hospital of Sri Lanka, Colombo</p>
    <h1>${r.type}</h1>
    <div class="grid3">
      ${dl("Report No", r.reportNo)}${dl("Version", "v" + r.version)}${dl("Date generated", r.generated)}
    </div>
    <div class="grid3">
      ${dl("Case ID", r.caseId)}${dl("Status", r.status)}${dl("Created by", r.createdBy)}
    </div>
    ${content}
    <div class="sig-row">
      <div>
        ${dl("Signature of Medical Officer", "")}
        ${dl("Name & designation", "")}
        ${dl("Date", "")}
      </div>
      <div class="stamp-box">JMO OFFICE<br>OFFICIAL STAMP</div>
    </div>
    ${approvalBlock}
  </div>`;
}

function reportDocHTML(r, withToolbar) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${r.reportNo} - ${r.type}</title>
  <style>
    body { font-family: "Times New Roman", Georgia, serif; color: #111; margin: 30px auto; max-width: 780px; padding: 0 20px; }
    .office { text-align: center; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 10px; }
    h1 { text-align: center; font-size: 20px; letter-spacing: 1px; margin: 0 0 16px; text-transform: uppercase; }
    h3 { font-size: 13px; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .fline { display: flex; gap: 8px; margin: 9px 0; font-size: 13px; align-items: flex-end; }
    .dots { flex: 1; border-bottom: 1px dotted #333; min-height: 17px; min-width: 40px; padding: 0 4px; font-weight: bold; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; column-gap: 28px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; column-gap: 24px; }
    .doc-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 8px 0; }
    .doc-table th, .doc-table td { border: 1px solid #333; padding: 8px; text-align: left; }
    .body-text { font-size: 13px; line-height: 1.6; margin: 6px 0; }
    .body-list { font-size: 13px; line-height: 1.7; margin: 6px 0 6px 22px; }
    .small { font-size: 11.5px; font-style: italic; color: #333; margin: 8px 0; }
    .sig-row { display: flex; gap: 40px; margin-top: 34px; align-items: flex-end; }
    .sig-row > div:first-child { flex: 1; }
    .stamp-box { width: 150px; height: 100px; border: 2px dashed #555; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #555; letter-spacing: 1px; }
    .approved-mark { margin-top: 24px; border: 2px solid #157347; color: #157347; display: inline-block; padding: 8px 16px; font-size: 12px; font-weight: bold; letter-spacing: 1px; transform: rotate(-2deg); }
    .draft-mark { margin-top: 24px; border: 2px solid #96660a; color: #96660a; display: inline-block; padding: 8px 16px; font-size: 12px; font-weight: bold; letter-spacing: 2px; transform: rotate(-2deg); }
    .toolbar { position: fixed; bottom: 20px; right: 20px; display: flex; gap: 10px; }
    .toolbar button { font: 14px sans-serif; padding: 10px 18px; background: #2457e6; color: #fff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(11,21,48,0.25); }
    .toolbar button.ghost { background: #fff; color: #1c2333; border: 1px solid #c3cde3; }
    @media print { .toolbar { display: none; } body { margin: 0 auto; } }
  </style></head><body>${reportBody(r)}
  ${withToolbar ? `<div class="toolbar">
    <button class="ghost" onclick="window.close()">Close Preview</button>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>` : ""}
  </body></html>`;
}

function openReportWindow(r) {
  const w = window.open("", "_blank");
  if (!w) { toast("Pop-up blocked. Allow pop-ups to view the report."); return; }
  w.document.write(reportDocHTML(r, true));
  w.document.close();
}

/* ---------- Init ---------- */
if (urlCaseId) selectRepCase(urlCaseId, true);
renderDocuments();
renderReports();
