
/* ---------------- DATA STORE ---------------- */
let patients = [
  {
    id:1, patientId:"PV-2026-000128", name:"Ravi Kumar", dob:"1998-01-12", gender:"Male", nic:"200012345678",
    lifeStatus:"Living victim", address:"No. 45, Main Street, Colombo 07, Sri Lanka", phone:"0777 123 456",
    kinName:"Suresh Kumar (Father)", kinPhone:"0712 654 321",
    hospNo:"BHT-26-01456", ward:"Ward 3B", admissionDate:"2026-05-24",
    coolerNo:"", bodyReceivedDate:"", broughtBy:"",
    linkedCases:["CL-2026-000151","PM-2026-000083"]
  },
  {
    id:2, patientId:"PV-2026-000129", name:"Anjali Sharma", dob:"1994-06-09", gender:"Female", nic:"199812345679",
    lifeStatus:"Living victim", address:"12 Lake Rd, Colombo 5", phone:"0771 998 231",
    kinName:"Meena Sharma", kinPhone:"0771 998 200",
    hospNo:"BHT-26-01457", ward:"Ward 2A", admissionDate:"2026-06-01",
    coolerNo:"", bodyReceivedDate:"", broughtBy:"",
    linkedCases:["CL-2026-000152","CL-2026-000160","EX-2026-000091"]
  },
  {
    id:3, patientId:"PV-2026-000117", name:"Vimukthi Jayawardena", dob:"1978-03-21", gender:"Male", nic:"781809876",
    lifeStatus:"Deceased person", address:"Matara town", phone:"-",
    kinName:"Chandani Jayawardena", kinPhone:"0712 225 566",
    hospNo:"", ward:"", admissionDate:"",
    coolerNo:"Cooler 04", bodyReceivedDate:"2026-06-10T14:30", broughtBy:"PC 4582 Perera",
    linkedCases:["PM-2026-000067","EX-2026-000090"]
  },
  {
    id:4, patientId:"PV-2026-000103", name:"Menaka Wijesinghe", dob:"1969-12-02", gender:"Female", nic:"696912345678",
    lifeStatus:"Deceased person", address:"Negombo", phone:"-",
    kinName:"Priya Wijesinghe", kinPhone:"0763 332 211",
    hospNo:"", ward:"", admissionDate:"",
    coolerNo:"Cooler 09", bodyReceivedDate:"2026-06-21T09:15", broughtBy:"IP Wijewardena",
    linkedCases:["PM-2026-000059"]
  }
];
let currentDetailId = null;

/* ---------------- NAV ---------------- */
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.getElementById('nav-register').classList.toggle('active', name==='register');
  document.getElementById('nav-records').classList.toggle('active', name==='records');
  if(name==='records') renderTable();
  if(name==='register') handleStatusChange(); // Reset form view visibility rules when opening registration
}

/* ---------------- HELPERS ---------------- */
function calcAge(dob){
  if(!dob) return '-';
  const d = new Date(dob);
  if(isNaN(d)) return '-';
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000*60*60*24*365.25));
}
function formatDate(d){
  if(!d) return '-';
  const dt = new Date(d);
  if(isNaN(dt)) return d;
  return dt.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
}
function formatDateTime(d){
  if(!d) return '-';
  const dt = new Date(d);
  if(isNaN(dt)) return d;
  return dt.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}) + ' at ' + dt.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});
}
function lifeStatusBadge(life){
  const cls = life==='Deceased person' ? 'badge-deceased' : 'badge-living';
  return `<span class="badge ${cls}">${life}</span>`;
}
function nextPatientId(){
  const nums = patients.map(p=>parseInt(p.patientId.split('-')[2]));
  const next = Math.max(...nums)+1;
  return `PV-2026-${String(next).padStart(6,'0')}`;
}

