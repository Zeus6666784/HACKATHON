import type { 
  Facility, 
  Referral, 
  ReferralEvent, 
  FollowUpRecord, 
  MedicationPlan, 
  MedicationReminder, 
  DashboardStats, 
  Notification,
  TriageResult,
  Patient
} from "../types";

export const DEMO_FACILITIES: Facility[] = [
  {
    _id: "fac-nashik-dh",
    name: "Nashik District Civil Hospital",
    type: "DISTRICT",
    district: "Nashik",
    services: ["ICU", "Cardiology", "Trauma & Emergency", "General Surgery", "Obstetrics & Gynecology", "Pediatrics (SNCU)", "24x7 Diagnostics"],
    specialists: ["Dr. S. M. Deshmukh (Chief Cardiologist)", "Dr. Anita Rao (Senior Trauma Surgeon)", "Dr. V. P. Sonawane (Intensivist)"],
    emergencyCapability: true,
    verificationState: "VERIFIED",
    source: "Government of Maharashtra DHS Directory",
    coordinates: [73.7898, 19.9975],
    score: 96,
    distanceKm: 0,
    nodalOfficer: "Dr. B. K. Pawar (Civil Surgeon)",
    nodalOfficerPhone: "+91 98230 45612",
    ambulancePhone: "108 / 0253-2578912",
    icuBedsAvailable: 4,
    oxygenBedsAvailable: 18
  },
  {
    _id: "fac-wai-phc",
    name: "Wai Primary Health Centre",
    type: "PHC",
    district: "Satara / Wai",
    services: ["Primary Outpatient", "Maternal Care (ANC/PNC)", "Emergency Stabilization", "Immunization", "Basic Lab Testing"],
    specialists: ["Dr. Ramesh Shinde (Medical Officer)", "Dr. Priya Bhosale (LMO)"],
    emergencyCapability: true,
    verificationState: "VERIFIED",
    source: "NHM Rural Health Statistics",
    coordinates: [73.8214, 17.9472],
    score: 82,
    distanceKm: 42,
    nodalOfficer: "Dr. Ramesh Shinde (PHC MO)",
    nodalOfficerPhone: "+91 94220 11234",
    ambulancePhone: "108",
    icuBedsAvailable: 0,
    oxygenBedsAvailable: 2
  },
  {
    _id: "fac-kem-mumbai",
    name: "KEM Hospital & Seth G.S. Medical College",
    type: "TERTIARY",
    district: "Mumbai",
    services: ["Advanced Cath Lab", "Cardiothoracic Surgery", "Neurosurgery", "Surgical ICU", "Advanced Dialysis", "Level 1 Trauma"],
    specialists: ["Dr. P. V. Kulkarni (Chief Cardiothoracic Surgeon)", "Dr. M. S. Joshi (Neurologist)", "Dr. R. N. Shenoy (Interventional Cardiologist)"],
    emergencyCapability: true,
    verificationState: "VERIFIED",
    source: "MCGM Tertiary Directory",
    coordinates: [72.8427, 19.0022],
    score: 99,
    distanceKm: 165,
    nodalOfficer: "Dr. Sangita Rawat (Dean)",
    nodalOfficerPhone: "+91 98201 98765",
    ambulancePhone: "108 / 022-24107000",
    icuBedsAvailable: 7,
    oxygenBedsAvailable: 34
  },
  {
    _id: "fac-khodala-phc",
    name: "Khodala Primary Health Centre",
    type: "PHC",
    district: "Palghar / Mokhada",
    services: ["Primary Care", "Severe Acute Malnutrition Unit", "Maternal & Child Health", "ASHA Outreach Hub"],
    specialists: ["Dr. Jayant Patil (Medical Officer)"],
    emergencyCapability: false,
    verificationState: "VERIFIED",
    source: "Tribal Health Mission",
    coordinates: [73.3421, 19.8214],
    score: 75,
    distanceKm: 68,
    nodalOfficer: "Dr. Jayant Patil",
    nodalOfficerPhone: "+91 94230 55432",
    ambulancePhone: "108",
    icuBedsAvailable: 0,
    oxygenBedsAvailable: 1
  },
  {
    _id: "fac-igatpuri-rh",
    name: "Igatpuri Rural Sub-District Hospital",
    type: "PHC",
    district: "Nashik",
    services: ["Emergency Trauma Stabilization", "Secondary Maternity", "Digital Radiography", "Blood Storage Centre"],
    specialists: ["Dr. Sunita Kadam (Medical Superintendent)"],
    emergencyCapability: true,
    verificationState: "VERIFIED",
    source: "DHS Maharashtra",
    coordinates: [73.5612, 19.6987],
    score: 88,
    distanceKm: 45,
    nodalOfficer: "Dr. Sunita Kadam",
    nodalOfficerPhone: "+91 97650 33211",
    ambulancePhone: "108 / 02553-244102",
    icuBedsAvailable: 2,
    oxygenBedsAvailable: 8
  }
];

