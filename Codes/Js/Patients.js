const patients = [
  ["PV-2026-000128", "Ravi Kumar", "200012345678", 28, "Male", "Living Victim", "BHT-26-01456", 2],
  ["PV-2026-000129", "Anjali Sharma", "199812345679", 31, "Female", "Living Victim", "BHT-26-01457", 3],
  ["PV-2026-000130", "Mohamed Irfan", "199505678901", 39, "Male", "Living Victim", "BHT-26-01458", 1],
  ["PV-2026-000125", "Samanthi Perera", "199906543210", 26, "Female", "Living Victim", "BHT-26-01459", 2],
  ["PV-2026-000121", "Nuwan Silva", "198704321098", 41, "Male", "Living Victim", "BHT-26-01460", 1],
  ["PV-2026-000117", "Vimukthi Jayawardena", "197812309876", 47, "Male", "Deceased Person", "BHT-26-01321", 2],
  ["PV-2026-000114", "Tharushi Dissanayake", "199305678234", 30, "Female", "Deceased Person", "BHT-26-01322", 3],
  ["PV-2026-000110", "Wasim Akram", "198903456789", 36, "Male", "Deceased Person", "BHT-26-01323", 1],
  ["PV-2026-000108", "Indika Fernando", "197610987654", 49, "Male", "Deceased Person", "BHT-26-01324", 2],
  ["PV-2026-000103", "Menaka Wijesinghe", "196912345678", 56, "Female", "Deceased Person", "BHT-26-01325", 1]
];

const tableBody = document.getElementById("patientTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

function renderPatients() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;

  tableBody.innerHTML = "";

  patients
    .filter(patient => {
      const matchesSearch = patient.join(" ").toLowerCase().includes(search);
      const matchesStatus = !status || patient[5] === status;
      return matchesSearch && matchesStatus;
    })
    .forEach((patient, index) => {
      const row = document.createElement("tr");

      if (index === 0) {
        row.classList.add("selected-row");
      }

      row.innerHTML = `
        <td><strong style="color:#075bd8">${patient[0]}</strong></td>
        <td>${patient[1]}</td>
        <td>${patient[2]}</td>
        <td>${patient[3]}</td>
        <td>${patient[4]}</td>
        <td>
          <span class="badge ${patient[5] === "Living Victim" ? "living" : "deceased"}">
            ${patient[5]}
          </span>
        </td>
        <td>${patient[6]}</td>
        <td>${patient[7]}</td>
        <td>
          <button class="icon-btn" title="View"><i data-lucide="eye"></i></button>
          <button class="icon-btn" title="Edit"><i data-lucide="pencil"></i></button>
        </td>
      `;

      tableBody.appendChild(row);
    });

  lucide.createIcons();
}

searchInput.addEventListener("input", renderPatients);
statusFilter.addEventListener("change", renderPatients);

document.addEventListener("keydown", event => {
  if (event.ctrlKey && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

lucide.createIcons();
renderPatients();
