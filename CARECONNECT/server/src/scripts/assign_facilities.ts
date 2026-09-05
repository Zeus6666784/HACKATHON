import mongoose from "mongoose";
import { env } from "../config/env";
import { Facility } from "../models/Facility";
import { User } from "../models/User";

async function run() {
  try {
    await mongoose.connect(env.mongoUri);
    
    const facilities = await Facility.find().limit(2);
    if (facilities.length < 2) {
      console.error("Need at least 2 facilities");
      process.exit(1);
    }

    const res1 = await User.updateOne({ email: "audit_doca@test.com" }, { facilityId: facilities[0]._id });
    const res2 = await User.updateOne({ email: "audit_docb@test.com" }, { facilityId: facilities[1]._id });
    const res3 = await User.updateOne({ email: "audit_staff@test.com" }, { facilityId: facilities[0]._id });

    console.log(`Updated: ${res1.modifiedCount}, ${res2.modifiedCount}, ${res3.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