export const DEMO_REFERRALS: Referral[] = [
  {
    _id: "ref-101",
    referralId: "MH-NSK-2026-0891",
    patientId: "pat-sav-patil",
    fromFacilityId: "fac-wai-phc",
    toFacilityId: "fac-nashik-dh",
    fromFacilityName: "Wai Primary Health Centre",
    toFacilityName: "Nashik District Civil Hospital",
    status: "REFERRAL_ACCEPTED",
    priority: "HIGH",
    careLevel: "DISTRICT",
    chiefComplaint: "Acute retrosternal chest pain radiating to left arm with diaphoresis (STEMI). Troponin-I positive at PHC.",
    clinicalNotes: "ECG confirms ST-segment elevation in leads V1-V4 (Anterior Wall MI). Dispatched with loading dose: Tab. Ecosprin 300mg, Tab. Clopidogrel 300mg, Tab. Atorvastatin 80mg. Vitals at dispatch: BP 148/92, HR 102 bpm, SpO2 93% on 2L O2.",
    diagnosticOrders: [
      { name: "12-Lead ECG Confirmation", result: "Extensive Anterior STEMI with Q waves V1-V3", status: "COMPLETED" },
      { name: "Cardiac Biomarkers (Troponin I & CK-MB)", result: "Trop-I: 4.8 ng/mL (Significantly Elevated)", status: "COMPLETED" },
      { name: "Bedside 2D Echocardiography", result: "Anterior wall hypokinesia, LVEF 42%", status: "COMPLETED" }
    ],
    createdAt: "2026-09-05T01:15:00Z",
    updatedAt: "2026-09-05T02:30:00Z"
  },
  {
    _id: "ref-102",
    referralId: "MH-NSK-2026-0892",
    patientId: "pat-ram-jadhav",
    fromFacilityId: "fac-igatpuri-rh",
    toFacilityId: "fac-nashik-dh",
    fromFacilityName: "Igatpuri Rural Sub-District Hospital",
    toFacilityName: "Nashik District Civil Hospital",
    status: "CONSULTATION_COMPLETED",
    priority: "HIGH",
    careLevel: "DISTRICT",
    chiefComplaint: "Right foot deep diabetic ulcer (Wagner Grade 3) with spreading cellulitis and purulent drainage for 10 days.",
    clinicalNotes: "Patient has uncontrolled Type 2 DM (Random Blood Sugar 342 mg/dL). Probe-to-bone test positive. Surgical debridement scheduled. IV broad-spectrum antibiotics initiated.",
    diagnosticOrders: [
      { name: "Foot X-Ray (AP & Lateral)", result: "Soft tissue gas present, early cortical erosion 1st metatarsal (Osteomyelitis)", status: "COMPLETED" },
      { name: "Pus Culture & Sensitivity", result: "Gram-negative bacilli sensitive to Piperacillin-Tazobactam", status: "COMPLETED" },
      { name: "HbA1c & Renal Function Test", result: "HbA1c: 10.8%, Sr. Creatinine: 1.1 mg/dL", status: "COMPLETED" }
    ],
    createdAt: "2026-09-04T18:40:00Z",
    updatedAt: "2026-09-05T02:00:00Z"
  },
  {
    _id: "ref-103",
    referralId: "MH-NSK-2026-0893",
    patientId: "pat-sun-shinde",
    fromFacilityId: "fac-khodala-phc",
    toFacilityId: "fac-nashik-dh",
    fromFacilityName: "Khodala Primary Health Centre",
    toFacilityName: "Nashik District Civil Hospital",
    status: "DIAGNOSTIC_COMPLETED",
    priority: "HIGH",
    careLevel: "DISTRICT",
    chiefComplaint: "Primigravida 34 weeks gestation with severe pre-eclampsia, BP 170/110 mmHg, persistent headache and hyperreflexia.",
    clinicalNotes: "Urine albumin 3+. Loading dose of Magnesium Sulfate (Pritchard regimen - 4g IV + 10g IM) administered at PHC prior to ambulance dispatch. Fetal heart sounds 144 bpm regular.",
    diagnosticOrders: [
      { name: "Urine Protein Dipstick & 24h Protein", result: "Albumin 3+ (420 mg/dL)", status: "COMPLETED" },
      { name: "Obstetric Doppler Ultrasound", result: "Single live intrauterine fetus, 34 weeks, normal amniotic fluid index (AFI 11)", status: "COMPLETED" },
      { name: "Complete Hemogram & Platelet Count", result: "Platelets: 1,65,000 /mcL, Liver enzymes borderline", status: "COMPLETED" }
    ],
    createdAt: "2026-09-04T12:00:00Z",
    updatedAt: "2026-09-05T01:30:00Z"
  },
  {
    _id: "ref-104",
    referralId: "MH-NSK-2026-0894",
    patientId: "pat-ana-more",
    fromFacilityId: "fac-wai-phc",
    toFacilityId: "fac-nashik-dh",
    fromFacilityName: "Wai Primary Health Centre",
    toFacilityName: "Nashik District Civil Hospital",
    status: "REFERRAL_SENT",
    priority: "HIGH",
    careLevel: "DISTRICT",
    chiefComplaint: "Compound fracture right tibia-fibula (Gustilo-Anderson Type II) following road traffic accident on highway.",
    clinicalNotes: "Wound washed with 2L sterile saline, sterile dressing and Thomas splint applied. Tetanus toxoid 0.5ml IM given. Distal pulses (Dorsalis Pedis) palpable.",
    diagnosticOrders: [
      { name: "Right Leg X-Ray (AP & Lateral)", result: "", status: "PENDING" }
    ],
    createdAt: "2026-09-05T02:45:00Z",
    updatedAt: "2026-09-05T02:45:00Z"
  },
  {
    _id: "ref-105",
    referralId: "MH-NSK-2026-0895",
    patientId: "pat-bab-wagh",
    fromFacilityId: "fac-khodala-phc",
    toFacilityId: "fac-nashik-dh",
    fromFacilityName: "Khodala Primary Health Centre",
    toFacilityName: "Nashik District Civil Hospital",
    status: "FOLLOW_UP_REQUIRED",
    priority: "MEDIUM",
    careLevel: "DISTRICT",
    chiefComplaint: "Severe neonatal hyperbilirubinemia, yellowish discoloration extending to palms and soles, poor feeding.",
    clinicalNotes: "Total Serum Bilirubin at admission 19.8 mg/dL. Double surface intensive phototherapy administered for 48 hours. Bilirubin dropped to 11.2 mg/dL. Baby feeding well.",
    diagnosticOrders: [
      { name: "Serum Bilirubin (Total + Direct)", result: "Total: 11.2 mg/dL, Direct: 0.8 mg/dL", status: "COMPLETED" },
      { name: "Blood Group & Coombs Test", result: "Mother O+ve, Baby B+ve, Direct Coombs Negative", status: "COMPLETED" }
    ],
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-05T01:00:00Z"
  },
  {
    _id: "ref-106",
    referralId: "MH-NSK-2026-0896",
    patientId: "pat-dny-borse",
    fromFacilityId: "fac-khodala-phc",
    toFacilityId: "fac-nashik-dh",
    fromFacilityName: "Khodala Primary Health Centre",
    toFacilityName: "Nashik District Civil Hospital",
    status: "CLOSED",
    priority: "MEDIUM",
    careLevel: "PHC",
    chiefComplaint: "Severe acute exacerbation of chronic obstructive pulmonary disease (COPD) with respiratory acidosis.",
    clinicalNotes: "Managed with BiPAP non-invasive ventilation, nebulization, and systemic steroids. Successfully weaned. Re-evaluated at Khodala PHC.",
    closureOutcome: "Patient clinically stabilized, completed 7-day course of inhalers and antibiotics. SpO2 95% on room air. PHC MO Dr. Patil verified follow-up closure.",
    diagnosticOrders: [
      { name: "Arterial Blood Gas (ABG)", result: "pH 7.39, pCO2 44 mmHg, pO2 88 mmHg (Normal compensation)", status: "COMPLETED" },
      { name: "Chest Radiograph PA View", result: "Emphysematous changes, no active pneumonic patch", status: "COMPLETED" }
    ],
    createdAt: "2026-08-28T09:00:00Z",
    updatedAt: "2026-09-04T16:00:00Z"
  }
];