/* ---------------- REGISTER DYNAMIC TOGGLE ---------------- */
function handleStatusChange() {
  const statusSelect = document.getElementById('f-life-status');
  const sectionTitle = document.getElementById('dynamic-section-title');
  const livingFields = document.getElementById('living-fields');
  const deceasedFields = document.getElementById('deceased-fields');
  
  if (!statusSelect || !sectionTitle || !livingFields || !deceasedFields) return;

  if (statusSelect.value === 'Deceased person') {
    sectionTitle.textContent = "Mortuary & Reception Details";
    livingFields.style.display = 'none';
    deceasedFields.style.display = 'grid';
  } else {
    sectionTitle.textContent = "Hospital details";
    livingFields.style.display = 'grid';
    deceasedFields.style.display = 'none';
  }
}

function registerPatient(){
  const g = id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  if(!g('f-name').trim()){ alert('Full name is required.'); return; }
  
  const status = g('f-life-status');
  
  const newPatient = {
    id: patients.length+1, 
    patientId: nextPatientId(), 
    name: g('f-name'), 
    dob: g('f-dob'), 
    gender: g('f-gender'),
    nic: g('f-nic'), 
    lifeStatus: status, 
    address: g('f-address'), 
    phone: g('f-phone'),
    kinName: g('f-kin-name'), 
    kinPhone: g('f-kin-phone'),
    
    // Save conditional metadata safely depending on active category selection
    hospNo: status === 'Living victim' ? g('f-hosp-no') : '',
    ward: status === 'Living victim' ? g('f-ward') : '',
    admissionDate: status === 'Living victim' ? g('f-admission-date') : '',
    
    coolerNo: status === 'Deceased person' ? g('f-cooler-no') : '',
    bodyReceivedDate: status === 'Deceased person' ? g('f-body-received') : '',
    broughtBy: status === 'Deceased person' ? g('f-brought-by') : '',
    
    linkedCases: []
  };
  
  patients.unshift(newPatient);
  document.getElementById('reg-form').reset();
  showView('records');
  openDetail(newPatient.id);
}

