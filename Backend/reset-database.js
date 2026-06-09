const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Drop the database
    await mongoose.connection.db.dropDatabase();
    console.log("✅ Database dropped successfully");

    const db = mongoose.connection.db;
    const saltRounds = 10;

    // Create users with properly hashed passwords
    const users = [
      {
        name: "Admin User",
        username: "admin",
        password: "admin123",
        shift: "Admin",
        role: "admin",
      },
      {
        name: "Ahmed Hassan",
        username: "ahmed",
        password: "ahmed123",
        shift: "Morning (6am-2pm)",
        role: "security",
      },
      {
        name: "Omar Khalid",
        username: "omar",
        password: "omar123",
        shift: "Afternoon (2pm-10pm)",
        role: "security",
      },
      {
        name: "Sara Mohammed",
        username: "sara",
        password: "sara123",
        shift: "Night (10pm-6am)",
        role: "security",
      },
      {
        name: "Manager User",
        username: "manager",
        password: "manager123",
        shift: "Admin",
        role: "manager",
      },
    ];

    console.log("\n📝 Creating users:");
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      await db.collection("users").insertOne({
        name: user.name,
        username: user.username,
        password: hashedPassword,
        shift: user.shift,
        role: user.role,
        isActive: true,
        createdAt: new Date(),
      });
      console.log(`   ✅ ${user.username} / ${user.password} (${user.role})`);
    }

    // Verify all users work
    console.log("\n🔐 Verifying users:");
    const createdUsers = await db.collection("users").find({}).toArray();

    for (const user of createdUsers) {
      let testPassword = "";
      if (user.username === "admin") testPassword = "admin123";
      else if (user.username === "ahmed") testPassword = "ahmed123";
      else if (user.username === "omar") testPassword = "omar123";
      else if (user.username === "sara") testPassword = "sara123";
      else if (user.username === "manager") testPassword = "manager123";

      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   ${user.username}: ${isValid ? "✅" : "❌"}`);
    }

    console.log("\n✅ Database reset complete!");
    console.log("\n📋 Login Credentials:");
    console.log("   admin / admin123 (Admin)");
    console.log("   ahmed / ahmed123 (Security)");
    console.log("   omar / omar123 (Security)");
    console.log("   sara / sara123 (Security)");
    console.log("   manager / manager123 (Manager)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetDatabase();