export const DEMO_EVENTS: Record<string, ReferralEvent[]> = {
  "ref-101": [
    {
      event_id: "ev-101-1",
      referral_id: "ref-101",
      event_type: "REFERRAL_CREATED",
      timestamp: "2026-09-05T01:15:00Z",
      performed_by: "Dr. Ramesh Shinde (Wai PHC)",
      new_status: "CREATED",
      notes: "Patient presented with acute onset chest pain, ST elevation observed on ECG."
    },
    {
      event_id: "ev-101-2",
      referral_id: "ref-101",
      event_type: "AI_TRIAGE_COMPLETED",
      timestamp: "2026-09-05T01:16:30Z",
      performed_by: "CareConnect Clinical Protocol Engine",
      previous_status: "CREATED",
      new_status: "TRIAGED",
      notes: "Triage Score: 94/100 (HIGH). STEMI golden hour protocol triggered. Emergency Cath Lab required."
    },
    {
      event_id: "ev-101-3",
      referral_id: "ref-101",
      event_type: "REFERRAL_DISPATCHED",
      timestamp: "2026-09-05T01:20:00Z",
      performed_by: "Wai PHC Ambulance Cell",
      previous_status: "TRIAGED",
      new_status: "REFERRAL_SENT",
      notes: "Dispatched in 108 Advanced Life Support Ambulance with oxygen & defibrillator."
    },
    {
      event_id: "ev-101-4",
      referral_id: "ref-101",
      event_type: "FACILITY_ACCEPTED",
      timestamp: "2026-09-05T01:28:00Z",
      performed_by: "Dr. S. M. Deshmukh (Nashik DH)",
      previous_status: "REFERRAL_SENT",
      new_status: "REFERRAL_ACCEPTED",
      notes: "Inbound case accepted. ICU Bed 4 reserved. Cath Lab standby alerted."
    }
  ],
  "ref-102": [
    {
      event_id: "ev-102-1",
      referral_id: "ref-102",
      event_type: "FACILITY_ACCEPTED",
      timestamp: "2026-09-04T19:00:00Z",
      performed_by: "Nashik DH Emergency Staff",
      new_status: "REFERRAL_ACCEPTED",
      notes: "Accepted from Igatpuri RH for surgical debridement."
    },
    {
      event_id: "ev-102-2",
      referral_id: "ref-102",
      event_type: "PATIENT_ARRIVED",
      timestamp: "2026-09-04T20:15:00Z",
      performed_by: "Triage Desk Sister In-charge",
      previous_status: "REFERRAL_ACCEPTED",
      new_status: "PATIENT_ARRIVED",
      notes: "Patient arrived via private transport. Admitted to Surgical Ward Bed 12."
    },
    {
      event_id: "ev-102-3",
      referral_id: "ref-102",
      event_type: "CONSULTATION_COMPLETED",
      timestamp: "2026-09-05T02:00:00Z",
      performed_by: "Dr. Anita Rao (Senior Surgeon)",
      previous_status: "PATIENT_ARRIVED",
      new_status: "CONSULTATION_COMPLETED",
      notes: "Evaluated by surgical team. Wagner Grade 3 diabetic foot. Debridement planned under ankle block."
    }
  ],
  "ref-103": [
    {
      event_id: "ev-103-1",
      referral_id: "ref-103",
      event_type: "FACILITY_ACCEPTED",
      timestamp: "2026-09-04T12:30:00Z",
      performed_by: "Nashik DH OBGYN Dept",
      new_status: "REFERRAL_ACCEPTED",
      notes: "Pre-eclampsia case accepted. High Dependency Unit (HDU) bed prepared."
    },
    {
      event_id: "ev-103-2",
      referral_id: "ref-103",
      event_type: "PATIENT_ARRIVED",
      timestamp: "2026-09-04T14:10:00Z",
      performed_by: "HDU Staff Nurse",
      new_status: "PATIENT_ARRIVED",
      notes: "Patient admitted. BP on arrival 164/104 mmHg. Labetalol infusion continued."
    },
    {
      event_id: "ev-103-3",
      referral_id: "ref-103",
      event_type: "CONSULTATION_COMPLETED",
      timestamp: "2026-09-04T16:00:00Z",
      performed_by: "Dr. Smita Borse (OBGYN Specialist)",
      new_status: "CONSULTATION_COMPLETED",
      notes: "Consultation completed. Antihypertensives adjusted. Emergency C-section standby if BP refractory."
    },
    {
      event_id: "ev-103-4",
      referral_id: "ref-103",
      event_type: "DIAGNOSTIC_COMPLETED",
      timestamp: "2026-09-05T01:30:00Z",
      performed_by: "Pathology & Radiology Dept",
      new_status: "DIAGNOSTIC_COMPLETED",
      notes: "Ultrasound doppler and 24h urine protein results verified and documented in EHR."
    }
  ],
  "ref-104": [
    {
      event_id: "ev-104-1",
      referral_id: "ref-104",
      event_type: "REFERRAL_SENT",
      timestamp: "2026-09-05T02:45:00Z",
      performed_by: "Dr. Ramesh Shinde (Wai PHC)",
      new_status: "REFERRAL_SENT",
      notes: "Compound fracture post-RTA. Requires urgent orthopedic evaluation."
    }
  ],
  "ref-105": [
    {
      event_id: "ev-105-1",
      referral_id: "ref-105",
      event_type: "FOLLOW_UP_REQUIRED",
      timestamp: "2026-09-05T01:00:00Z",
      performed_by: "Dr. V. P. Sonawane (Pediatrics)",
      new_status: "FOLLOW_UP_REQUIRED",
      notes: "Bilirubin down to 11.2 mg/dL. Discharged with mandatory 48-hour PHC follow-up scheduled."
    }
  ],
  "ref-106": [
    {
      event_id: "ev-106-1",
      referral_id: "ref-106",
      event_type: "FOLLOW_UP_COMPLETED",
      timestamp: "2026-09-04T15:30:00Z",
      performed_by: "Sunita Kamble (ASHA Worker)",
      new_status: "FOLLOW_UP_COMPLETED",
      notes: "Home visit completed. Patient attended Khodala PHC follow-up clinic. Inhaler adherence confirmed."
    },
    {
      event_id: "ev-106-2",
      referral_id: "ref-106",
      event_type: "REFERRAL_CLOSED",
      timestamp: "2026-09-04T16:00:00Z",
      performed_by: "Dr. Jayant Patil (Khodala PHC MO)",
      new_status: "CLOSED",
      notes: "Continuity of care verified. Referral closed in state portal without patient dropout."
    }
  ]
};

