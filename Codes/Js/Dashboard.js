const stats = [
  {
    title: "Total Cases",
    value: "1,248",
    growth: "12.5% from last month",
    icon: "briefcase-medical",
    tone: "blue"
  },
  {
    title: "Clinical Cases",
    value: "732",
    growth: "9.8% from last month",
    icon: "stethoscope",
    tone: "teal"
  },
  {
    title: "Postmortem Cases",
    value: "516",
    growth: "15.3% from last month",
    icon: "skull",
    tone: "purple"
  },
  {
    title: "Pending Reports",
    value: "128",
    growth: "8.2% from last month",
    icon: "file-warning",
    tone: "orange"
  },
  {
    title: "Submitted Reports",
    value: "1,102",
    growth: "14.7% from last month",
    icon: "file-check-2",
    tone: "green"
  },
  {
    title: "Upcoming Court Dates",
    value: "18",
    growth: "5.9% from last month",
    icon: "gavel",
    tone: "blue"
  }
];

const monthlyData = [
  { month: "Jun '25", clinical: 62, postmortem: 41 },
  { month: "Jul '25", clinical: 68, postmortem: 45 },
  { month: "Aug '25", clinical: 74, postmortem: 48 },
  { month: "Sep '25", clinical: 83, postmortem: 55 },
  { month: "Oct '25", clinical: 92, postmortem: 60 },
  { month: "Nov '25", clinical: 101, postmortem: 64 },
  { month: "Dec '25", clinical: 110, postmortem: 72 },
  { month: "Jan '26", clinical: 118, postmortem: 81 },
  { month: "Feb '26", clinical: 122, postmortem: 84 },
  { month: "Mar '26", clinical: 135, postmortem: 88 },
  { month: "Apr '26", clinical: 140, postmortem: 96 },
  { month: "May '26", clinical: 147, postmortem: 102 }
];

const upcomingCourtDates = [
  ["CL-2026-000123", "District Court, City", "24 May 2026", "Scheduled"],
  ["PM-2026-000045", "Sessions Court", "27 May 2026", "Scheduled"],
  ["CL-2026-000098", "Magistrate Court", "02 Jun 2026", "Scheduled"],
  ["PM-2026-000067", "District Court, City", "05 Jun 2026", "Scheduled"],
  ["CL-2026-000150", "Sessions Court", "09 Jun 2026", "Scheduled"]
];

const activities = [
  {
    icon: "file-check-2",
    tone: "green",
    title: "Report submitted for case CL-2026-000123",
    meta: "By Dr. Neha Sharma",
    time: "20 May 2026, 10:15 AM"
  },
  {
    icon: "test-tube-2",
    tone: "purple",
    title: "Evidence sample EV-2026-000789 added",
    meta: "For case PM-2026-000045",
    time: "20 May 2026, 09:42 AM"
  },
  {
    icon: "user-round-plus",
    tone: "orange",
    title: "New clinical case CL-2026-000151 registered",
    meta: "By Dr. Arjun Patel",
    time: "20 May 2026, 09:10 AM"
  },
  {
    icon: "gavel",
    tone: "blue",
    title: "Court date updated for case PM-2026-000067",
    meta: "New date: 05 Jun 2026",
    time: "19 May 2026, 04:30 PM"
  },
  {
    icon: "clipboard-plus",
    tone: "teal",
    title: "Postmortem examination completed",
    meta: "Case PM-2026-000044",
    time: "19 May 2026, 02:05 PM"
  }
];

const pendingReports = [
  ["CL-2026-000150", "Medico-Legal Report", "Dr. Neha Sharma", "22 May 2026", 2],
  ["PM-2026-000067", "Postmortem Report", "Dr. Rakesh Verma", "23 May 2026", 3],
  ["CL-2026-000128", "Injury Report", "Dr. Priya Desai", "25 May 2026", 5],
  ["PM-2026-000048", "Toxicology Report", "Dr. Rakesh Verma", "26 May 2026", 6],
  ["CL-2026-000126", "Medico-Legal Report", "Dr. Neha Sharma", "27 May 2026", 7]
];

const recentCases = [
  ["CL-2026-000151", "Rohit Kumar, 28 Y\nAlleged Assault", "Clinical", "20 May 2026", "Open"],
  ["PM-2026-000088", "Unknown Male, 45 Y\nRoad Traffic Accident", "Postmortem", "20 May 2026", "In Progress"],
  ["CL-2026-000150", "Anita Singh, 32 Y\nFall from Height", "Clinical", "19 May 2026", "Open"],
  ["PM-2026-000067", "Unknown Female, 50 Y\nSuspected Poisoning", "Postmortem", "19 May 2026", "In Progress"],
  ["CL-2026-000149", "Vikram Patel, 40 Y\nBlunt Trauma", "Clinical", "18 May 2026", "Closed"]
];

