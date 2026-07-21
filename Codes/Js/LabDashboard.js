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







const samples=[


{
id:"SMP-001",
case:"PM-2026-001",
test:"Toxicology",
status:"Pending"
},


{
id:"SMP-002",
case:"CL-2026-010",
test:"DNA Analysis",
status:"Completed"
}


];





const sampleTable =
document.getElementById("sampleTable");



samples.forEach(item=>{


sampleTable.innerHTML+=`

<tr>

<td>${item.id}</td>

<td>${item.case}</td>

<td>${item.test}</td>


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








const results=[


{

id:"RES-001",
case:"PM-2026-001",
result:"Positive"

},


{

id:"RES-002",
case:"CL-2026-010",
result:"Completed"

}


];





const resultTable =
document.getElementById("resultTable");



results.forEach(item=>{


resultTable.innerHTML+=`

<tr>

<td>
${item.id}
</td>


<td>
${item.case}
</td>


<td>
${item.result}
</td>


<td>

<button class="table-action">

View

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