export const DEMO_MEDICATION_PLANS: MedicationPlan[] = [
  {
    _id: "plan-101",
    referralId: "ref-101",
    signedOff: true,
    signedOffAt: "2026-09-05T02:15:00Z",
    items: [
      {
        drugName: "Tab. Ticagrelor",
        dosage: "90 mg",
        frequency: "BD (Twice Daily)",
        durationDays: 30,
        instructions: "Take with or after food, do not miss doses",
        status: "ACTIVE"
      },
      {
        drugName: "Tab. Aspirin (Ecosprin)",
        dosage: "75 mg",
        frequency: "OD (Once Daily Morning)",
        durationDays: 30,
        instructions: "Take post breakfast",
        status: "ACTIVE"
      },
      {
        drugName: "Tab. Atorvastatin",
        dosage: "40 mg",
        frequency: "OD (Night)",
        durationDays: 30,
        instructions: "Lipid lowering therapy",
        status: "ACTIVE"
      },
      {
        drugName: "Tab. Metoprolol Succinate",
        dosage: "25 mg",
        frequency: "OD (Morning)",
        durationDays: 14,
        instructions: "Monitor heart rate and blood pressure",
        status: "ACTIVE"
      }
    ]
  },
  {
    _id: "plan-102",
    referralId: "ref-102",
    signedOff: true,
    signedOffAt: "2026-09-05T02:10:00Z",
    items: [
      {
        drugName: "Tab. Amoxicillin + Clavulanate (Augmentin)",
        dosage: "625 mg",
        frequency: "TID (Three Times Daily)",
        durationDays: 10,
        instructions: "Complete full 10-day antibiotic course",
        status: "ACTIVE"
      },
      {
        drugName: "Inj. Human Regular Insulin",
        dosage: "8 Units",
        frequency: "SC TID Before Meals",
        durationDays: 14,
        instructions: "Check capillary blood glucose before administering",
        status: "ACTIVE"
      },
      {
        drugName: "Tab. Cilostazol",
        dosage: "50 mg",
        frequency: "BD",
        durationDays: 30,
        instructions: "To improve peripheral microcirculation",
        status: "ACTIVE"
      }
    ]
  },
  {
    _id: "plan-103",
    referralId: "ref-103",
    signedOff: false,
    items: [
      {
        drugName: "Tab. Labetalol",
        dosage: "100 mg",
        frequency: "TID (Three Times Daily)",
        durationDays: 14,
        instructions: "Maintain target BP < 140/90 mmHg",
        status: "ACTIVE"
      },
      {
        drugName: "Tab. Calcium Carbonate + Vit D3",
        dosage: "500 mg",
        frequency: "BD Post Meals",
        durationDays: 30,
        instructions: "Antenatal supplementation",
        status: "ACTIVE"
      }
    ]
  }
];

