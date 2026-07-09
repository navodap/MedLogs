const STORAGE_KEY = "fmdis_patients_v1";

const samplePatients = [
  {
    id: "PV-2026-00124",
    personStatus: "living",
    recordStatus: "Under Observation",
    createdAt: "2026-05-27T08:05",
    updatedAt: "2026-05-27T11:20",
    registeredBy: "System Clerk",
    confidentiality: "Restricted",
    accessFlag: "Minor Restricted",
    identificationStatus: "Identified",
    fullName: "Wijesinghe, A. K.",
    nicPassportNo: "200912345678",
    dateOfBirth: "2009-04-12",
    age: "17",
    gender: "Female",
    nationality: "Sri Lankan",
    ethnicity: "Sinhala",
    primaryLanguage: "Sinhala",
    isMinor: true,
    permanentAddress: "No. 24, Temple Road, Nugegoda",
    district: "Colombo",
    contactNo: "0712345678",
    hospitalNo: "HOSP-2026-5591",
    bhtNo: "BHT-12-2026-0091",
    living: {
      patientSource: "In-ward Patient",
      currentCondition: "Stable",
      consciousnessLevel: "Alert",
      consentStatus: "Guardian Consent Given",
      consentFormNo: "CONS/2026/118",
      admittedHospital: "National Hospital of Sri Lanka",
      ward: "Ward 12",
      bedNo: "05",
      admittedDateTime: "2026-05-27T07:40",
      dischargedDateTime: "",
      safetyRisk: "Child Protection Required",
      pregnancyStatus: "Not Applicable",
      notes: "Living minor victim referred for medico-legal examination. Guardian consent recorded and restricted access applied."
    },
    nextOfKin: {
      name: "Wijesinghe, M. K.",
      relationship: "Mother",
      contactNo: "0776543210",
      nic: "856789123V",
      address: "No. 24, Temple Road, Nugegoda"
    },
    linkedCases: [
      {
        caseId: "CL-2026-000123",
        type: "Clinical",
        category: "Assault",
        status: "Under Examination",
        reference: "MLEF/2026/145",
        registeredDateTime: "2026-05-27T08:15"
      }
    ],
    documents: [
      { label: "Consent Form", status: "Uploaded" },
      { label: "Patient ID Copy", status: "Pending" },
      { label: "Hospital Admission Record", status: "Uploaded" }
    ],
    auditReason: "Initial registration and guardian details verified."
  },
  {
    id: "PV-2026-00125",
    personStatus: "living",
    recordStatus: "Active",
    createdAt: "2026-05-27T14:30",
    updatedAt: "2026-05-27T15:15",
    registeredBy: "System Clerk",
    confidentiality: "Normal",
    accessFlag: "Standard Access",
    identificationStatus: "Identified",
    fullName: "Perera, M. N.",
    nicPassportNo: "199812300456",
    dateOfBirth: "1998-12-30",
    age: "27",
    gender: "Male",
    nationality: "Sri Lankan",
    ethnicity: "Sinhala",
    primaryLanguage: "Sinhala",
    isMinor: false,
    permanentAddress: "No. 18, Lake Road, Kandy",
    district: "Kandy",
    contactNo: "0752223344",
    hospitalNo: "OPD-2026-781",
    bhtNo: "",
    living: {
      patientSource: "Police Produced",
      currentCondition: "Stable",
      consciousnessLevel: "Alert",
      consentStatus: "Police / Court Order",
      consentFormNo: "",
      admittedHospital: "Teaching Hospital Kandy",
      ward: "OPD",
      bedNo: "",
      admittedDateTime: "",
      dischargedDateTime: "",
      safetyRisk: "None recorded",
      pregnancyStatus: "Not Applicable",
      notes: "Patient produced for suspected alcohol/drug influence assessment and sample collection."
    },
    nextOfKin: {
      name: "Perera, S. N.",
      relationship: "Father",
      contactNo: "0779988112",
      nic: "681234567V",
      address: "No. 18, Lake Road, Kandy"
    },
    linkedCases: [
      {
        caseId: "CL-2026-000124",
        type: "Clinical",
        category: "Toxicology",
        status: "Awaiting Lab Results",
        reference: "MLEF/2026/146",
        registeredDateTime: "2026-05-27T14:42"
      }
    ],
    documents: [
      { label: "MLEF Copy", status: "Uploaded" },
      { label: "Toxicology Request", status: "Uploaded" }
    ],
    auditReason: "Clinical toxicology record opened."
  },
  {
    id: "PV-2026-00126",
    personStatus: "deceased",
    recordStatus: "Deceased Received",
    createdAt: "2026-05-26T08:25",
    updatedAt: "2026-05-26T12:10",
    registeredBy: "System Clerk",
    confidentiality: "Restricted",
    accessFlag: "Court Priority",
    identificationStatus: "Identified",
    fullName: "Fernando, R. T.",
    nicPassportNo: "197811223344",
    dateOfBirth: "1978-11-22",
    age: "47",
    gender: "Male",
    nationality: "Sri Lankan",
    ethnicity: "Sinhala",
    primaryLanguage: "Sinhala",
    isMinor: false,
    permanentAddress: "No. 42, Sea Street, Galle",
    district: "Galle",
    contactNo: "",
    hospitalNo: "",
    bhtNo: "",
    deceased: {
      dateOfDeath: "2026-05-25",
      timeOfDeath: "21:30",
      placeOfDeath: "Road traffic scene, Galle-Colombo Road",
      deathLocationCategory: "Road / Public Place",
      occupation: "Driver",
      bodyReceivedDateTime: "2026-05-26T08:20",
      mortuary: "Galle Mortuary",
      bodyTagNo: "BODY/GAL/2026/045",
      bodyCondition: "Fresh",
      receivedFrom: "Police Officer",
      sealNo: "SEAL/2026/221",
      propertyHandedOver: "Yes",
      remarks: "Body identified by spouse. Clothing and property sealed and handed over with police note."
    },
    nextOfKin: {
      name: "Fernando, N. T.",
      relationship: "Spouse",
      contactNo: "0761234567",
      nic: "835551111V",
      address: "No. 42, Sea Street, Galle"
    },
    linkedCases: [
      {
        caseId: "PM-2026-000045",
        type: "Autopsy",
        category: "Accidental Death",
        status: "Report Drafting",
        reference: "PM-REG-2026-045",
        registeredDateTime: "2026-05-26T11:35"
      }
    ],
    documents: [
      { label: "Inquest Order", status: "Uploaded" },
      { label: "Body Receiving Form", status: "Uploaded" },
      { label: "Police Statement", status: "Pending" }
    ],
    auditReason: "Deceased person registered and linked with postmortem case."
  },
  {
    id: "PV-2026-00127",
    personStatus: "deceased",
    recordStatus: "Archived",
    createdAt: "2026-05-26T09:05",
    updatedAt: "2026-05-27T10:30",
    registeredBy: "System Clerk",
    confidentiality: "Normal",
    accessFlag: "Standard Access",
    identificationStatus: "Identified",
    fullName: "Silva, K. D.",
    nicPassportNo: "195506067890",
    dateOfBirth: "1955-06-06",
    age: "71",
    gender: "Male",
    nationality: "Sri Lankan",
    ethnicity: "Sinhala",
    primaryLanguage: "Sinhala",
    isMinor: false,
    permanentAddress: "No. 7, Station Road, Ragama",
    district: "Gampaha",
    contactNo: "",
    hospitalNo: "HOSP-2026-4410",
    bhtNo: "BHT-09-2026-0201",
    deceased: {
      dateOfDeath: "2026-05-25",
      timeOfDeath: "06:45",
      placeOfDeath: "Hospital ward",
      deathLocationCategory: "Hospital",
      occupation: "Retired Teacher",
      bodyReceivedDateTime: "2026-05-26T09:10",
      mortuary: "Ragama Mortuary",
      bodyTagNo: "BODY/RGM/2026/046",
      bodyCondition: "Fresh",
      receivedFrom: "Hospital Ward",
      sealNo: "",
      propertyHandedOver: "Not Applicable",
      remarks: "Natural death inquiry completed. Cause of death form issued after PM examination."
    },
    nextOfKin: {
      name: "Silva, P. D.",
      relationship: "Child",
      contactNo: "0719876543",
      nic: "891112222V",
      address: "No. 7, Station Road, Ragama"
    },
    linkedCases: [
      {
        caseId: "PM-2026-000046",
        type: "Autopsy",
        category: "Natural Death",
        status: "Closed",
        reference: "PM-REG-2026-046",
        registeredDateTime: "2026-05-26T09:10"
      }
    ],
    documents: [
      { label: "Inquest Order", status: "Uploaded" },
      { label: "COD Form", status: "Uploaded" },
      { label: "PMR Draft", status: "Final" }
    ],
    auditReason: "Record archived after report completion."
  }
];

