import mongoose from "mongoose";
import { env } from "../config/env";
import { User } from "../models/User";

async function run() {
  try {
    await mongoose.connect(env.mongoUri);
    const user = await User.findOne({ email: "audit_doca@test.com" });
    console.log(user ? "Found user" : "User not found");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
