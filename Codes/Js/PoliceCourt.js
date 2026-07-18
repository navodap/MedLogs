const STORAGE_KEY = "medlogsPoliceCourtRecords";
const seedRecords = [
  {id:"PC-0001",type:"Court Matter",caseId:"CL-2026-00124",reference:"MC/COL/842/26",authority:"Colombo Magistrate's Court",contact:"Court Registrar",actionDate:"2026-07-21",status:"Scheduled",priority:"Court Priority",notes:"JMO appearance and submission of MLR."},
  {id:"PC-0002",type:"Police Referral",caseId:"PM-2026-00087",reference:"CR/1198/2026",authority:"Borella Police Station",contact:"IP S. Fernando",actionDate:"2026-07-22",status:"Pending",priority:"Urgent",notes:"Post-mortem report requested."},
  {id:"PC-0003",type:"Court Matter",caseId:"CL-2026-00118",reference:"HC/COLOMBO/214/26",authority:"Colombo High Court",contact:"Court Registrar",actionDate:"2026-07-28",status:"Submitted",priority:"Court Priority",notes:"Certified medical report submitted."},
  {id:"PC-0004",type:"Police Referral",caseId:"CL-2026-00131",reference:"MLEF/MTL/455/26",authority:"Mount Lavinia Police Station",contact:"PS 6421 Perera",actionDate:"2026-08-03",status:"Pending",priority:"Normal",notes:"Clinical examination referral received."},
  {id:"PC-0005",type:"Court Matter",caseId:"PM-2026-00072",reference:"MC/KDU/302/26",authority:"Kaduwela Magistrate's Court",contact:"Court Registrar",actionDate:"2026-07-15",status:"Completed",priority:"Normal",notes:"Evidence completed and attendance recorded."}
];
let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || seedRecords;
const $ = id => document.getElementById(id);
const modal = $("recordModal");

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(records));}
function safe(value){const d=document.createElement("div");d.textContent=value||"—";return d.innerHTML;}
function formatDate(value){if(!value)return "Not scheduled";return new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value+"T00:00:00"));}
function statusClass(value){return String(value).toLowerCase().replace(/\s+/g,"-");}
function renderStats(){
  $("policeCount").textContent=records.filter(r=>r.type==="Police Referral"&&r.status!=="Completed").length;
  $("courtCount").textContent=records.filter(r=>r.type==="Court Matter").length;
  const now=new Date();now.setHours(0,0,0,0);const end=new Date(now);end.setDate(end.getDate()+30);
  $("hearingCount").textContent=records.filter(r=>r.type==="Court Matter"&&new Date(r.actionDate+"T00:00:00")>=now&&new Date(r.actionDate+"T00:00:00")<=end&&r.status!=="Completed").length;
  $("completedCount").textContent=records.filter(r=>["Completed","Submitted"].includes(r.status)).length;
}
function filtered(){const q=$("globalSearch").value.toLowerCase().trim(),type=$("typeFilter").value,status=$("statusFilter").value;return records.filter(r=>(type==="all"||r.type===type)&&(status==="all"||r.status===status)&&(!q||Object.values(r).join(" ").toLowerCase().includes(q)));}
function renderTable(){const data=filtered();$("recordsBody").innerHTML=data.map(r=>`<tr><td><strong>${safe(r.reference)}</strong><small>${safe(r.contact)}</small></td><td><strong>${safe(r.caseId)}</strong><small>${safe(r.authority)}</small></td><td><span class="type-chip ${r.type==='Court Matter'?'court':''}">${safe(r.type)}</span></td><td><strong>${formatDate(r.actionDate)}</strong><small>${safe(r.priority)}</small></td><td><span class="status-chip ${statusClass(r.status)}">${safe(r.status)}</span></td><td><button class="row-action" data-complete="${safe(r.id)}" title="Mark completed"><i data-lucide="check"></i></button></td></tr>`).join("");$("emptyState").hidden=data.length>0;lucide.createIcons();}
function renderSchedule(){const upcoming=records.filter(r=>r.actionDate&&r.status!=="Completed").sort((a,b)=>a.actionDate.localeCompare(b.actionDate)).slice(0,4);$("scheduleList").innerHTML=upcoming.length?upcoming.map(r=>{const d=new Date(r.actionDate+"T00:00:00");return `<div class="schedule-item"><div class="date-tile"><strong>${d.getDate()}</strong><small>${d.toLocaleString('en',{month:'short'})}</small></div><div><h5>${safe(r.authority)}</h5><p>${safe(r.caseId)} · ${safe(r.reference)}<br>${safe(r.type)}</p></div></div>`}).join(""):'<div class="empty"><p>No upcoming dates.</p></div>';}
function render(){renderStats();renderTable();renderSchedule();}
function openModal(type){$("recordForm").reset();if(type)$("recordType").value=type;modal.classList.add("open");modal.setAttribute("aria-hidden","false");setTimeout(()=>$("caseId").focus(),50);}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}
$("recordForm").addEventListener("submit",e=>{e.preventDefault();const next=String(records.length+1).padStart(4,"0");records.unshift({id:`PC-${next}`,type:$("recordType").value,caseId:$("caseId").value.trim(),reference:$("referenceNo").value.trim(),authority:$("authority").value.trim(),contact:$("contactPerson").value.trim(),actionDate:$("actionDate").value,status:$("recordStatus").value,priority:$("priority").value,notes:$("notes").value.trim()});save();render();closeModal();$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600);});
$("newRecordBtn").addEventListener("click",()=>openModal());document.querySelectorAll("[data-new-type]").forEach(b=>b.addEventListener("click",()=>openModal(b.dataset.newType)));$("closeModalBtn").addEventListener("click",closeModal);$("cancelBtn").addEventListener("click",closeModal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal();});
[$("globalSearch"),$("typeFilter"),$("statusFilter")].forEach(el=>el.addEventListener(el.tagName==="INPUT"?"input":"change",renderTable));
$("recordsBody").addEventListener("click",e=>{const btn=e.target.closest("[data-complete]");if(!btn)return;const rec=records.find(r=>r.id===btn.dataset.complete);if(rec){rec.status="Completed";save();render();}});
$("menuBtn").addEventListener("click",()=>{$("sidebar").classList.add("open");$("sidebarOverlay").classList.add("active")});$("sidebarOverlay").addEventListener("click",()=>{$("sidebar").classList.remove("open");$("sidebarOverlay").classList.remove("active")});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("globalSearch").focus()}if(e.key==="Escape")closeModal();});
lucide.createIcons();render();