const dom = {
  tabButtons: document.querySelectorAll(".tab-btn"),
  registrationPanel: document.getElementById("registrationPanel"),
  detailsPanel: document.getElementById("detailsPanel"),
  personSwitchButtons: document.querySelectorAll(".case-switch-btn"),
  patientForm: document.getElementById("patientForm"),
  patientId: document.getElementById("patientId"),
  personStatus: document.getElementById("personStatus"),
  createdAt: document.getElementById("createdAt"),
  clearFormBtn: document.getElementById("clearFormBtn"),
  recentBody: document.getElementById("recentBody"),
  patientTableBody: document.getElementById("patientTableBody"),
  emptyMessage: document.getElementById("emptyMessage"),
  patientSearch: document.getElementById("patientSearch"),
  statusFilter: document.getElementById("statusFilter"),
  viewRecentBtn: document.getElementById("viewRecentBtn"),
  menuBtn: document.querySelector(".menu-btn"),
  sidebar: document.querySelector(".sidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  dateDisplay: document.getElementById("currentDateDisplay"),
  dayDisplay: document.getElementById("currentDayDisplay"),
  formHeader: document.getElementById("registrationFormHeader"),
  submitBtn: document.getElementById("btnSubmitForm"),
  editPatientBtn: document.getElementById("btnEditPatientDetails"),
  totalRecordsStat: document.getElementById("totalRecordsStat"),
  livingStat: document.getElementById("livingStat"),
  deceasedStat: document.getElementById("deceasedStat"),
  globalPatientSearch: document.getElementById("globalPatientSearch")
};

let records = loadRecords();
let currentRegistrationType = "living";
let currentDetailsType = "living";
let selectedPatientId = null;
let isEditMode = false;

function loadRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [...samplePatients];
  } catch (error) {
    console.warn("Saved patient/victim records could not be read. Sample records were loaded.", error);
    return [...samplePatients];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function pad(number, size = 5) {
  return String(number).padStart(size, "0");
}

function currentYear() {
  return new Date().getFullYear();
}

function generatePatientId() {
  const year = currentYear();
  const sameSeries = records.filter(record => record.id && record.id.startsWith(`PV-${year}-`));
  const next = sameSeries.length
    ? Math.max(...sameSeries.map(record => Number(record.id.split("-").pop()) || 0)) + 1
    : 1;
  return `PV-${year}-${pad(next)}`;
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function value(id) {
  const element = document.getElementById(id);
  if (!element) return "";
  if (element.type === "checkbox") return element.checked;
  return element.value && element.value.trim ? element.value.trim() : element.value;
}

function setValue(id, input) {
  const element = document.getElementById(id);
  if (!element) return;

  if (element.type === "checkbox") {
    element.checked = Boolean(input);
  } else {
    element.value = input ?? "";
  }
}

function display(input) {
  return input && String(input).trim() ? input : "Not recorded";
}

function formatDate(input) {
  if (!input) return "Not recorded";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;

  const hasTime = String(input).includes("T");

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: hasTime ? "2-digit" : undefined,
    minute: hasTime ? "2-digit" : undefined
  });
}

