import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "CareConnect@2026";

const facilities = [
  {
    key: "sc-sakhare",
    name: "Sub-Centre Sakhare",
    careLevel: "SC",
    taluka: "Jawhar",
    village: "Sakhare",
    latitude: 19.912,
    longitude: 73.226,
    phone: "02520-220101",
    services: "general,maternal,pediatric",
    osmId: "node:sc-sakhare-demo",
  },
  {
    key: "phc-jawhar",
    name: "PHC Jawhar Rural",
    careLevel: "PHC",
    taluka: "Jawhar",
    village: "Jawhar",
    latitude: 19.9167,
    longitude: 73.2267,
    phone: "02520-222345",
    services: "general,maternal,pediatric,lab,ncd,tb",
    osmId: "node:phc-jawhar-demo",
  },
  {
    key: "rh-jawhar",
    name: "Rural Hospital Jawhar",
    careLevel: "RH",
    taluka: "Jawhar",
    village: "Jawhar",
    latitude: 19.921,
    longitude: 73.231,
    phone: "02520-222800",
    services: "general,maternal,pediatric,emergency,lab,ncd,tb",
    osmId: "way:rh-jawhar-demo",
  },
  {
    key: "phc-mokhada",
    name: "PHC Mokhada",
    careLevel: "PHC",
    taluka: "Mokhada",
    village: "Mokhada",
    latitude: 19.933,
    longitude: 73.383,
    phone: "02529-233210",
    services: "general,maternal,pediatric,lab,ncd",
    osmId: "node:phc-mokhada-demo",
  },
  {
    key: "rh-mokhada",
    name: "Rural Hospital Mokhada",
    careLevel: "RH",
    taluka: "Mokhada",
    village: "Mokhada",
    latitude: 19.936,
    longitude: 73.39,
    phone: "02529-233500",
    services: "general,maternal,pediatric,emergency,lab",
    osmId: "way:rh-mokhada-demo",
  },
  {
    key: "phc-dahanu",
    name: "PHC Dahanu",
    careLevel: "PHC",
    taluka: "Dahanu",
    village: "Dahanu",
    latitude: 19.991,
    longitude: 72.739,
    phone: "02528-222110",
    services: "general,maternal,pediatric,lab,ncd,tb",
    osmId: "node:phc-dahanu-demo",
  },
  {
    key: "rh-dahanu",
    name: "Rural Hospital Dahanu",
    careLevel: "RH",
    taluka: "Dahanu",
    village: "Dahanu",
    latitude: 19.99,
    longitude: 72.75,
    phone: "02528-222900",
    services: "general,maternal,pediatric,emergency,lab,imaging",
    osmId: "way:rh-dahanu-demo",
  },
  {
    key: "sdh-palghar",
    name: "Sub-District Hospital Palghar",
    careLevel: "SDH",
    taluka: "Palghar",
    village: "Palghar",
    latitude: 19.6967,
    longitude: 72.7696,
    phone: "02525-252800",
    services: "general,maternal,pediatric,emergency,lab,imaging,ncd,tb,surgery",
    osmId: "way:sdh-palghar-demo",
  },
  {
    key: "dh-palghar",
    name: "District Hospital Palghar",
    careLevel: "DH",
    taluka: "Palghar",
    village: "Palghar",
    latitude: 19.701,
    longitude: 72.775,
    phone: "02525-256100",
    services: "general,maternal,pediatric,emergency,lab,imaging,ncd,tb,mental,surgery",
    osmId: "way:dh-palghar-demo",
  },
  {
    key: "sc-kasa",
    name: "Sub-Centre Kasa",
    careLevel: "SC",
    taluka: "Dahanu",
    village: "Kasa",
    latitude: 20.02,
    longitude: 72.86,
    phone: "02528-228101",
    services: "general,maternal,pediatric",
    osmId: "node:sc-kasa-demo",
  },
];

