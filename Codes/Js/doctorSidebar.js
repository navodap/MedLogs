document.addEventListener(
    "DOMContentLoaded",
    () => {


        const sidebar =
        document.getElementById("doctorSidebar");


        // Stop if sidebar container is not available
        if (!sidebar) {
            return;
        }



        sidebar.innerHTML = `


        <div class="brand">


            <div class="brand-icon">

                <i data-lucide="shield-plus"></i>

            </div>



            <div>

                <h1>
                    MedLogs
                </h1>


                <p>
                    FORENSIC MEDICO-LEGAL<br>
                    INFORMATION MANAGEMENT
                </p>

            </div>


        </div>





        <nav class="navigation">



            <a href="DoctorDashboard.html" class="nav-item">

                <i data-lucide="layout-dashboard"></i>

                Dashboard

            </a>




            <a href="PatientManagement.html" class="nav-item">

                <i data-lucide="users"></i>

                Patient Management

            </a>





            <a href="CaseManagement.html" class="nav-item">

                <i data-lucide="folder-open"></i>

                My Cases

            </a>





            <a href="ExaminationForms.html" class="nav-item">

                <i data-lucide="clipboard-list"></i>

                Examination Forms

            </a>





            <a href="EvidenceSamples.html" class="nav-item">

                <i data-lucide="dna"></i>

                Evidence & Samples

            </a>





            <a href="Reports.html" class="nav-item">

                <i data-lucide="file-check"></i>

                Reports

            </a>





            <a href="Documents.html" class="nav-item">

                <i data-lucide="file-text"></i>

                Documents

            </a>





            <a href="Search.html" class="nav-item">

                <i data-lucide="search"></i>

                Search

            </a>



        </nav>






        <div class="security-card">


            <i data-lucide="shield-check"></i>



            <div>


                <strong>
                    SECURE SYSTEM
                </strong>


                <p>
                    Authorized medical personnel only
                </p>


            </div>


        </div>



        `;



        // Activate Lucide icons after inserting HTML
        lucide.createIcons();



    }
);
