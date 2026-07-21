/* ============ MedLogs - Settings ============ */

/* ---------- Sample backup history (replace with API calls) ---------- */
let backupHistory = [
  { id: 1, datetime: "2026-07-21 02:00", type: "Automatic daily", size: "48.6 GB", status: "Success" },
  { id: 2, datetime: "2026-07-20 02:00", type: "Automatic daily", size: "48.4 GB", status: "Success" },
  { id: 3, datetime: "2026-07-19 02:00", type: "Automatic daily", size: "48.3 GB", status: "Success" },
  { id: 4, datetime: "2026-07-18 02:00", type: "Automatic daily", size: "48.1 GB", status: "Failed" },
  { id: 5, datetime: "2026-07-17 14:22", type: "Manual", size: "48.1 GB", status: "Success" },
  { id: 6, datetime: "2025-12-31 23:00", type: "Annual snapshot", size: "41.9 GB", status: "Success" }
];
let nextBackupId = 7;

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.hidden = true), 2600);
}

function now() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

/* ---------- Backup history render ---------- */
function renderBackupHistory() {
  const body = $("#backupHistoryBody");
  body.innerHTML = "";
  backupHistory.forEach((b) => {
    const badge =
      b.status === "Success"
        ? '<span class="badge ok"><i class="ti ti-check"></i> Success</span>'
        : b.status === "Running"
        ? '<span class="badge warn"><i class="ti ti-loader"></i> Running…</span>'
        : '<span class="badge err"><i class="ti ti-x"></i> Failed</span>';
    const restoreBtn =
      b.status === "Success"
        ? `<button class="btn icon" title="Restore from this point" data-restore="${b.id}"><i class="ti ti-restore"></i></button>`
        : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.datetime}</td>
      <td>${b.type}</td>
      <td>${b.size}</td>
      <td>${badge}</td>
      <td class="actions">${restoreBtn}</td>`;
    body.appendChild(tr);
  });
}

/* ---------- Backup now (simulated) ---------- */
$("#btnBackupNow").addEventListener("click", () => {
  const btn = $("#btnBackupNow");
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader"></i> Backing up…';

  const entry = { id: nextBackupId++, datetime: now(), type: "Manual", size: "—", status: "Running" };
  backupHistory.unshift(entry);
  renderBackupHistory();

  /* Simulate backup completing - replace with real API call */
  setTimeout(() => {
    entry.status = "Success";
    entry.size = "48.6 GB";
    $("#lastBackup").textContent = entry.datetime;
    $("#lastBackupStatus").innerHTML = '<i class="ti ti-circle-check"></i> Success';
    $("#lastBackupStatus").className = "stat-sub ok";
    renderBackupHistory();
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-cloud-upload"></i> Backup Now';
    toast("Manual backup completed and copied to both locations.");
  }, 2000);
});

/* ---------- Restore ---------- */
$("#backupHistoryBody").addEventListener("click", (e) => {
  const restore = e.target.closest("[data-restore]");
  if (!restore) return;
  const b = backupHistory.find((x) => x.id === Number(restore.dataset.restore));
  if (
    b &&
    confirm(
      `Restore the system from backup taken ${b.datetime}?\n\nWARNING: Data entered after this point will be unavailable until re-synced. This action is logged in the audit trail.`
    )
  ) {
    toast(`Restore from ${b.datetime} started. Administrators will be notified on completion.`);
  }
});

/* ---------- Sync now (simulated) ---------- */
$("#btnSyncNow").addEventListener("click", () => {
  const btn = $("#btnSyncNow");
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader"></i> Syncing…';
  setTimeout(() => {
    $("#syncStatus").textContent = `Last synced: ${now()} - all records up to date`;
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-refresh"></i> Sync Now';
    toast("Synchronization complete. All offline records uploaded.");
  }, 1500);
});

/* ---------- Confidentiality toggles: warn before disabling ---------- */
["tglSexualAssault", "tglMinors", "tglPolice", "tgl2fa"].forEach((id) => {
  $("#" + id).addEventListener("change", (e) => {
    if (!e.target.checked) {
      const ok = confirm(
        "Disabling this protection reduces data confidentiality and will be recorded in the audit log.\n\nAre you sure?"
      );
      if (!ok) {
        e.target.checked = true;
        return;
      }
      toast("Protection disabled. Change recorded in audit log.");
    }
  });
});

/* ---------- Save / Reset ---------- */
function collectSettings() {
  return {
    backup: {
      frequency: $("#backupFreq").value,
      time: $("#backupTime").value,
      retention: $("#backupRetention").value,
      annualSnapshot: $("#annualSnapshot").value
    },
    security: {
      sessionTimeout: $("#sessionTimeout").value,
      lockoutAttempts: $("#lockoutAttempts").value,
      pwdLength: $("#pwdLength").value,
      pwdExpiry: $("#pwdExpiry").value,
      twoFactor: $("#tgl2fa").checked,
      complexPasswords: $("#tglComplex").checked,
      restrictSexualAssault: $("#tglSexualAssault").checked,
      restrictMinors: $("#tglMinors").checked,
      limitPoliceAccess: $("#tglPolice").checked
    },
    system: {
      offlineEntry: $("#tglOffline").checked,
      courtAlerts: $("#tglCourtAlerts").checked,
      taskAlerts: $("#tglTaskAlerts").checked,
      alertLead: $("#alertLead").value,
      archiveAccess: $("#tglArchiveAccess").checked,
      officeName: $("#officeName").value,
      caseFormat: $("#caseFormat").value,
      dateFormat: $("#dateFormat").value,
      language: $("#language").value
    }
  };
}

$("#btnSave").addEventListener("click", () => {
  const settings = collectSettings();
  /* Replace with API call: POST /api/settings */
  console.log("Saving settings:", settings);
  toast("Settings saved. Change recorded in audit log.");
});

$("#btnReset").addEventListener("click", () => {
  if (confirm("Reset all settings to recommended defaults?")) {
    $("#backupFreq").selectedIndex = 0;
    $("#backupTime").value = "02:00";
    $("#backupRetention").selectedIndex = 0;
    $("#annualSnapshot").selectedIndex = 0;
    $("#sessionTimeout").selectedIndex = 1;
    $("#lockoutAttempts").selectedIndex = 1;
    $("#pwdLength").selectedIndex = 1;
    $("#pwdExpiry").selectedIndex = 1;
    ["tgl2fa", "tglComplex", "tglSexualAssault", "tglMinors", "tglPolice",
     "tglOffline", "tglCourtAlerts", "tglTaskAlerts", "tglArchiveAccess"
    ].forEach((id) => ($("#" + id).checked = true));
    $("#alertLead").selectedIndex = 1;
    toast("Settings reset to recommended defaults. Click Save to apply.");
  }
});

/* ---------- Init ---------- */
renderBackupHistory();