function renderStats() {
  const grid = document.getElementById("statsGrid");
  const iconBg = {
    blue: "#e3edff",
    teal: "#dcf8f4",
    purple: "#eee6ff",
    orange: "#ffeed9",
    green: "#def6e7"
  };
  const iconColor = {
    blue: "#1f67dc",
    teal: "#14ab9e",
    purple: "#6f52c5",
    orange: "#e78d18",
    green: "#1b984f"
  };

  grid.innerHTML = stats
    .map(item => `
      <article class="stat-card">
        <div class="icon" style="background:${iconBg[item.tone]}; color:${iconColor[item.tone]};">
          <i data-lucide="${item.icon}"></i>
        </div>
        <div>
          <h4>${item.title}</h4>
          <strong>${item.value}</strong>
          <small>↗ ${item.growth}</small>
        </div>
      </article>
    `)
    .join("");
}

function renderBars() {
  const container = document.getElementById("monthlyBars");
  const maxValue = Math.max(...monthlyData.map(item => Math.max(item.clinical, item.postmortem)));

  container.innerHTML = monthlyData
    .map(item => {
      const clinicalHeight = (item.clinical / maxValue) * 100;
      const postmortemHeight = (item.postmortem / maxValue) * 100;

      return `
        <div class="bar-pair" title="${item.month}: Clinical ${item.clinical}, Postmortem ${item.postmortem}">
          <div class="bar clinical" style="height:${clinicalHeight}%"></div>
          <div class="bar postmortem" style="height:${postmortemHeight}%"></div>
          <span>${item.month}</span>
        </div>
      `;
    })
    .join("");
}

function renderTableRows(tableId, rows, mapper) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = rows.map(mapper).join("");
}

function tag(status) {
  const map = {
    Scheduled: "blue",
    Clinical: "blue",
    Postmortem: "teal",
    Open: "green",
    "In Progress": "yellow",
    Closed: "gray"
  };

  return `<span class="tag ${map[status] || "gray"}">${status}</span>`;
}

function dayLeftBadge(daysLeft) {
  let tone = "green";
  if (daysLeft <= 2) {
    tone = "red";
  } else if (daysLeft <= 4) {
    tone = "orange";
  } else if (daysLeft <= 6) {
    tone = "yellow";
  }

  return `<span class="tag ${tone}">${daysLeft}</span>`;
}

function renderListsAndTables() {
  renderTableRows("courtDatesTable", upcomingCourtDates, row => `
    <tr>
      <td><strong>${row[0]}</strong></td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${tag(row[3])}</td>
    </tr>
  `);

  renderTableRows("pendingReportsTable", pendingReports, row => `
    <tr>
      <td><strong>${row[0]}</strong></td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${row[3]}</td>
      <td>${dayLeftBadge(row[4])}</td>
    </tr>
  `);

  renderTableRows("recentCasesTable", recentCases, row => {
    const [name, details] = row[1].split("\n");

    return `
      <tr>
        <td><strong>${row[0]}</strong></td>
        <td>
          <strong>${name}</strong>
          <p>${details}</p>
        </td>
        <td>${tag(row[2])}</td>
        <td>${row[3]}</td>
        <td>${tag(row[4])}</td>
      </tr>
    `;
  });

  const activityList = document.getElementById("activityList");
  activityList.innerHTML = activities
    .map(item => `
      <li>
        <span class="activity-icon ${item.tone}">
          <i data-lucide="${item.icon}"></i>
        </span>
        <div>
          <strong>${item.title}</strong>
          <p>${item.meta}</p>
          <small>${item.time}</small>
        </div>
      </li>
    `)
    .join("");
}

function renderDate() {
  const todayDate = document.getElementById("todayDate");
  const now = new Date();
  const formatted = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long"
  });

  todayDate.textContent = formatted;
}

function applyQuickSearchShortcut() {
  const search = document.querySelector(".search-bar input");
  document.addEventListener("keydown", event => {
    if (event.ctrlKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      search.focus();
      search.select();
    }
  });
}

renderStats();
renderBars();
renderListsAndTables();
renderDate();
applyQuickSearchShortcut();
lucide.createIcons();