function personTypeLabel(type) {
  return type === "living" ? "Living Victim" : "Deceased Person";
}

function statusClass(status) {
  if (["Active"].includes(status)) return "success";
  if (["Under Observation", "Deceased Received"].includes(status)) return "warn";
  if (["Archived"].includes(status)) return "light";
  if (["Draft"].includes(status)) return "purple";
  return "";
}

function updateTopbarLiveDate() {
  const now = new Date();

  dom.dateDisplay.textContent = now.toLocaleDateString(undefined, {
    month: "long",
    day: "2-digit",
    year: "numeric"
  });

  dom.dayDisplay.textContent = now.toLocaleDateString(undefined, {
    weekday: "long"
  });
}

function updateStats() {
  dom.totalRecordsStat.textContent = records.length;
  dom.livingStat.textContent = records.filter(record => record.personStatus === "living").length;
  dom.deceasedStat.textContent = records.filter(record => record.personStatus === "deceased").length;
}

function setInitialFormValues() {
  dom.patientId.value = generatePatientId();
  dom.createdAt.value = localDateTimeValue();
  dom.personStatus.value = currentRegistrationType;
}

function activateTab(tab) {
  dom.tabButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  dom.registrationPanel.classList.toggle("active", tab === "registration");
  dom.detailsPanel.classList.toggle("active", tab === "details");

  if (tab === "details") {
    renderPatientTable();
  }
}

