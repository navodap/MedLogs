document.addEventListener(
"DOMContentLoaded",
()=>{


lucide.createIcons();




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







const tasks=[


{

case:"PM-2026-001",

task:"Prepare examination documents",

priority:"High",

status:"Pending"

},


{

case:"CL-2026-010",

task:"Evidence review",

priority:"Normal",

status:"Completed"

}



];





const taskTable =
document.getElementById("taskTable");



tasks.forEach(item=>{


taskTable.innerHTML+=`

<tr>

<td>${item.case}</td>


<td>${item.task}</td>


<td>${item.priority}</td>


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








const reports=[


{

id:"RPT-101",

case:"PM-2026-001",

status:"Draft"

},


{

id:"RPT-102",

case:"CL-2026-010",

status:"Pending"

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

<span class="status-pending">

${item.status}

</span>

</td>


<td>

<button class="table-action">

Review

</button>


</td>


</tr>

`;



});







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