/* ---------------- RECORDS TABLE ---------------- */
function renderStats(){
  const total = patients.length;
  const living = patients.filter(p=>p.lifeStatus==='Living victim').length;
  const deceased = patients.filter(p=>p.lifeStatus==='Deceased person').length;
  const linked = patients.reduce((sum,p)=> sum + p.linkedCases.length, 0);
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card"><div class="stat-icon blue">&#128100;</div><div><div class="stat-label">Total registered</div><div class="stat-value">${total}</div></div></div>
    <div class="stat-card"><div class="stat-icon green">&#128153;</div><div><div class="stat-label">Living victims</div><div class="stat-value">${living}</div></div></div>
    <div class="stat-card"><div class="stat-icon red">&#128128;</div><div><div class="stat-label">Deceased persons</div><div class="stat-value">${deceased}</div></div></div>
    <div class="stat-card"><div class="stat-icon amber">&#128193;</div><div><div class="stat-label">Linked forensic cases</div><div class="stat-value">${linked}</div></div></div>
  `;
}
function renderTable(){
  renderStats();
  const q = document.getElementById('search-box').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  const genderFilter = document.getElementById('filter-gender').value;
  const rows = patients.filter(p=>{
    const matchesQ = p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q) || (p.nic||'').toLowerCase().includes(q);
    const matchesStatus = !statusFilter || p.lifeStatus===statusFilter;
    const matchesGender = !genderFilter || p.gender===genderFilter;
    return matchesQ && matchesStatus && matchesGender;
  });
  const tbody = document.getElementById('records-tbody');
  tbody.innerHTML = rows.map(p=>`
    <tr class="row-click" onclick="openDetail(${p.id})">
      <td class="mono">${p.patientId}</td>
      <td>${p.name}</td>
      <td class="mono">${p.nic||'-'}</td>
      <td>${calcAge(p.dob)}</td>
      <td>${p.gender||'-'}</td>
      <td>${lifeStatusBadge(p.lifeStatus)}</td>
      <td>${p.lifeStatus === 'Living victim' ? (p.hospNo || '-') : (p.coolerNo || '-')}</td>
      <td>${p.linkedCases.length}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-sm" onclick="openDetail(${p.id})" aria-label="View">&#128065;</button>
      </td>
    </tr>
  `).join('');
  document.getElementById('records-empty').style.display = rows.length ? 'none':'block';
}

/* ---------------- DETAIL VIEW ---------------- */
function getPatient(){ return patients.find(p=>p.id===currentDetailId); }
function openDetail(id){
  currentDetailId = id;
  showView('detail');
  document.getElementById('d-edit-mode').style.display = 'none';
  document.getElementById('d-view-mode').style.display = 'block';
  document.getElementById('d-edit-btn').textContent = 'Edit details';
  renderDetail();
}
function renderDetail(){
  const p = getPatient();
  if(!p) return;
  document.getElementById('d-title').textContent = `${p.name} - ${p.patientId}`;
  document.getElementById('d-sub').innerHTML = lifeStatusBadge(p.lifeStatus);

  let statusDependentHTML = '';
  
  if (p.lifeStatus === 'Living victim') {
    statusDependentHTML = `
      <div class="section-title">Hospital details</div>
      <div class="kv"><div>Hospital number</div><div>${p.hospNo||'-'}</div></div>
      <div class="kv"><div>Ward</div><div>${p.ward||'-'}</div></div>
      <div class="kv"><div>Admission date</div><div>${formatDate(p.admissionDate)}</div></div>
    `;
  } else {
    statusDependentHTML = `
      <div class="section-title">Mortuary & Reception Details</div>
      <div class="kv"><div>Mortuary Cooler No.</div><div>${p.coolerNo||'-'}</div></div>
      <div class="kv"><div>Body Received Date</div><div>${formatDateTime(p.bodyReceivedDate)}</div></div>
      <div class="kv"><div>Brought By (Officer)</div><div>${p.broughtBy||'-'}</div></div>
    `;
  }

  document.getElementById('d-view-mode').innerHTML = `
    <div class="section-title">Personal details</div>
    <div class="kv"><div>Full name</div><div>${p.name}</div></div>
    <div class="kv"><div>NIC / passport</div><div>${p.nic||'-'}</div></div>
    <div class="kv"><div>Date of birth</div><div>${formatDate(p.dob)}</div></div>
    <div class="kv"><div>Age</div><div>${calcAge(p.dob)}</div></div>
    <div class="kv"><div>Gender</div><div>${p.gender||'-'}</div></div>

    <div class="section-title">Contact details</div>
    <div class="kv"><div>Address</div><div>${p.address||'-'}</div></div>
    <div class="kv"><div>Contact number</div><div>${p.phone||'-'}</div></div>
    <div class="kv"><div>Next of kin</div><div>${p.kinName||'-'} ${p.kinPhone ? '('+p.kinPhone+')' : ''}</div></div>

    ${statusDependentHTML}

    <div class="section-title">Linked cases</div>
    <div>${p.linkedCases.length ? p.linkedCases.map(c=>`<span class="tag">${c}</span>`).join('') : '<span class="muted">No cases linked yet.</span>'}</div>
    <p class="muted" style="margin-top:8px;">Case details are managed in the Case Management module.</p>
  `;
}

/* ---------------- EDIT MODE ---------------- */
function toggleEdit(){
  const editing = document.getElementById('d-edit-mode').style.display === 'block';
  if(editing){
    document.getElementById('d-edit-mode').style.display = 'none';
    document.getElementById('d-view-mode').style.display = 'block';
    document.getElementById('d-edit-btn').textContent = 'Edit details';
  } else {
    renderEditForm();
    document.getElementById('d-edit-mode').style.display = 'block';
    document.getElementById('d-view-mode').style.display = 'none';
    document.getElementById('d-edit-btn').textContent = 'Cancel edit';
    handleEditStatusChange(); // Ensure proper initial view inside edit panel
  }
}

function handleEditStatusChange() {
  const statusSelect = document.getElementById('e-life-status');
  const livingSection = document.getElementById('e-living-section');
  const deceasedSection = document.getElementById('e-deceased-section');
  
  if(!statusSelect || !livingSection || !deceasedSection) return;
  
  if (statusSelect.value === 'Deceased person') {
    livingSection.style.display = 'none';
    deceasedSection.style.display = 'block';
  } else {
    livingSection.style.display = 'block';
    deceasedSection.style.display = 'none';
  }
}

function renderEditForm(){
  const p = getPatient();
  document.getElementById('d-edit-mode').innerHTML = `
    <div class="section-title">Personal details</div>
    <div class="grid2">
      <div class="field"><label>Full name *</label><input type="text" id="e-name" value="${p.name}"></div>
      <div class="field"><label>NIC / passport</label><input type="text" id="e-nic" value="${p.nic||''}"></div>
      <div class="field"><label>Date of birth</label><input type="date" id="e-dob" value="${p.dob||''}"></div>
      <div class="field"><label>Gender</label>
        <select id="e-gender">
          ${['Female','Male','Other','Unknown'].map(g=>`<option ${p.gender===g?'selected':''}>${g}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Victim status</label>
        <select id="e-life-status" onchange="handleEditStatusChange()">
          ${['Living victim','Deceased person'].map(s=>`<option ${p.lifeStatus===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="section-title">Contact details</div>
    <div class="grid2">
      <div class="field"><label>Address</label><input type="text" id="e-address" value="${p.address||''}"></div>
      <div class="field"><label>Contact number</label><input type="text" id="e-phone" value="${p.phone||''}"></div>
      <div class="field"><label>Next of kin name</label><input type="text" id="e-kin-name" value="${p.kinName||''}"></div>
      <div class="field"><label>Next of kin phone</label><input type="text" id="e-kin-phone" value="${p.kinPhone||''}"></div>
    </div>
    
    <div id="e-living-section">
      <div class="section-title">Hospital details</div>
      <div class="grid2">
        <div class="field"><label>Hospital number</label><input type="text" id="e-hosp-no" value="${p.hospNo||''}"></div>
        <div class="field"><label>Ward</label><input type="text" id="e-ward" value="${p.ward||''}"></div>
        <div class="field"><label>Admission date</label><input type="date" id="e-admission-date" value="${p.admissionDate||''}"></div>
      </div>
    </div>

    <div id="e-deceased-section" style="display:none;">
      <div class="section-title">Mortuary & Reception Details</div>
      <div class="grid2">
        <div class="field"><label>Mortuary Cooler No.</label><input type="text" id="e-cooler-no" value="${p.coolerNo||''}"></div>
        <div class="field"><label>Date & Time Body Received</label><input type="datetime-local" id="e-body-received" value="${p.bodyReceivedDate||''}"></div>
        <div class="field"><label>Brought By (Officer Name/Badge)</label><input type="text" id="e-brought-by" value="${p.broughtBy||''}"></div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn" onclick="toggleEdit()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="saveEdit()">Save changes</button>
    </div>
  `;
}

function saveEdit(){
  const p = getPatient();
  const g = id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  
  const status = g('e-life-status');
  
  p.name = g('e-name'); 
  p.nic = g('e-nic'); 
  p.dob = g('e-dob'); 
  p.gender = g('e-gender');
  p.lifeStatus = status; 
  p.address = g('e-address'); 
  p.phone = g('e-phone');
  p.kinName = g('e-kin-name'); 
  p.kinPhone = g('e-kin-phone');
  
  // Clean up alternate inputs depending on updated choice
  if (status === 'Living victim') {
    p.hospNo = g('e-hosp-no'); 
    p.ward = g('e-ward'); 
    p.admissionDate = g('e-admission-date');
    p.coolerNo = ''; 
    p.bodyReceivedDate = ''; 
    p.broughtBy = '';
  } else {
    p.hospNo = ''; 
    p.ward = ''; 
    p.admissionDate = '';
    p.coolerNo = g('e-cooler-no'); 
    p.bodyReceivedDate = g('e-body-received'); 
    p.broughtBy = g('e-brought-by');
  }
  
  document.getElementById('d-edit-mode').style.display = 'none';
  document.getElementById('d-view-mode').style.display = 'block';
  document.getElementById('d-edit-btn').textContent = 'Edit details';
  renderDetail();
}

/* ---------------- INIT ---------------- */
renderTable();

