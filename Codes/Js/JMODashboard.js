document.addEventListener(
"DOMContentLoaded",
()=>{


lucide.createIcons();



// Load logged user

const user =
JSON.parse(
localStorage.getItem("currentUser")
);



if(user){


document.getElementById("userName")
.textContent =
user.name;



document.getElementById("userRole")
.textContent =
user.role;



document.getElementById("welcomeName")
.textContent =
user.name;



document.getElementById("userAvatar")
.textContent =
user.name.charAt(0).toUpperCase();


}





// Temporary data
// Later replaced with database


const cases=[

{
id:"PM-2026-001",
type:"Autopsy",
doctor:"Dr. Fernando",
status:"Pending Review"
},


{
id:"CL-2026-021",
type:"Clinical",
doctor:"Dr. Silva",
status:"Examination Complete"
}

];





const caseTable =
document.getElementById("caseTable");



cases.forEach(c=>{


caseTable.innerHTML += `

<tr>

<td>${c.id}</td>

<td>${c.type}</td>

<td>${c.doctor}</td>

<td>

<span class="badge info">
${c.status}
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
id:"RPT-001",
case:"PM-2026-001",
by:"Assistant JMO",
status:"Pending"
}



];




const reportTable =
document.getElementById("reportTable");



reports.forEach(r=>{


reportTable.innerHTML += `

<tr>

<td>${r.id}</td>

<td>${r.case}</td>

<td>${r.by}</td>

<td>

<span class="badge warn">
${r.status}
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






// Logout


document
.getElementById("logoutBtn")
.addEventListener(
"click",
()=>{


localStorage.removeItem(
"currentUser"
);



window.location.href =
"auth.html";


});



});