function activatePersonType(context, type) {
  document.querySelectorAll(`.case-switch-btn[data-context="${context}"]`).forEach(button => {
    button.classList.toggle("active", button.dataset.type === type);
  });

  if (context === "registration") {
    currentRegistrationType = type;
    dom.personStatus.value = type;

    document.querySelectorAll(".living-section").forEach(section => {
      section.classList.toggle("active", type === "living");
    });

    document.querySelectorAll(".deceased-section").forEach(section => {
      section.classList.toggle("active", type === "deceased");
    });

    if (type === "living") {
      dom.formHeader.textContent = "Register a Living Victim / Patient";
      dom.submitBtn.textContent = isEditMode ? "Update Living Victim" : "Register Living Victim";
      setValue("personStatusDisplay", "Living Victim");
      setValue("recordStatus", "Active");
    } else {
      dom.formHeader.textContent = "Register a Deceased Person";
      dom.submitBtn.textContent = isEditMode ? "Update Deceased Person" : "Register Deceased Person";
      setValue("personStatusDisplay", "Deceased Person");
      setValue("recordStatus", "Deceased Received");
    }

    if (!isEditMode) {
      dom.patientId.value = generatePatientId();
    }
  }

  if (context === "details") {
    currentDetailsType = type;
    selectedPatientId = null;
    renderPatientTable();
    document.getElementById("fullPatientDetailsContainer").style.display = "none";
  }
}

function getFormData() {
  const type = value("personStatus") || currentRegistrationType;
  const existing = records.find(record => record.id === value("patientId"));
  const linkedCases = [];

  if (value("initialCaseNo")) {
    linkedCases.push({
      caseId: value("initialCaseNo"),
      type: value("initialCaseType") || (type === "living" ? "Clinical" : "Autopsy"),
      category: value("initialCaseCategory"),
      status: "Registered",
      reference: value("initialReferenceNo"),
      registeredDateTime: localDateTimeValue()
    });
  }

  if (existing && !linkedCases.length) {
    linkedCases.push(...(existing.linkedCases || []));
  }

  const record = {
    id: value("patientId") || generatePatientId(),
    personStatus: type,
    recordStatus: value("recordStatus") || (type === "living" ? "Active" : "Deceased Received"),
    createdAt: value("createdAt") || localDateTimeValue(),
    updatedAt: localDateTimeValue(),
    registeredBy: value("registeredBy"),
    confidentiality: value("confidentiality") || "Normal",
    accessFlag: value("accessFlag") || "Standard Access",
    identificationStatus: value("identificationStatus"),
    fullName: value("fullName"),
    nicPassportNo: value("nicPassportNo"),
    dateOfBirth: value("dateOfBirth"),
    age: value("age"),
    gender: value("gender"),
    nationality: value("nationality"),
    ethnicity: value("ethnicity"),
    primaryLanguage: value("primaryLanguage"),
    isMinor: value("isMinor") === "Yes",
    permanentAddress: value("permanentAddress"),
    district: value("district"),
    contactNo: value("contactNo"),
    hospitalNo: value("hospitalNo"),
    bhtNo: value("bhtNo"),
    living: {},
    deceased: {},
    nextOfKin: {
      name: value("nokName"),
      relationship: value("nokRelationship"),
      contactNo: value("nokContactNo"),
      nic: value("nokNic"),
      address: value("nokAddress")
    },
    linkedCases,
    documents: existing?.documents || [],
    auditReason: existing
      ? "Patient / victim record updated from management page."
      : "Initial patient / victim registration."
  };

  if (type === "living") {
    record.living = {
      patientSource: value("patientSource"),
      currentCondition: value("currentCondition"),
      consciousnessLevel: value("consciousnessLevel"),
      consentStatus: value("consentStatus"),
      consentFormNo: value("consentFormNo"),
      admittedHospital: value("admittedHospital"),
      ward: value("ward"),
      bedNo: value("bedNo"),
      admittedDateTime: value("admittedDateTime"),
      dischargedDateTime: value("dischargedDateTime"),
      safetyRisk: value("safetyRisk"),
      pregnancyStatus: value("pregnancyStatus"),
      notes: value("livingNotes")
    };
  } else {
    record.deceased = {
      dateOfDeath: value("dateOfDeath"),
      timeOfDeath: value("timeOfDeath"),
      placeOfDeath: value("placeOfDeath"),
      deathLocationCategory: value("deathLocationCategory"),
      occupation: value("occupation"),
      bodyReceivedDateTime: value("bodyReceivedDateTime"),
      mortuary: value("mortuary"),
      bodyTagNo: value("bodyTagNo"),
      bodyCondition: value("bodyCondition"),
      receivedFrom: value("receivedFrom"),
      sealNo: value("sealNo"),
      propertyHandedOver: value("propertyHandedOver"),
      remarks: value("deceasedRemarks")
    };
  }

  if (!record.documents.length) {
    record.documents = type === "living"
      ? [
          {
            label: "Consent Form",
            status: record.living.consentFormNo ? "Uploaded" : "Pending"
          },
          {
            label: "Identity Document",
            status: record.nicPassportNo ? "Verified" : "Pending"
          },
          {
            label: "Hospital Admission Record",
            status: record.bhtNo ? "Uploaded" : "Pending"
          }
        ]
      : [
          {
            label: "Body Receiving Form",
            status: record.deceased.bodyTagNo ? "Uploaded" : "Pending"
          },
          {
            label: "Inquest / Court Order",
            status: "Pending"
          },
          {
            label: "Identification Confirmation",
            status: record.identificationStatus === "Identified" ? "Verified" : "Pending"
          }
        ];
  }

  return record;
}