async function main() {
  await prisma.referralEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const facilityRows: Record<string, { id: string }> = {};

  for (const f of facilities) {
    const row = await prisma.facility.create({
      data: {
        name: f.name,
        careLevel: f.careLevel,
        taluka: f.taluka,
        village: f.village,
        latitude: f.latitude,
        longitude: f.longitude,
        phone: f.phone,
        services: f.services,
        osmId: f.osmId,
        isPublic: true,
        isSynthetic: true,
      },
    });
    facilityRows[f.key] = row;
  }

  const aasha = await prisma.user.create({
    data: {
      username: "aasha.jawhar",
      passwordHash,
      fullName: "Sunita Waghmare",
      role: "HEALTH_WORKER",
      locale: "mr",
      phone: "9876500001",
      village: "Sakhare",
      facilityId: facilityRows["sc-sakhare"].id,
      isSynthetic: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      username: "staff.rhjawhar",
      passwordHash,
      fullName: "Dr. Nitin Patil",
      role: "FACILITY_STAFF",
      locale: "en",
      phone: "9876500002",
      village: "Jawhar",
      facilityId: facilityRows["rh-jawhar"].id,
      isSynthetic: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: "admin.palghar",
      passwordHash,
      fullName: "District Coordinator Deshmukh",
      role: "ADMIN",
      locale: "en",
      phone: "9876500003",
      village: "Palghar",
      facilityId: facilityRows["dh-palghar"].id,
      isSynthetic: true,
    },
  });

  const savitriUser = await prisma.user.create({
    data: {
      username: "patient.savitri",
      passwordHash,
      fullName: "Savitri Bhoye",
      role: "PATIENT",
      locale: "mr",
      phone: "9876500101",
      village: "Sakhare",
      isSynthetic: true,
    },
  });

  const savitri = await prisma.patient.create({
    data: {
      healthId: "PLG-100001",
      fullName: "Savitri Bhoye",
      age: 28,
      sex: "female",
      phone: "9876500101",
      village: "Sakhare",
      taluka: "Jawhar",
      district: "Palghar",
      latitude: 19.91,
      longitude: 73.22,
      caregiverName: "Ramesh Bhoye",
      registeredById: aasha.id,
      accountUserId: savitriUser.id,
      isSynthetic: true,
    },
  });

  const ramesh = await prisma.patient.create({
    data: {
      healthId: "PLG-100002",
      fullName: "Ramesh Ghatal",
      age: 54,
      sex: "male",
      phone: "9876500102",
      village: "Mokhada",
      taluka: "Mokhada",
      district: "Palghar",
      latitude: 19.93,
      longitude: 73.38,
      registeredById: aasha.id,
      isSynthetic: true,
    },
  });

  const baby = await prisma.patient.create({
    data: {
      healthId: "PLG-100003",
      fullName: "Aarti Dhodi",
      age: 2,
      sex: "female",
      village: "Kasa",
      taluka: "Dahanu",
      district: "Palghar",
      latitude: 20.02,
      longitude: 72.86,
      caregiverName: "Laxmi Dhodi",
      registeredById: aasha.id,
      isSynthetic: true,
    },
  });

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const closed = await prisma.referral.create({
    data: {
      publicId: "MH-PLG-260820-SAVI",
      patientId: savitri.id,
      createdById: aasha.id,
      fromFacilityId: facilityRows["sc-sakhare"].id,
      toFacilityId: facilityRows["rh-jawhar"].id,
      status: "CLOSED",
      priority: "URGENT",
      requiredService: "maternal",
      chiefComplaint: "Bleeding in late pregnancy and dizziness after walking from the field.",
      dangerSigns: "pregnancyBleed",
      triageRationale:
        "Priority URGENT only. Pregnancy bleeding is a danger sign needing Rural Hospital obstetric care. This is not a diagnosis.",
      recommendedLevel: "RH",
      appointmentAt: daysAgo(10),
      consultationNotes: "Obstetric assessment completed at RH Jawhar. Stabilised. Synthetic note.",
      diagnosticsNotes: "Hb and ultrasound completed at RH lab. Synthetic note.",
      followUpNotes: "ASHA visited Sakhare on day 5. Patient recovering. Synthetic note.",
      closureNotes: "Care journey completed. Referral closed after follow-up in village.",
      closedAt: daysAgo(2),
      dueAt: daysAgo(5),
      isSynthetic: true,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(2),
    },
  });

  const closedEvents: Array<[string | null, string, string, number]> = [
    [null, "CREATED", "First contact at Sub-Centre Sakhare by ASHA Sunita.", 12],
    ["CREATED", "TRIAGED", "Priority URGENT. No diagnosis issued.", 12],
    ["TRIAGED", "REFERRED", "Referred to Rural Hospital Jawhar for obstetric-capable care.", 12],
    ["REFERRED", "APPOINTMENT", "Same-day queue slot at RH Jawhar maternity.", 11],
    ["APPOINTMENT", "CONSULTATION", "Clinician consultation completed.", 10],
    ["CONSULTATION", "FOLLOW_UP", "Village follow-up scheduled with ASHA.", 7],
    ["FOLLOW_UP", "CLOSED", "Journey completed. Continuity confirmed.", 2],
  ];
  for (const [from, to, note, ago] of closedEvents) {
    await prisma.referralEvent.create({
      data: {
        referralId: closed.id,
        fromStatus: from,
        toStatus: to,
        actorName: aasha.fullName,
        note,
        createdAt: daysAgo(ago),
      },
    });
  }

  await prisma.referral.create({
    data: {
      publicId: "MH-PLG-260901-RAMA",
      patientId: ramesh.id,
      createdById: aasha.id,
      fromFacilityId: facilityRows["phc-mokhada"].id,
      toFacilityId: facilityRows["sdh-palghar"].id,
      status: "CONSULTATION",
      priority: "ROUTINE",
      requiredService: "ncd",
      chiefComplaint: "Swelling in feet and tiredness for two weeks. Needs NCD clinic.",
      dangerSigns: "",
      triageRationale: "Priority ROUTINE. Needs PHC/SDH NCD clinic. Not a diagnosis.",
      recommendedLevel: "SDH",
      appointmentAt: daysAgo(1),
      consultationNotes: "Consultation started at SDH Palghar. Lab pending. Synthetic.",
      isSynthetic: true,
      createdAt: daysAgo(4),
    },
  });

  await prisma.referral.create({
    data: {
      publicId: "MH-PLG-260828-AART",
      patientId: baby.id,
      createdById: aasha.id,
      fromFacilityId: facilityRows["sc-kasa"].id,
      toFacilityId: facilityRows["rh-dahanu"].id,
      status: "REFERRED",
      priority: "URGENT",
      requiredService: "pediatric",
      chiefComplaint: "Child not drinking, very sleepy after two days of fever.",
      dangerSigns: "highFever,dehydration",
      triageRationale: "Priority URGENT due to danger signs in under-5. Not a diagnosis.",
      recommendedLevel: "RH",
      dueAt: daysAgo(1),
      isSynthetic: true,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(5),
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: aasha.id,
        action: "SEED",
        entity: "System",
        detail: "Synthetic Palghar/Jawhar/Mokhada/Dahanu demo loaded",
      },
      {
        userId: admin.id,
        action: "SEED",
        entity: "User",
        entityId: admin.id,
        detail: "District admin created",
      },
      {
        userId: staff.id,
        action: "SEED",
        entity: "User",
        entityId: staff.id,
        detail: "RH Jawhar staff created",
      },
    ],
  });

  console.log("Seeded CareConnect Maharashtra synthetic demo.");
  console.log("Password for all demo users:", DEMO_PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