export const DEMO_REMINDERS: MedicationReminder[] = [
  {
    _id: "rem-101-1",
    planId: "plan-101",
    referralId: "ref-101",
    scheduledAt: "2026-09-05T08:00:00Z",
    status: "TAKEN"
  },
  {
    _id: "rem-101-2",
    planId: "plan-101",
    referralId: "ref-101",
    scheduledAt: "2026-09-05T20:00:00Z",
    status: "SCHEDULED"
  },
  {
    _id: "rem-102-1",
    planId: "plan-102",
    referralId: "ref-102",
    scheduledAt: "2026-09-05T07:30:00Z",
    status: "TAKEN"
  }
];

export const DEMO_FOLLOW_UPS: FollowUpRecord[] = [
  {
    _id: "fu-103",
    referralId: "ref-103",
    dueDate: "2026-09-08",
    purpose: "Antenatal BP review, proteinuria check, and fetal kick count verification",
    assignedAshaWorker: "Meena Tai Gaikwad (+91 97632 10982)",
    requiredFacilityId: "fac-khodala-phc",
    status: "UPCOMING"
  },
  {
    _id: "fu-105",
    referralId: "ref-105",
    dueDate: "2026-09-06",
    purpose: "Serum bilirubin re-evaluation and neonatal weight check",
    assignedAshaWorker: "Kavita Shinde (+91 94211 44556)",
    requiredFacilityId: "fac-khodala-phc",
    status: "DUE"
  },
  {
    _id: "fu-106",
    referralId: "ref-106",
    dueDate: "2026-09-04",
    purpose: "Post-discharge clinical review and spirometry check",
    assignedAshaWorker: "Sunita Kamble (+91 98900 12345)",
    requiredFacilityId: "fac-khodala-phc",
    status: "COMPLETED",
    completedAt: "2026-09-04T15:30:00Z",
    notes: "Patient visited Khodala PHC. SpO2 95% on room air. Inhaler technique verified."
  }
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "🚨 Inbound STEMI Patient En-Route",
    message: "Savitri Patil (54/F) with Anterior Wall STEMI dispatched from Wai PHC. ETA: 12 minutes. ICU Bed 4 reserved.",
    type: "URGENT",
    timestamp: "10m ago",
    referralId: "ref-101",
    read: false
  },
  {
    id: "notif-2",
    title: "📋 Maternal Follow-up Due",
    message: "Sunita Shinde (Pre-eclampsia) 48h post-discharge check assigned to ASHA Meena Gaikwad.",
    type: "INFO",
    timestamp: "1h ago",
    referralId: "ref-103",
    read: false
  },
  {
    id: "notif-3",
    title: "✅ Referral Loop Closed",
    message: "Dnyaneshwar Borse (COPD Exacerbation) continuity of care completed at Khodala PHC without dropout.",
    type: "SUCCESS",
    timestamp: "2h ago",
    referralId: "ref-106",
    read: true
  },
  {
    id: "notif-4",
    title: "🏥 Nashik DH Bed Utilization Alert",
    message: "ICU bed capacity at Nashik District Hospital is at 75% (4 remaining). Please expedite stabilized discharges.",
    type: "WARNING",
    timestamp: "3h ago",
    read: false
  }
];