function validateRecord(record) {
  const missing = [];

  if (!record.fullName) {
    missing.push(
      record.personStatus === "living"
        ? "Patient / victim full name"
        : "Deceased person full name or unknown label"
    );
  }

  if (!record.age) missing.push("Age");
  if (!record.gender) missing.push("Gender");
  if (!record.identificationStatus) missing.push("Identification status");

  if (record.personStatus === "living") {
    if (!record.living.currentCondition) missing.push("Current condition");
    if (!record.living.consentStatus) missing.push("Consent status");

    if (record.isMinor && !record.nextOfKin.name) {
      missing.push("Guardian / next of kin name for minor case");
    }

    if (record.isMinor && !record.nextOfKin.contactNo) {
      missing.push("Guardian / next of kin contact for minor case");
    }
  }

  if (record.personStatus === "deceased") {
    if (!record.deceased.placeOfDeath) missing.push("Place of death");
    if (!record.deceased.bodyReceivedDateTime) missing.push("Body received date and time");
    if (!record.deceased.bodyTagNo) missing.push("Body tag number");
  }

  return missing;
}

function resetForm() {
  dom.patientForm.reset();
  isEditMode = false;
  activatePersonType("registration", currentRegistrationType);
  setInitialFormValues();
  dom.submitBtn.textContent =
    currentRegistrationType === "living"
      ? "Register Living Victim"
      : "Register Deceased Person";
}

function savePatient(event) {
  event.preventDefault();

  const record = getFormData();
  const missing = validateRecord(record);

  if (missing.length) {
    document.getElementById("validationMissingList").innerHTML =
      missing.map(item => `<li>${item}</li>`).join("");

    document.getElementById("validationModal").style.display = "grid";
    return;
  }

  records = [record, ...records.filter(item => item.id !== record.id)];
  selectedPatientId = record.id;

  saveRecords();
  renderPatientTable();
  renderRecentRecords();
  updateStats();

  document.getElementById("successModalMessage").textContent =
    `${record.id} saved successfully.`;

  document.getElementById("successModal").style.display = "grid";
  resetForm();
}

