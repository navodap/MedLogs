document.addEventListener(
"DOMContentLoaded",
()=>{


lucide.createIcons();



// =======================
// LOAD CURRENT USER
// =======================


const user =
JSON.parse(
localStorage.getItem("currentUser")
);



if(!user){

window.location.href="auth.html";

return;

}



document.getElementById("userName")
.textContent=user.name;



document.getElementById("userRole")
.textContent=user.role;



document.getElementById("welcomeName")
.textContent=user.name;



document.getElementById("userAvatar")
.textContent=
user.name.charAt(0).toUpperCase();







// =======================
// ASSIGNED CASES
// =======================


const cases=[


{

id:"CL-2026-001",

patient:"Kamal Perera",

type:"Clinical",

status:"Pending Examination"

},


{

id:"PM-2026-004",

patient:"Unknown",

type:"Autopsy",

status:"Completed"

}


];





const caseTable =
document.getElementById("caseTable");



cases.forEach(item=>{


caseTable.innerHTML+=`


<tr>

<td>${item.id}</td>

<td>${item.patient}</td>

<td>${item.type}</td>


<td>

<span class="${
item.status==="Completed"
?
"status-complete"
:
"status-pending"
}">

${item.status}

</span>


</td>


<td>

<button class="table-action">
Open
</button>


</td>


</tr>


`;



});








// =======================
// EXAMINATION TASKS
// =======================


const examinations=[


{

case:"CL-2026-001",

exam:"Injury Assessment",

priority:"High"

},


{

case:"PM-2026-004",

exam:"Autopsy Examination",

priority:"Normal"

}


];





const examTable =
document.getElementById("examTable");



examinations.forEach(item=>{


examTable.innerHTML+=`


<tr>

<td>${item.case}</td>

<td>${item.exam}</td>

<td>${item.priority}</td>


<td>

<button class="table-action">

Start

</button>

</td>


</tr>


`;



});









// =======================
// REPORTS
// =======================


const reports=[


{

id:"RPT-001",

case:"CL-2026-001",

status:"Draft"

},


{

id:"RPT-002",

case:"PM-2026-004",

status:"Submitted"

}


];





const reportTable =
document.getElementById("reportTable");



reports.forEach(item=>{


reportTable.innerHTML+=`


<tr>


<td>
${item.id}
</td>


<td>
${item.case}
</td>


<td>


<span class="${
item.status==="Submitted"
?
"status-complete"
:
"status-pending"
}">


${item.status}


</span>


</td>



<td>


<button class="table-action">

View

</button>


</td>



</tr>


`;



});








// =======================
// LOGOUT
// =======================


document
.getElementById("logoutBtn")
.addEventListener(
"click",
()=>{


localStorage.removeItem(
"currentUser"
);



window.location.href="auth.html";


});



});