export const DEMO_STATS: DashboardStats = {
  totalReferrals: 42,
  activeInTransit: 7,
  closedLoops: 29,
  closureRate: 69.0,
  overdueCount: 2,
  leakageRate: 4.8,
  avgTransferTimeHours: 2.3,
  lostToFollowUp: 1,
  priorityBreakdown: { high: 14, medium: 22, low: 6 },
  careLevelBreakdown: { phc: 18, district: 16, tertiary: 8 },
  facilityPerformance: [
    { facilityId: "fac-nashik-dh", total: 24, closed: 18, closureRate: 75.0 },
    { facilityId: "fac-kem-mumbai", total: 12, closed: 9, closureRate: 75.0 },
    { facilityId: "fac-wai-phc", total: 6, closed: 2, closureRate: 33.3 }
  ]
};

// In-memory state store for fallback operations
class LocalDemoStore {
  facilities: Facility[] = JSON.parse(JSON.stringify(DEMO_FACILITIES));
  referrals: Referral[] = JSON.parse(JSON.stringify(DEMO_REFERRALS));
  events: Record<string, ReferralEvent[]> = JSON.parse(JSON.stringify(DEMO_EVENTS));
  medicationPlans: MedicationPlan[] = JSON.parse(JSON.stringify(DEMO_MEDICATION_PLANS));
  reminders: MedicationReminder[] = JSON.parse(JSON.stringify(DEMO_REMINDERS));
  followUps: FollowUpRecord[] = JSON.parse(JSON.stringify(DEMO_FOLLOW_UPS));
  notifications: Notification[] = JSON.parse(JSON.stringify(DEMO_NOTIFICATIONS));

