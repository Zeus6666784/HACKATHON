
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { spawn } from 'child_process';
import { Facility } from './src/models/Facility';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Referral } from './src/models/Referral';
import { env } from './src/config/env';

async function runTest() {
  let serverProcess: any;
  try {
    // 1. Start Server
    console.log('Starting server...');
    serverProcess = spawn('D:/HACKATHON/CARECONNECT/server/node_modules/.bin/tsx.cmd', ['src/index.ts'], {
      cwd: 'D:/HACKATHON/CARECONNECT/server',
      shell: true,
      env: { ...process.env, PORT: '5000', JWT_SECRET: 'test_secret', MONGODB_URI: 'mongodb://localhost:27017/careconnect' }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server]: ${data}`);
    });
    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error]: ${data}`);
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 2. Setup MongoDB (local)
    await mongoose.connect('mongodb://localhost:27017/careconnect');
    console.log('Connected to MongoDB');

    await Facility.deleteMany({});
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Referral.deleteMany({});

    const facilityA = await Facility.create({
      name: 'Facility A',
      type: 'PHC',
      coordinates: [0, 0],
      services: ['General']
    });
    const facilityB = await Facility.create({
      name: 'Facility B',
      type: 'TERTIARY',
      coordinates: [1, 1],
      services: ['Specialist']
    });

    const userA = await User.create({
      name: 'User A',
      email: 'userA@test.com',
      password: 'hashed_password',
      role: 'DOCTOR',
      facilityId: facilityA._id
    });

    const patientB = await Patient.create({
      patientId: 'P123',
      name: 'Patient B',
      age: 30,
      gender: 'M',
      location: 'City B',
      facilityId: facilityB._id,
      coordinates: [1, 1]
    });

    const referralB = await Referral.create({
      referralId: 'R123',
      patientId: patientB._id,
      fromFacilityId: facilityA._id,
      toFacilityId: facilityB._id,
      status: 'REFERRAL_ACCEPTED',
      priority: 'HIGH',
      careLevel: 'TERTIARY'
    });

    console.log('Test data seeded.');

    // 3. Generate Token for User A
    const token = jwt.sign(
      { id: userA._id.toString(), facilityId: userA.facilityId.toString(), role: userA.role },
      'test_secret'
    );
    console.log(`Sending token: ${token}`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const results = [];

    // Test 1: Close referral from different facility
    const res1 = await fetch(`http://localhost:5000/api/v1/referrals/${referralB._id}/close`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ closureNotes: 'Trying to close someone else\'s referral' })
    });
    results.push({ test: 'Close Referral', status: res1.status === 403 ? 'PASS' : 'FAIL', code: res1.status });

    // Test 2: Triage patient from different facility
    const res2 = await fetch(`http://localhost:5000/api/v1/triage/assess`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId: patientB._id,
        symptoms: 'Severe chest pain'
      })
    });
    results.push({ test: 'Triage Patient', status: res2.status === 403 ? 'PASS' : 'FAIL', code: res2.status });

    // Test 3: Rank patient from different facility
    const res3 = await fetch(`http://localhost:5000/api/v1/facilities/rank?patientId=${patientB._id}`, {
      method: 'GET',
      headers
    });
    results.push({ test: 'Rank Patient', status: res3.status === 403 ? 'PASS' : 'FAIL', code: res3.status });

    console.table(results);

    const allPassed = results.every(r => r.status === 'PASS');
    if (!allPassed) {
      process.exit(1);
    }

  } catch (error) {
    console.error('Test Error:', error);
    process.exit(1);
  } finally {
    if (serverProcess) serverProcess.kill();
    await mongoose.disconnect();
  }
}

runTest();