function filteredRecords() {
  const query =
    (dom.patientSearch.value || dom.globalPatientSearch.value || "")
      .toLowerCase()
      .trim();

  const status = dom.statusFilter.value;

  return records.filter(record => {
    if (record.personStatus !== currentDetailsType) return false;
    if (status !== "all" && record.recordStatus !== status) return false;
    if (!query) return true;

    const linkedCaseText = (record.linkedCases || [])
      .map(item => `${item.caseId} ${item.reference} ${item.category}`)
      .join(" ");

    return [
      record.id,
      record.fullName,
      record.nicPassportNo,
      record.hospitalNo,
      record.bhtNo,
      record.identificationStatus,
      record.district,
      record.deceased?.bodyTagNo,
      linkedCaseText
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

function renderPatientTable() {
  const data = filteredRecords();

  dom.patientTableBody.innerHTML = data.map(record => `
    <tr>
      <td><strong>${record.id}</strong></td>
      <td>${display(record.fullName)}<br><small>${personTypeLabel(record.personStatus)}</small></td>
      <td>${display(record.nicPassportNo)}<br><small>${display(record.hospitalNo || record.bhtNo || record.deceased?.bodyTagNo)}</small></td>
      <td><span class="badge ${record.identificationStatus === "Unidentified" ? "danger" : "purple"}">${display(record.identificationStatus)}</span></td>
      <td>${record.linkedCases?.length || 0}</td>
      <td><span class="badge ${statusClass(record.recordStatus)}">${display(record.recordStatus)}</span></td>
      <td><button class="table-action" type="button" data-patient-id="${record.id}">View</button></td>
    </tr>
  `).join("");

  dom.emptyMessage.hidden = data.length !== 0;
}

function renderRecentRecords() {
  const recent = records.slice(0, 5);

  dom.recentBody.innerHTML = recent.map(record => `
    <tr>
      <td><strong>${record.id}</strong></td>
      <td>${display(record.fullName)}</td>
      <td>${personTypeLabel(record.personStatus)}</td>
      <td><span class="badge ${statusClass(record.recordStatus)}">${display(record.recordStatus)}</span></td>
      <td>${formatDate(record.updatedAt || record.createdAt)}</td>
    </tr>
  `).join("");
}

function infoRow(label, valueText) {
  return `
    <div class="card-info-row">
      <small>${label}:</small>
      <span>${display(valueText)}</span>
    </div>
  `;
}

function populateFullPatientDetails(patientId) {
  const record = records.find(item => item.id === patientId);
  const container = document.getElementById("fullPatientDetailsContainer");

  if (!record) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  document.getElementById("detHeaderId").textContent = record.id;
  document.getElementById("detHeaderType").textContent = personTypeLabel(record.personStatus);
  document.getElementById("detHeaderType").className =
    `badge ${record.personStatus === "living" ? "success" : "warn"}`;

  document.getElementById("detHeaderStatus").textContent = display(record.recordStatus);
  document.getElementById("detHeaderStatus").className =
    `badge ${statusClass(record.recordStatus)}`;

  document.getElementById("detHeaderName").textContent =
    `Patient: ${display(record.fullName)}`;

  document.getElementById("detHeaderConfidentiality").textContent =
    display(record.confidentiality);

  document.getElementById("detHeaderConfidentiality").className =
    `badge ${record.confidentiality === "Normal" ? "light" : "danger"}`;

  document.getElementById("detHeaderMinor").textContent =
    record.isMinor ? "Minor" : "Adult";

  document.getElementById("detHeaderMinor").className =
    `badge ${record.isMinor ? "danger" : "light"}`;

  document.getElementById("detCreatedAt").textContent = formatDate(record.createdAt);
  document.getElementById("detUpdatedAt").textContent = formatDate(record.updatedAt);
  document.getElementById("detRegisteredBy").textContent = display(record.registeredBy);
  document.getElementById("detAccessFlag").textContent = display(record.accessFlag);

  document.getElementById("detFullName").textContent = display(record.fullName);
  document.getElementById("detNic").textContent = display(record.nicPassportNo);
  document.getElementById("detDobAge").textContent =
    `${formatDate(record.dateOfBirth)} / ${display(record.age)} years`;

  document.getElementById("detGender").textContent = display(record.gender);
  document.getElementById("detNationalityEthnicity").textContent =
    `${display(record.nationality)} / ${display(record.ethnicity)}`;

  document.getElementById("detIdentificationStatus").textContent =
    display(record.identificationStatus);

  document.getElementById("detContactNo").textContent = display(record.contactNo);
  document.getElementById("detHospitalNo").textContent = display(record.hospitalNo);
  document.getElementById("detBhtNo").textContent = display(record.bhtNo);
  document.getElementById("detDistrict").textContent = display(record.district);
  document.getElementById("detAddress").textContent = display(record.permanentAddress);

  document.getElementById("detSpecificTitle").textContent =
    record.personStatus === "living"
      ? "Living Victim / Patient Details"
      : "Deceased Person / Body Receiving Details";

  if (record.personStatus === "living") {
    const living = record.living || {};

    document.getElementById("detSpecificRows").innerHTML = [
      infoRow("Patient Source", living.patientSource),
      infoRow("Current Condition", living.currentCondition),
      infoRow("Consciousness Level", living.consciousnessLevel),
      infoRow("Consent Status", living.consentStatus),
      infoRow("Consent Form No", living.consentFormNo),
      infoRow("Hospital / Ward / Bed", `${display(living.admittedHospital)} / ${display(living.ward)} / ${display(living.bedNo)}`),
      infoRow("Admitted Date & Time", formatDate(living.admittedDateTime)),
      infoRow("Discharged Date & Time", formatDate(living.dischargedDateTime)),
      infoRow("Safety Risk", living.safetyRisk),
      infoRow("Pregnancy Status", living.pregnancyStatus),
      infoRow("Notes", living.notes)
    ].join("");
  } else {
    const deceased = record.deceased || {};

    document.getElementById("detSpecificRows").innerHTML = [
      infoRow("Date / Time of Death", `${display(deceased.dateOfDeath)} ${display(deceased.timeOfDeath)}`),
      infoRow("Place of Death", deceased.placeOfDeath),
      infoRow("Death Location Category", deceased.deathLocationCategory),
      infoRow("Occupation", deceased.occupation),
      infoRow("Body Received", formatDate(deceased.bodyReceivedDateTime)),
      infoRow("Mortuary / Storage", deceased.mortuary),
      infoRow("Body Tag No", deceased.bodyTagNo),
      infoRow("Body Condition", deceased.bodyCondition),
      infoRow("Received From", deceased.receivedFrom),
      infoRow("Seal / Property Bag No", deceased.sealNo),
      infoRow("Property Handed Over", deceased.propertyHandedOver),
      infoRow("Remarks", deceased.remarks)
    ].join("");
  }

  const nok = record.nextOfKin || {};

  document.getElementById("detNokName").textContent = display(nok.name);
  document.getElementById("detNokRelationship").textContent = display(nok.relationship);
  document.getElementById("detNokContact").textContent = display(nok.contactNo);
  document.getElementById("detNokNic").textContent = display(nok.nic);
  document.getElementById("detNokAddress").textContent = display(nok.address);

  const cases = record.linkedCases || [];

  document.getElementById("detLinkedCases").innerHTML = cases.length
    ? cases.map(item => `
        <div class="linked-case-item">
          <strong>
            ${display(item.caseId)}
            <span class="badge ${item.type === "Clinical" ? "success" : "warn"}">${display(item.type)}</span>
          </strong>
          <small>${display(item.category)} • ${display(item.status)} • Ref: ${display(item.reference)}</small>
          <small>Registered: ${formatDate(item.registeredDateTime)}</small>
        </div>
      `).join("")
    : `<p class="empty-state" style="padding: 12px;">No linked forensic cases yet.</p>`;

  document.getElementById("detDocumentsList").innerHTML = (record.documents || []).map(doc => `
    <div style="display:flex; justify-content:space-between; padding:7px 9px; background:var(--page-bg); border-radius:6px;">
      <span>${display(doc.label)}</span>
      <span style="color:${["Uploaded", "Verified", "Final"].includes(doc.status) ? "var(--success)" : "var(--warning)"}; font-weight:bold;">
        ${display(doc.status)}
      </span>
    </div>
  `).join("");

  document.getElementById("detAuditReason").textContent = display(record.auditReason);
  document.getElementById("detCaseCount").textContent = String(cases.length);
  document.getElementById("detIntegrity").textContent =
    "Local UI record valid. Backend audit log connection pending.";
}

function populateFormForEditing(patientId) {
  const record = records.find(item => item.id === patientId);
  if (!record) return;

  isEditMode = true;

  activateTab("registration");
  activatePersonType("registration", record.personStatus);

  setValue("patientId", record.id);
  setValue("personStatus", record.personStatus);
  setValue("personStatusDisplay", personTypeLabel(record.personStatus));
  setValue("recordStatus", record.recordStatus);
  setValue("createdAt", record.createdAt);
  setValue("registeredBy", record.registeredBy);
  setValue("confidentiality", record.confidentiality);
  setValue("identificationStatus", record.identificationStatus);
  setValue("fullName", record.fullName);
  setValue("nicPassportNo", record.nicPassportNo);
  setValue("dateOfBirth", record.dateOfBirth);
  setValue("age", record.age);
  setValue("gender", record.gender);
  setValue("nationality", record.nationality);
  setValue("ethnicity", record.ethnicity);
  setValue("primaryLanguage", record.primaryLanguage);
  setValue("isMinor", record.isMinor ? "Yes" : "No");
  setValue("contactNo", record.contactNo);
  setValue("hospitalNo", record.hospitalNo);
  setValue("bhtNo", record.bhtNo);
  setValue("district", record.district);
  setValue("permanentAddress", record.permanentAddress);
  setValue("accessFlag", record.accessFlag);

  const nok = record.nextOfKin || {};

  setValue("nokName", nok.name);
  setValue("nokRelationship", nok.relationship);
  setValue("nokContactNo", nok.contactNo);
  setValue("nokNic", nok.nic);
  setValue("nokAddress", nok.address);

  if (record.personStatus === "living") {
    const living = record.living || {};

    setValue("patientSource", living.patientSource);
    setValue("currentCondition", living.currentCondition);
    setValue("consciousnessLevel", living.consciousnessLevel);
    setValue("consentStatus", living.consentStatus);
    setValue("consentFormNo", living.consentFormNo);
    setValue("admittedHospital", living.admittedHospital);
    setValue("ward", living.ward);
    setValue("bedNo", living.bedNo);
    setValue("admittedDateTime", living.admittedDateTime);
    setValue("dischargedDateTime", living.dischargedDateTime);
    setValue("safetyRisk", living.safetyRisk);
    setValue("pregnancyStatus", living.pregnancyStatus);
    setValue("livingNotes", living.notes);
  } else {
    const deceased = record.deceased || {};

    setValue("dateOfDeath", deceased.dateOfDeath);
    setValue("timeOfDeath", deceased.timeOfDeath);
    setValue("placeOfDeath", deceased.placeOfDeath);
    setValue("deathLocationCategory", deceased.deathLocationCategory);
    setValue("occupation", deceased.occupation);
    setValue("bodyReceivedDateTime", deceased.bodyReceivedDateTime);
    setValue("mortuary", deceased.mortuary);
    setValue("bodyTagNo", deceased.bodyTagNo);
    setValue("bodyCondition", deceased.bodyCondition);
    setValue("receivedFrom", deceased.receivedFrom);
    setValue("sealNo", deceased.sealNo);
    setValue("propertyHandedOver", deceased.propertyHandedOver);
    setValue("deceasedRemarks", deceased.remarks);
  }

  const firstCase = record.linkedCases?.[0];

  setValue("initialCaseNo", firstCase?.caseId || "");
  setValue("initialCaseType", firstCase?.type || "");
  setValue("initialCaseCategory", firstCase?.category || "");
  setValue("initialReferenceNo", firstCase?.reference || "");

  dom.formHeader.textContent = `Update Patient / Victim Record: ${record.id}`;
  dom.submitBtn.textContent =
    record.personStatus === "living"
      ? "Update Living Victim"
      : "Update Deceased Person";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindEvents() {
  dom.tabButtons.forEach(button => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  dom.personSwitchButtons.forEach(button => {
    button.addEventListener("click", () => {
      activatePersonType(button.dataset.context, button.dataset.type);
    });
  });

  dom.patientForm.addEventListener("submit", savePatient);
  dom.clearFormBtn.addEventListener("click", resetForm);
  dom.patientSearch.addEventListener("input", renderPatientTable);
  dom.statusFilter.addEventListener("change", renderPatientTable);

  dom.globalPatientSearch.addEventListener("input", () => {
    activateTab("details");
    dom.patientSearch.value = dom.globalPatientSearch.value;
    renderPatientTable();
  });

  document.getElementById("isMinor")?.addEventListener("change", () => {
    if (value("isMinor") === "Yes") {
      setValue("confidentiality", "Restricted");
      setValue("accessFlag", "Minor Restricted");
    }
  });

  dom.patientTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-patient-id]");
    if (!button) return;

    selectedPatientId = button.dataset.patientId;
    populateFullPatientDetails(selectedPatientId);
  });

  dom.viewRecentBtn.addEventListener("click", () => activateTab("details"));

  dom.menuBtn.addEventListener("click", () => {
    dom.sidebar.classList.add("open");
    dom.sidebarOverlay.classList.add("active");
  });

  dom.sidebarOverlay.addEventListener("click", () => {
    dom.sidebar.classList.remove("open");
    dom.sidebarOverlay.classList.remove("active");
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      dom.sidebar.classList.remove("open");
      dom.sidebarOverlay.classList.remove("active");
    });
  });

  document.getElementById("btnSaveAsDraft")?.addEventListener("click", () => {
    document.getElementById("draftModal").style.display = "grid";
  });

  document.getElementById("btnCloseDraftModal")?.addEventListener("click", () => {
    document.getElementById("draftModal").style.display = "none";
  });

  document.getElementById("btnCloseValidationModal")?.addEventListener("click", () => {
    document.getElementById("validationModal").style.display = "none";
  });

  document.getElementById("btnCloseSuccessModal")?.addEventListener("click", () => {
    document.getElementById("successModal").style.display = "none";
  });

  document.getElementById("btnEditPatientDetails")?.addEventListener("click", () => {
    if (selectedPatientId) {
      populateFormForEditing(selectedPatientId);
    } else {
      alert("Please select a patient/victim record from the table first.");
    }
  });
}

function init() {
  bindEvents();
  setInitialFormValues();
  renderPatientTable();
  renderRecentRecords();
  updateStats();
  updateTopbarLiveDate();
}

init();