  getStats(): DashboardStats {
    const total = this.referrals.length;
    const closed = this.referrals.filter(r => r.status === "CLOSED").length;
    const active = this.referrals.filter(r => ["REFERRAL_SENT", "REFERRAL_ACCEPTED", "PATIENT_ARRIVED"].includes(r.status)).length;
    const overdue = this.referrals.filter(r => r.status === "OVERDUE").length;
    const high = this.referrals.filter(r => r.priority === "HIGH").length;
    const medium = this.referrals.filter(r => r.priority === "MEDIUM").length;
    const low = this.referrals.filter(r => r.priority === "LOW").length;

    return {
      totalReferrals: total,
      activeInTransit: active,
      closedLoops: closed,
      closureRate: total > 0 ? Number(((closed / total) * 100).toFixed(1)) : 0,
      overdueCount: overdue,
      leakageRate: 4.8,
      avgTransferTimeHours: 2.3,
      lostToFollowUp: 1,
      priorityBreakdown: { high, medium, low },
      careLevelBreakdown: { phc: 18, district: 16, tertiary: 8 }
    };
  }

  updateReferralStatus(id: string, status: Referral["status"], notes?: string): Referral {
    const r = this.referrals.find(x => x._id === id || x.referralId === id);
    if (!r) throw new Error("Referral not found");
    const prev = r.status;
    r.status = status;
    r.updatedAt = new Date().toISOString();
    if (notes) {
      if (status === "REFERRAL_REJECTED") r.rejectionReason = notes;
      else if (status === "CLOSED") r.closureOutcome = notes;
      else r.clinicalNotes = `${r.clinicalNotes ? r.clinicalNotes + " | " : ""}${notes}`;
    }

    // Allocate / release beds
    if (status === "REFERRAL_ACCEPTED") {
      const fac = this.facilities.find(f => f._id === r.toFacilityId);
      if (fac && fac.icuBedsAvailable && fac.icuBedsAvailable > 0) {
        fac.icuBedsAvailable -= 1;
      }
    }

    if (!this.events[r._id]) this.events[r._id] = [];
    this.events[r._id].unshift({
      event_id: `ev-${Date.now()}`,
      referral_id: r._id,
      event_type: status,
      timestamp: new Date().toISOString(),
      performed_by: "Dr. S. M. Deshmukh (Nashik DH)",
      previous_status: prev,
      new_status: status,
      notes: notes ?? `Status advanced to ${status}`
    });

    return r;
  }
}

