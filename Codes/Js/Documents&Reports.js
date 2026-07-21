/* ==========================================================================
   DOCUMENTS.JS — Document Upload & Viewer Page Logic
   ========================================================================== */

(function () {
  'use strict';

  // ========================================================================
  //  SAMPLE DATA
  // ========================================================================

  const sampleCases = []

  const sampleDocuments = {}

  const sampleVersionHistory = [
    { version: '1.0', status: 'Initial Upload', date: '16 Jul 2026, 10:25 AM', author: 'S. Perera', reason: 'Initial upload', current: false },
    { version: '1.1', status: 'Amended', date: '17 Jul 2026, 11:10 AM', author: 'Dr. A. Silva', reason: 'Corrected patient address and injury description', current: true }
  ];

  const sampleActivityLog = [
    { time: '10:25 AM', icon: 'upload', text: '<strong>S. Perera</strong> uploaded the document', date: '16 Jul 2026' },
    { time: '11:10 AM', icon: 'view', text: '<strong>Dr. A. Silva</strong> viewed the document', date: '16 Jul 2026' },
    { time: '11:15 AM', icon: 'download', text: '<strong>Dr. A. Silva</strong> downloaded the document', date: '16 Jul 2026' },
    { time: '11:10 AM', icon: 'edit', text: '<strong>Dr. A. Silva</strong> uploaded version 1.1', date: '17 Jul 2026' },
    { time: '02:30 PM', icon: 'approve', text: '<strong>Dr. A. Silva</strong> approved the document', date: '17 Jul 2026' }
  ];

  // ========================================================================
  //  STATE
  // ========================================================================

  let selectedCase = null;
  let selectedDoc = null;
  let currentPage = 1;
  let zoomPercent = 100;
  let rotation = 0;
  let uploadFiles = [];
  let bulkFiles = [];

  // ========================================================================
  //  DOM REFERENCES
  // ========================================================================

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ========================================================================
  //  TOAST NOTIFICATIONS
  // ========================================================================

  function showToast(message, type = 'info', duration = 4000) {
    const container = $('#toastContainer');
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg"></span>
      <button class="toast-close">&times;</button>
    `;
    toast.querySelector('.toast-msg').textContent = message;

    const remove = () => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => toast.remove());
    };
    toast.querySelector('.toast-close').addEventListener('click', remove);
    container.appendChild(toast);
    setTimeout(remove, duration);
  }

  // ========================================================================
  //  SIDEBAR TOGGLE
  // ========================================================================

  const sidebar = $('#sidebar');
  const sidebarOverlay = $('#sidebarOverlay');
  const menuBtn = $('#menuBtn');

  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
  });

  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  });

  // ========================================================================
  //  CASE SEARCH & SELECT
  // ========================================================================

  const caseSearchInput = $('#caseSearchInput');
  const caseSearchBtn = $('#caseSearchBtn');
  const caseSummary = $('#caseSummary');

  function selectCase(c) {
    selectedCase = c;
    caseSummary.classList.add('visible');

    $('#summCaseId').textContent = c.caseId;
    $('#summCaseType').textContent = c.type;
    $('#summCaseType').className = 'badge ' + c.typeBadge;
    $('#summStatus').textContent = c.status;
    $('#summStatus').className = 'badge ' + c.statusBadge;
    $('#summPatient').textContent = c.patient;
    $('#summPatientId').textContent = c.patientId;
    $('#summMLEF').textContent = c.mlef || c.pm || '—';
    $('#summPolice').textContent = c.police;
    $('#summJMO').textContent = c.jmo;
    $('#summCourt').textContent = c.court || '—';

    // Pre-fill upload modals
    $('#uploadCaseId').textContent = c.caseId;
    $('#uploadPatientName').textContent = c.patient;
    $('#uploadCaseType').textContent = c.type;
    $('#bulkCaseId').value = c.caseId;

    selectedDoc = null;
    renderDocumentList();
    resetViewer();
  }

  function searchCase() {
    const q = caseSearchInput.value.trim().toLowerCase();
    if (!q) return;

    const found = sampleCases.find(c =>
      c.caseId.toLowerCase().includes(q) ||
      c.patient.toLowerCase().includes(q) ||
      c.mlef.toLowerCase().includes(q) ||
      c.pm.toLowerCase().includes(q) ||
      c.policeRef.toLowerCase().includes(q) ||
      c.court.toLowerCase().includes(q) ||
      c.patientId.toLowerCase().includes(q)
    );

    if (found) {
      selectCase(found);
    } else {
      caseSummary.classList.remove('visible');
      showToast('No case found matching "' + caseSearchInput.value.trim() + '".', 'error');
    }
  }

  caseSearchBtn.addEventListener('click', searchCase);
  caseSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchCase(); });

  // ========================================================================
  //  DOCUMENT LIST
  // ========================================================================

  const docListScroll = $('#docListScroll');
  const docEmptyState = $('#docEmptyState');
  const docCount = $('#docCount');
  const docSearchInput = $('#docSearchInput');
  const filterDocType = $('#filterDocType');
  const filterDocStatus = $('#filterDocStatus');
  const filterDocDate = $('#filterDocDate');

  function getDocIconClass(doc) {
    const ext = doc.filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'tiff', 'tif'].includes(ext)) return 'img';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    return 'default';
  }

  function getDocIcon(doc) {
    const cls = getDocIconClass(doc);
    if (cls === 'pdf') return '📄';
    if (cls === 'img') return '🖼';
    if (cls === 'doc') return '📝';
    return '📎';
  }

  function filterDocuments(docs) {
    let filtered = [...docs];
    const search = docSearchInput.value.trim().toLowerCase();
    const typeFilter = filterDocType.value;
    const statusFilter = filterDocStatus.value;

    if (search) {
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(search) ||
        d.filename.toLowerCase().includes(search) ||
        d.typeLabel.toLowerCase().includes(search) ||
        d.fileId.toLowerCase().includes(search)
      );
    }
    if (typeFilter) {
      filtered = filtered.filter(d => d.type === typeFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    return filtered;
  }

  function renderDocumentList() {
    if (!selectedCase) {
      docListScroll.innerHTML = '<p class="empty-state">Select a case to view its documents.</p>';
      docCount.textContent = '0 Documents';
      return;
    }

    const docs = sampleDocuments[selectedCase.caseId] || [];
    const filtered = filterDocuments(docs);
    docCount.textContent = filtered.length + ' Document' + (filtered.length !== 1 ? 's' : '');

    if (filtered.length === 0) {
      docListScroll.innerHTML = '<p class="empty-state">No documents found.</p>';
      return;
    }

    docListScroll.innerHTML = filtered.map(doc => `
      <div class="doc-item ${selectedDoc && selectedDoc.fileId === doc.fileId ? 'selected' : ''}" data-file-id="${doc.fileId}">
        <div class="doc-item-icon ${getDocIconClass(doc)}">${getDocIcon(doc)}</div>
        <div class="doc-item-info">
          <h4>${doc.title}</h4>
          <p class="doc-filename">${doc.filename}</p>
          <div class="doc-item-meta">
            <span class="badge ${doc.statusBadge}" style="font-size:0.65rem;padding:2px 8px;">${doc.statusLabel}</span>
            <span class="badge ${doc.confBadge}" style="font-size:0.65rem;padding:2px 8px;">${doc.confLabel}</span>
            <small>${doc.uploadDate}</small>
          </div>
        </div>
        <div class="doc-item-actions">
          <button class="btn sm outline view-btn" data-file-id="${doc.fileId}">View</button>
          <button class="doc-more-btn more-btn" data-file-id="${doc.fileId}">⋮</button>
        </div>
      </div>
    `).join('');

    // Click handlers
    docListScroll.querySelectorAll('.doc-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.more-btn') || e.target.closest('.view-btn')) return;
        const fid = el.dataset.fileId;
        const doc = docs.find(d => d.fileId === fid);
        if (doc) openDocument(doc);
      });
    });

    docListScroll.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const doc = docs.find(d => d.fileId === btn.dataset.fileId);
        if (doc) openDocument(doc);
      });
    });

    docListScroll.querySelectorAll('.more-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const doc = docs.find(d => d.fileId === btn.dataset.fileId);
        if (doc) showContextMenu(e, doc);
      });
    });
  }

  // Filters
  docSearchInput.addEventListener('input', renderDocumentList);
  filterDocType.addEventListener('change', renderDocumentList);
  filterDocStatus.addEventListener('change', renderDocumentList);
  filterDocDate.addEventListener('change', renderDocumentList);

  // ========================================================================
  //  DOCUMENT VIEWER
  // ========================================================================

  function resetViewer() {
    $('#viewerDocTitle').textContent = 'No Document Selected';
    $('#viewerDocFile').textContent = 'Select a document from the list to preview it here.';
    $('#viewerActions').style.display = 'none';
    $('#viewerToolbar').style.display = 'none';
    $('#viewerEmpty').style.display = 'block';
    $('#viewerDocument').classList.remove('active');
    $('#docDetailsBar').classList.remove('visible');
    currentPage = 1;
    zoomPercent = 100;
    rotation = 0;
    renderBottomTabs(null);
  }

  function openDocument(doc) {
    selectedDoc = doc;
    renderDocumentList();

    // Header
    $('#viewerDocTitle').textContent = doc.title;
    $('#viewerDocFile').textContent = doc.filename;
    $('#viewerActions').style.display = 'flex';
    $('#viewerToolbar').style.display = 'flex';
    $('#viewerEmpty').style.display = 'none';

    // Viewer content
    const viewer = $('#viewerDocument');
    viewer.classList.add('active');

    currentPage = 1;
    zoomPercent = 100;
    rotation = 0;
    $('#totalPages').textContent = doc.pages;
    $('#pageInput').value = 1;
    $('#pageInput').max = doc.pages;
    $('#zoomLevel').textContent = '100%';

    renderViewerPage(doc);

    // Details bar
    renderDetailsBar(doc);

    // Bottom tabs
    renderBottomTabs(doc);
  }

  function renderViewerPage(doc) {
    const page = $('#viewerPage');
    const isImage = ['jpg', 'jpeg', 'png', 'tiff', 'tif'].includes(doc.filename.split('.').pop().toLowerCase());

    // Generate a placeholder representing the document
    const colors = {
      'mlef': '#2563eb', 'mlr': '#1d4ed8', 'pmr': '#7c3aed',
      'exam-photo': '#10b981', 'injury-diagram': '#f59e0b',
      'toxicology': '#ef4444', 'police-request': '#64748b',
      'consent': '#06b6d4', 'medical-note': '#2563eb',
      'xray': '#8b5cf6', 'court-submission': '#0f172a',
      'cert-receipt': '#10b981', 'histopathology': '#dc2626',
      'inquest-order': '#64748b', 'cod-form': '#7c3aed'
    };
    const color = colors[doc.type] || '#64748b';

    if (isImage) {
      page.innerHTML = `
        <div style="width:600px;height:450px;background:linear-gradient(135deg,${color}22,${color}11);display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid ${color}33;border-radius:4px;">
          <div style="font-size:4rem;margin-bottom:16px;">🖼</div>
          <div style="font-size:1rem;font-weight:700;color:${color};margin-bottom:4px;">${doc.title}</div>
          <div style="font-size:0.8rem;color:#64748b;">${doc.filename} — ${doc.size}</div>
          <div style="font-size:0.75rem;color:#94a3b8;margin-top:8px;">Image preview placeholder</div>
        </div>
      `;
    } else {
      page.innerHTML = `
        <div style="width:595px;min-height:760px;padding:48px 40px;background:#fff;display:flex;flex-direction:column;border:1px solid #e5e7eb;">
          <div style="text-align:center;border-bottom:2px solid ${color};padding-bottom:16px;margin-bottom:24px;">
            <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:4px;">Democratic Socialist Republic of Sri Lanka</div>
            <div style="font-size:1.1rem;font-weight:700;color:${color};">${doc.typeLabel}</div>
            <div style="font-size:0.8rem;color:#64748b;margin-top:4px;">Judicial Medical Officer's Office</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.82rem;margin-bottom:24px;">
            <div><span style="color:#94a3b8;">File ID:</span> <strong>${doc.fileId}</strong></div>
            <div><span style="color:#94a3b8;">Case ID:</span> <strong>${selectedCase.caseId}</strong></div>
            <div><span style="color:#94a3b8;">Patient:</span> <strong>${selectedCase.patient}</strong></div>
            <div><span style="color:#94a3b8;">Date:</span> <strong>${doc.date}</strong></div>
            ${doc.examination ? `<div><span style="color:#94a3b8;">Examination:</span> <strong>${doc.examination}</strong></div>` : ''}
            ${doc.evidence ? `<div><span style="color:#94a3b8;">Evidence:</span> <strong>${doc.evidence}</strong></div>` : ''}
          </div>
          <div style="flex:1;display:flex;align-items:center;justify-content:center;border:1px dashed #e5e7eb;border-radius:8px;min-height:300px;">
            <div style="text-align:center;color:#94a3b8;">
              <div style="font-size:3rem;margin-bottom:8px;">📄</div>
              <div style="font-size:0.85rem;font-weight:500;">Document Content Preview</div>
              <div style="font-size:0.75rem;margin-top:4px;">Page ${currentPage} of ${doc.pages}</div>
              <div style="font-size:0.72rem;margin-top:2px;">${doc.size} — ${doc.format}</div>
            </div>
          </div>
          <div style="text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:0.7rem;color:#94a3b8;">
            ${doc.filename} &nbsp;|&nbsp; Version ${doc.version} &nbsp;|&nbsp; ${doc.statusLabel}
          </div>
        </div>
      `;
    }

    page.style.transform = `scale(${zoomPercent / 100}) rotate(${rotation}deg)`;
    page.style.transformOrigin = 'top center';
  }

  // Toolbar controls
  $('#btnPrevPage').addEventListener('click', () => {
    if (!selectedDoc || currentPage <= 1) return;
    currentPage--;
    $('#pageInput').value = currentPage;
    renderViewerPage(selectedDoc);
  });

  $('#btnNextPage').addEventListener('click', () => {
    if (!selectedDoc || currentPage >= selectedDoc.pages) return;
    currentPage++;
    $('#pageInput').value = currentPage;
    renderViewerPage(selectedDoc);
  });

  $('#pageInput').addEventListener('change', () => {
    if (!selectedDoc) return;
    let v = parseInt($('#pageInput').value);
    if (isNaN(v) || v < 1) v = 1;
    if (v > selectedDoc.pages) v = selectedDoc.pages;
    currentPage = v;
    $('#pageInput').value = v;
    renderViewerPage(selectedDoc);
  });

  $('#btnZoomIn').addEventListener('click', () => {
    if (zoomPercent >= 200) return;
    zoomPercent += 25;
    $('#zoomLevel').textContent = zoomPercent + '%';
    if (selectedDoc) renderViewerPage(selectedDoc);
  });

  $('#btnZoomOut').addEventListener('click', () => {
    if (zoomPercent <= 25) return;
    zoomPercent -= 25;
    $('#zoomLevel').textContent = zoomPercent + '%';
    if (selectedDoc) renderViewerPage(selectedDoc);
  });

  $('#btnRotate').addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    if (selectedDoc) renderViewerPage(selectedDoc);
  });

  $('#btnFitPage').addEventListener('click', () => {
    zoomPercent = 100;
    rotation = 0;
    $('#zoomLevel').textContent = '100%';
    if (selectedDoc) renderViewerPage(selectedDoc);
  });

  $('#btnFullscreen').addEventListener('click', () => {
    const viewer = $('#viewerContent');
    if (viewer.requestFullscreen) viewer.requestFullscreen();
    else if (viewer.webkitRequestFullscreen) viewer.webkitRequestFullscreen();
  });

  $('#btnDownload').addEventListener('click', () => {
    if (selectedDoc) showToast('Download: ' + selectedDoc.filename + '\nIn a production system, this would initiate a file download.', 'info');
  });

  $('#btnPrint').addEventListener('click', () => {
    if (selectedDoc) showToast('Print: ' + selectedDoc.filename + '\nIn a production system, this would open the print dialog for authorized users.', 'info');
  });

  // ========================================================================
  //  DOCUMENT DETAILS BAR
  // ========================================================================

  function renderDetailsBar(doc) {
    const bar = $('#docDetailsBar');
    bar.classList.add('visible');

    const grid = $('#docDetailsGrid');
    grid.innerHTML = `
      <div class="detail-pair"><small>File ID</small><span>${doc.fileId}</span></div>
      <div class="detail-pair"><small>Case ID</small><span>${selectedCase.caseId}</span></div>
      <div class="detail-pair"><small>Document Type</small><span>${doc.typeLabel}</span></div>
      <div class="detail-pair"><small>Original File</small><span>${doc.filename}</span></div>
      <div class="detail-pair"><small>Version</small><span>${doc.version}</span></div>
      <div class="detail-pair"><small>Status</small><span>${doc.statusLabel}</span></div>
      <div class="detail-pair"><small>Uploaded By</small><span>${doc.uploadedBy}</span></div>
      <div class="detail-pair"><small>Upload Date</small><span>${doc.uploadDate}</span></div>
      <div class="detail-pair"><small>File Size</small><span>${doc.size}</span></div>
      <div class="detail-pair"><small>Confidentiality</small><span>${doc.confLabel}</span></div>
      ${doc.examination ? `<div class="detail-pair"><small>Examination</small><span>${doc.examination}</span></div>` : ''}
      ${doc.evidence ? `<div class="detail-pair"><small>Evidence</small><span>${doc.evidence}</span></div>` : ''}
    `;
  }

  // ========================================================================
  //  BOTTOM TABS
  // ========================================================================

  $$('.btab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.btab-btn').forEach(b => b.classList.remove('active'));
      $$('.btab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      $('#tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  function renderBottomTabs(doc) {
    // Document Info
    const infoGrid = $('#docInfoGrid');
    if (!doc) {
      infoGrid.innerHTML = '<p class="empty-state">Select a document to view its information.</p>';
      $('#versionHistoryList').innerHTML = '<p class="empty-state">Select a document to view its version history.</p>';
      $('#activityLogList').innerHTML = '<p class="empty-state">Select a document to view its activity log.</p>';
      return;
    }

    infoGrid.innerHTML = `
      <div class="detail-pair"><small>File ID</small><span>${doc.fileId}</span></div>
      <div class="detail-pair"><small>Case ID</small><span>${selectedCase.caseId}</span></div>
      <div class="detail-pair"><small>Document Type</small><span>${doc.typeLabel}</span></div>
      <div class="detail-pair"><small>Original File Name</small><span>${doc.filename}</span></div>
      <div class="detail-pair"><small>Document Date</small><span>${doc.date}</span></div>
      <div class="detail-pair"><small>Upload Date</small><span>${doc.uploadDate}</span></div>
      <div class="detail-pair"><small>Uploaded By</small><span>${doc.uploadedBy}</span></div>
      <div class="detail-pair"><small>File Size</small><span>${doc.size}</span></div>
      <div class="detail-pair"><small>File Format</small><span>${doc.format}</span></div>
      <div class="detail-pair"><small>Version</small><span>${doc.version}</span></div>
      <div class="detail-pair"><small>Status</small><span>${doc.statusLabel}</span></div>
      <div class="detail-pair"><small>Confidentiality</small><span>${doc.confLabel}</span></div>
      <div class="detail-pair"><small>Description</small><span>${doc.description}</span></div>
      ${doc.examination ? `<div class="detail-pair"><small>Related Examination</small><span>${doc.examination}</span></div>` : ''}
      ${doc.evidence ? `<div class="detail-pair"><small>Related Evidence</small><span>${doc.evidence}</span></div>` : ''}
      <div class="detail-pair"><small>Storage Location</small><span>${doc.storage}</span></div>
      <div class="detail-pair"><small>Checksum</small><span>${doc.checksum}</span></div>
    `;

    // Version History
    const vhList = $('#versionHistoryList');
    vhList.innerHTML = sampleVersionHistory.map(v => `
      <div class="version-item">
        <div class="version-dot ${v.current ? 'current' : ''}"></div>
        <div class="version-info">
          <h5>Version ${v.version} — ${v.status} ${v.current ? '<span class="badge success" style="font-size:0.6rem;padding:2px 6px;margin-left:6px;">CURRENT</span>' : ''}</h5>
          <p>${v.author} &nbsp;|&nbsp; ${v.date}</p>
          <p>${v.reason}</p>
        </div>
      </div>
    `).join('');

    // Activity Log
    const alList = $('#activityLogList');
    alList.innerHTML = sampleActivityLog.map(a => `
      <div class="activity-item">
        <span class="activity-time">${a.date}<br/>${a.time}</span>
        <div class="activity-icon ${a.icon}">${
          a.icon === 'upload' ? '⬆' :
          a.icon === 'view' ? '👁' :
          a.icon === 'download' ? '⬇' :
          a.icon === 'edit' ? '✏' :
          a.icon === 'approve' ? '✓' : '•'
        }</div>
        <span class="activity-text">${a.text}</span>
      </div>
    `).join('');
  }

  // ========================================================================
  //  CONTEXT MENU
  // ========================================================================

  const contextMenu = $('#contextMenu');
  let contextDoc = null;

  function showContextMenu(e, doc) {
    contextDoc = doc;
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('active');
  }

  document.addEventListener('click', () => contextMenu.classList.remove('active'));

  contextMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (!contextDoc) return;

      switch (action) {
        case 'view':
          openDocument(contextDoc);
          break;
        case 'download':
          showToast('Download: ' + contextDoc.filename, 'info');
          break;
        case 'print':
          showToast('Print: ' + contextDoc.filename, 'info');
          break;
        case 'edit-meta':
          showToast('Edit metadata for: ' + contextDoc.title, 'info');
          break;
        case 'new-version':
          showToast('Upload new version for: ' + contextDoc.title, 'info');
          break;
        case 'send-approval':
          showToast('Send for approval: ' + contextDoc.title, 'info');
          break;
        case 'link-exam':
          showToast('Link to examination: ' + contextDoc.title, 'info');
          break;
        case 'link-evidence':
          showToast('Link to evidence item: ' + contextDoc.title, 'info');
          break;
        case 'audit':
          showToast('View audit history for: ' + contextDoc.title, 'info');
          break;
        case 'copy-ref':
          navigator.clipboard.writeText(contextDoc.fileId).then(() => showToast('Copied: ' + contextDoc.fileId, 'success'));
          break;
        case 'archive':
          if (confirm('Archive document "' + contextDoc.title + '"? It will be moved to the archive.')) {
            showToast('Document archived (demo).', 'success');
          }
          break;
      }
      contextMenu.classList.remove('active');
    });
  });

  // ========================================================================
  //  UPLOAD MODAL
  // ========================================================================

  const uploadModal = $('#uploadModal');

  // Additional Details toggle
  const toggleBtn = $('#toggleAdditional');
  const toggleArrow = $('#toggleArrow');
  const additionalDetails = $('#additionalDetails');

  toggleBtn.addEventListener('click', () => {
    additionalDetails.classList.toggle('open');
    toggleArrow.classList.toggle('open');
  });

  function resetUploadForm() {
    $('#uploadDocType').value = '';
    $('#uploadDocTitle').value = '';
    $('#uploadDocDate').value = '';
    $('#uploadDescription').value = '';
    $('#uploadConfidentiality').value = 'normal';
    $('#uploadExamination').value = '';
    $('#uploadEvidence').value = '';
    additionalDetails.classList.remove('open');
    toggleArrow.classList.remove('open');
    uploadFiles = [];
    renderSelectedFiles();
  }

  $('#openUploadModal').addEventListener('click', () => {
    if (!selectedCase) {
      showToast('Please select a case before uploading documents.', 'warning');
      return;
    }
    resetUploadForm();
    uploadModal.classList.add('active');
  });

  $('#closeUploadModal').addEventListener('click', () => uploadModal.classList.remove('active'));
  $('#cancelUpload').addEventListener('click', () => uploadModal.classList.remove('active'));

  uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) uploadModal.classList.remove('active');
  });

  // Drag & drop
  const dropZone = $('#dropZone');
  const fileInput = $('#fileInput');

  $('#browseBtn').addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });

  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    addFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxFileSize = 50 * 1024 * 1024; // 50 MB

  function addFiles(fileList) {
    for (const file of fileList) {
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|tiff?|docx?)$/i)) {
        showToast('File type not supported: ' + file.name, 'error');
        continue;
      }
      if (file.size > maxFileSize) {
        showToast('File too large (max 50 MB): ' + file.name, 'error');
        continue;
      }
      if (uploadFiles.some(f => f.name === file.name && f.size === file.size)) {
        showToast('Duplicate file: ' + file.name, 'error');
        continue;
      }
      uploadFiles.push(file);
    }
    renderSelectedFiles();
  }

  function renderSelectedFiles() {
    const container = $('#selectedFiles');
    if (uploadFiles.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = uploadFiles.map((f, i) => `
      <div class="selected-file">
        <div class="file-info">
          <span class="file-icon">${f.type.startsWith('image/') ? '🖼' : '📄'}</span>
          <span>${f.name}</span>
          <small style="color:var(--text-muted);">(${(f.size / 1024).toFixed(0)} KB)</small>
        </div>
        <button class="remove-file" data-index="${i}">&times;</button>
      </div>
    `).join('');

    container.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', () => {
        uploadFiles.splice(parseInt(btn.dataset.index), 1);
        renderSelectedFiles();
      });
    });
  }

  // Submit upload
  $('#submitUpload').addEventListener('click', () => {
    const type = $('#uploadDocType').value;
    const title = $('#uploadDocTitle').value.trim();

    if (!type) { showToast('Please select a document type.', 'error'); return; }
    if (!title) { showToast('Please enter a document title.', 'error'); return; }
    if (uploadFiles.length === 0) { showToast('Please select at least one file.', 'error'); return; }

    // System auto-generates these on submit:
    const autoFields = {
      fileId: 'FILE-2026-' + String(Math.floor(Math.random() * 90000) + 10000),
      version: '1.0',
      status: 'Draft',
      uploadedBy: 'Dr. A. Silva',
      uploadDate: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      checksum: Math.random().toString(36).substring(2, 15) + '...'
    };

    // Simulate upload progress
    const progress = $('#uploadProgress');
    const fill = $('#progressFill');
    const text = $('#progressText');
    progress.classList.add('active');

    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 15 + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        fill.style.width = '100%';
        text.textContent = 'Upload complete!';

        setTimeout(() => {
          progress.classList.remove('active');
          fill.style.width = '0%';
          uploadModal.classList.remove('active');
          showToast(
            'Document uploaded successfully.\n\n' +
            'File ID: ' + autoFields.fileId + '\n' +
            'Title: ' + title + '\n' +
            'Version: ' + autoFields.version + '\n' +
            'Status: ' + autoFields.status + '\n' +
            'Uploaded by: ' + autoFields.uploadedBy + '\n' +
            'Date: ' + autoFields.uploadDate,
            'success', 6000
          );
          resetUploadForm();
        }, 800);
      }
      fill.style.width = Math.min(pct, 100) + '%';
      text.textContent = 'Uploading... ' + Math.round(Math.min(pct, 100)) + '%';
    }, 200);
  });

  // ========================================================================
  //  BULK UPLOAD MODAL
  // ========================================================================

  const bulkModal = $('#bulkUploadModal');

  $('#openBulkUpload').addEventListener('click', () => {
    if (!selectedCase) { showToast('Please select a case before uploading.', 'warning'); return; }
    bulkFiles = [];
    renderBulkFiles();
    bulkModal.classList.add('active');
  });

  $('#closeBulkModal').addEventListener('click', () => bulkModal.classList.remove('active'));
  $('#cancelBulk').addEventListener('click', () => bulkModal.classList.remove('active'));
  bulkModal.addEventListener('click', (e) => { if (e.target === bulkModal) bulkModal.classList.remove('active'); });

  const bulkDropZone = $('#bulkDropZone');
  const bulkFileInput = $('#bulkFileInput');

  $('#bulkBrowseBtn').addEventListener('click', (e) => { e.preventDefault(); bulkFileInput.click(); });

  bulkDropZone.addEventListener('dragover', (e) => { e.preventDefault(); bulkDropZone.classList.add('dragover'); });
  bulkDropZone.addEventListener('dragleave', () => bulkDropZone.classList.remove('dragover'));
  bulkDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    bulkDropZone.classList.remove('dragover');
    for (const f of e.dataTransfer.files) bulkFiles.push(f);
    renderBulkFiles();
  });

  bulkFileInput.addEventListener('change', () => {
    for (const f of bulkFileInput.files) bulkFiles.push(f);
    bulkFileInput.value = '';
    renderBulkFiles();
  });

  function renderBulkFiles() {
    const container = $('#bulkSelectedFiles');
    if (bulkFiles.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = bulkFiles.map((f, i) => `
      <div class="selected-file">
        <div class="file-info">
          <span class="file-icon">${f.type.startsWith('image/') ? '🖼' : '📄'}</span>
          <span>${f.name}</span>
          <small style="color:var(--text-muted);">(${(f.size / 1024).toFixed(0)} KB)</small>
        </div>
        <button class="remove-file" data-index="${i}">&times;</button>
      </div>
    `).join('');

    container.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', () => {
        bulkFiles.splice(parseInt(btn.dataset.index), 1);
        renderBulkFiles();
      });
    });
  }

  $('#submitBulk').addEventListener('click', () => {
    if (bulkFiles.length === 0) { showToast('Please select files to upload.', 'error'); return; }
    showToast(bulkFiles.length + ' file(s) uploaded successfully (demo).', 'success');
    bulkFiles = [];
    renderBulkFiles();
    bulkModal.classList.remove('active');
  });

  // ========================================================================
  //  DETAIL PANEL ACTIONS
  // ========================================================================

  $('#btnEditDetails').addEventListener('click', () => {
    if (selectedDoc) showToast('Edit metadata for: ' + selectedDoc.title, 'info');
  });

  $('#btnUploadVersion').addEventListener('click', () => {
    if (selectedDoc) showToast('Upload new version for: ' + selectedDoc.title, 'info');
  });

  $('#btnArchive').addEventListener('click', () => {
    if (selectedDoc && confirm('Archive "' + selectedDoc.title + '"?')) {
      showToast('Document archived (demo).', 'success');
    }
  });

  // ========================================================================
  //  VIEWER MORE BUTTON
  // ========================================================================

  $('#btnViewerMore').addEventListener('click', (e) => {
    if (selectedDoc) showContextMenu(e, selectedDoc);
  });

  // ========================================================================
  //  AUTO-SELECT FIRST CASE ON LOAD (DEMO)
  // ========================================================================

  

})();

