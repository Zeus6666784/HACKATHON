import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { Facility } from "../models/Facility";
import { User } from "../models/User";
import { Patient } from "../models/Patient";

async function seed() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB for seeding...");

    await Facility.deleteMany({});
    await User.deleteMany({});
    await Patient.deleteMany({});

    console.log("Cleaning database...");

    const facilities = await Facility.insertMany([
      {
        name: "Rural PHC, Palghar",
        type: "PHC",
        coordinates: [72.8, 19.6],
        services: ["General Medicine", "Vaccination"],
        emergencyCapability: false,
        verificationState: "VERIFIED"
      },
      {
        name: "District Hospital, Palghar",
        type: "DISTRICT",
        coordinates: [72.9, 19.7],
        services: ["General Medicine", "Pediatrics", "Surgery"],
        emergencyCapability: true,
        verificationState: "VERIFIED"
      },
      {
        name: "Super Specialty, Mumbai",
        type: "TERTIARY",
        coordinates: [72.8, 19.0],
        services: ["Cardiology", "Neurology", "Oncology", "Emergency"],
        emergencyCapability: true,
        verificationState: "VERIFIED"
      }
    ]);

    console.log("Facilities seeded...");

    const password = await bcrypt.hash("password123", 12);

    await User.insertMany([
      {
        email: "admin@careconnect.gov",
        password,
        name: "System Admin",
        role: "ADMIN"
      },
      {
        email: "hw1@phc.gov",
        password,
        name: "Health Worker 1",
        role: "HEALTH_WORKER",
        facilityId: facilities[0]._id
      },
      {
        email: "doc1@district.gov",
        password,
        name: "Doctor 1",
        role: "DOCTOR",
        facilityId: facilities[1]._id
      }
    ]);

    console.log("Users seeded...");

    await Patient.insertMany([
      {
        patientId: "PAT001",
        name: "Rajesh Kumar",
        age: 45,
        gender: "M",
        location: "Palghar Village",
        coordinates: [72.81, 19.61],
        facilityId: facilities[0]._id
      },
      {
        patientId: "PAT002",
        name: "Sita Devi",
        age: 30,
        gender: "F",
        location: "Palghar Town",
        coordinates: [72.85, 19.65],
        facilityId: facilities[0]._id
      }
    ]);

    console.log("Patients seeded...");
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