export const demoStore = new LocalDemoStore();

export interface ClinicalPreset {
  id: string;
  badge: string;
  patient: Patient;
  symptoms: string;
  triage: TriageResult;
}

export const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: "preset-stemi",
    badge: "STEMI (Golden Hour)",
    patient: {
      _id: "pat-sav-patil",
      patientId: "MH-P-44821",
      name: "Savitri Maruti Patil",
      age: 54,
      gender: "F",
      location: "Wai Taluka, Satara District",
      contact: "+91 98224 55112",
      abhaId: "91-4521-8890-1234"
    },
    symptoms: "Severe crushing retrosternal chest pain for 2 hours, diaphoresis, radiating to left arm and jaw. ST elevation in leads V1-V4 on ECG. BP 148/92 mmHg, HR 102 bpm, SpO2 93%.",
    triage: {
      priority: "HIGH",
      suggestedCareLevel: "DISTRICT",
      relevantServices: ["ICU", "Cardiology", "Emergency", "Cath Lab Standby"],
      reasoning: "Acute Anterior STEMI requires immediate transfer to catheterization-capable district hospital within golden window.",
      recommendedNextAction: "Immediate ambulance dispatch with loading dose: Ecosprin 300mg + Clopidogrel 300mg + Atorvastatin 80mg.",
      caution: "Cardiac arrest risk. Oxygen support and defibrillator monitor mandatory during transport.",
      source: "AI"
    }
  },
  {
    id: "preset-diabetic-ulcer",
    badge: "Diabetic Sepsis",
    patient: {
      _id: "pat-ram-jadhav",
      patientId: "MH-P-33902",
      name: "Ramesh Kisanrao Jadhav",
      age: 62,
      gender: "M",
      location: "Igatpuri, Nashik District",
      contact: "+91 94227 88990",
      abhaId: "91-2314-7761-4456"
    },
    symptoms: "Wagner Grade 3 diabetic foot ulcer with spreading cellulitis, foul purulent drainage, high-grade fever. Random Blood Sugar 342 mg/dL. Probe-to-bone test positive.",
    triage: {
      priority: "HIGH",
      suggestedCareLevel: "DISTRICT",
      relevantServices: ["General Surgery", "Infectious Disease", "Hyperbaric / Wound Care"],
      reasoning: "Deep tissue infection with osteomyelitis in uncontrolled diabetes mellitus carries imminent limb-loss risk.",
      recommendedNextAction: "Surgical consultation for urgent debridement and IV broad-spectrum antibiotic initiation.",
      caution: "Risk of diabetic ketoacidosis and systemic septic shock.",
      source: "AI"
    }
  },
  {
    id: "preset-preeclampsia",
    badge: "Severe Pre-eclampsia",
    patient: {
      _id: "pat-sun-shinde",
      patientId: "MH-P-12889",
      name: "Sunita Ganesh Shinde",
      age: 26,
      gender: "F",
      location: "Khodala, Palghar District",
      contact: "+91 97632 10982",
      abhaId: "91-8890-3341-9921"
    },
    symptoms: "Primigravida 34 weeks gestation with severe headache, visual blurring, scotoma, BP 170/110 mmHg, bilateral pedal edema, urine albumin 3+.",
    triage: {
      priority: "HIGH",
      suggestedCareLevel: "DISTRICT",
      relevantServices: ["Obstetrics & Gynecology", "High Dependency Unit (HDU)", "SNCU / NICU"],
      reasoning: "Imminent eclampsia risk. Requires parenteral magnesium sulfate and urgent specialist obstetric monitoring.",
      recommendedNextAction: "Administer loading dose Magnesium Sulfate (Pritchard regimen) and dispatch in ALS 108 ambulance.",
      caution: "Monitor deep tendon reflexes and respiratory rate for magnesium toxicity.",
      source: "AI"
    }
  }
];

