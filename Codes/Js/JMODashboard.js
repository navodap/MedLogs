document.addEventListener(
"DOMContentLoaded",
()=>{


    lucide.createIcons();



    // ==========================
    // LOAD CURRENT USER
    // ==========================


    const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );



    if(!currentUser){

        window.location.href="auth.html";

        return;

    }




    document.getElementById("userName")
    .textContent =
    currentUser.name;



    document.getElementById("userRole")
    .textContent =
    currentUser.role;



    document.getElementById("welcomeName")
    .textContent =
    currentUser.name;



    document.getElementById("userAvatar")
    .textContent =
    currentUser.name
    .charAt(0)
    .toUpperCase();







    // ==========================
    // TEMPORARY CASE DATA
    // Replace with database later
    // ==========================


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
            status:"Completed"
        }

    ];





    const caseTable =
    document.getElementById("caseTable");



    cases.forEach(caseItem=>{


        caseTable.innerHTML +=`

        <tr>

        <td>${caseItem.id}</td>

        <td>${caseItem.type}</td>

        <td>${caseItem.doctor}</td>

        <td>
        <span class="${caseItem.status==="Completed"
        ?"status-complete"
        :"status-review"}">

        ${caseItem.status}

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







    // ==========================
    // REPORT DATA
    // ==========================


    const reports=[


        {
            id:"RPT-001",
            caseId:"PM-2026-001",
            prepared:"Assistant JMO",
            status:"Pending"
        },


        {
            id:"RPT-002",
            caseId:"CL-2026-021",
            prepared:"Doctor",
            status:"Pending"
        }


    ];




    const reportTable =
    document.getElementById("reportTable");



    reports.forEach(report=>{


        reportTable.innerHTML +=`

        <tr>

        <td>${report.id}</td>

        <td>${report.caseId}</td>

        <td>${report.prepared}</td>

        <td>
        <span class="status-review">

        ${report.status}

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






    // ==========================
    // LOGOUT
    // ==========================


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
