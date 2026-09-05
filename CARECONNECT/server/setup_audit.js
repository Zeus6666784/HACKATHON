const mongoose = require('mongoose');
const { env } = require('./CARECONNECT/server/src/config/env');
const { Facility } = require('./CARECONNECT/server/src/models/Facility');
const { User } = require('./CARECONNECT/server/src/models/User');

async function run() {
  try {
    await mongoose.connect(env.mongoUri);
    
    const f1 = await Facility.create({
      name: "Facility A",
      type: "PHC",
      coordinates: [0, 0],
      services: ["General"],
      emergencyCapability: false,
      verificationState: "VERIFIED"
    });
    const f2 = await Facility.create({
      name: "Facility B",
      type: "DISTRICT",
      coordinates: [1, 1],
      services: ["General"],
      emergencyCapability: true,
      verificationState: "VERIFIED"
    });

    // We need the password hash for the users
    const bcrypt = require('bcryptjs');
    const password = await bcrypt.hash("password123", 12);

    const u1 = await User.create({
      email: "docA@test.com",
      password,
      name: "Doctor A",
      role: "DOCTOR",
      facilityId: f1._id
    });
    const u2 = await User.create({
      email: "docB@test.com",
      password,
      name: "Doctor B",
      role: "DOCTOR",
      facilityId: f2._id
    });
    const u3 = await User.create({
      email: "staff@test.com",
      password,
      name: "Staff User",
      role: "FACILITY_STAFF",
      facilityId: f1._id
    });

    console.log(JSON.stringify({
      facilities: { f1: f1._id, f2: f2._id },
      users: { docA: u1.email, docB: u2.email, staff: u3.email }
    }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
