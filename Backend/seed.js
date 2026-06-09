const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SecurityGuard = require("./models/SecurityGuard");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing guards (optional - be careful in production!)
    // await SecurityGuard.deleteMany({});

    // Check if admin exists
    let adminExists = await SecurityGuard.findOne({ username: "admin" });
    if (!adminExists) {
      // Hash password manually to be sure
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await SecurityGuard.create({
        name: "System Administrator",
        username: "admin",
        password: hashedPassword,
        shift: "Admin",
        role: "admin",
        isActive: true,
      });
      console.log("✅ Admin user created: username: admin, password: admin123");
    } else {
      console.log("⚠️ Admin user already exists");
    }

    // Create sample security guards if none exist
    const guardCount = await SecurityGuard.countDocuments({ role: "security" });
    if (guardCount === 0) {
      const guards = [
        {
          name: "Ahmed Hassan",
          username: "ahmed",
          password: await bcrypt.hash("ahmed123", 10),
          shift: "Morning (6am-2pm)",
          role: "security",
          isActive: true,
        },
        {
          name: "Abebe Kebede",
          username: "Abebe",
          password: await bcrypt.hash("abebe123", 10),
          shift: "Afternoon (2pm-10pm)",
          role: "security",
          isActive: true,
        },
        {
          name: "Sara chane",
          username: "sara",
          password: await bcrypt.hash("sara123", 10),
          shift: "Night (10pm-6am)",
          role: "security",
          isActive: true,
        },
      ];

      await SecurityGuard.insertMany(guards);
      console.log("✅ Sample security guards created");
      console.log("   Usernames: ahmed, abebe, sara");
      console.log("   Passwords: ahmed123, abebe123, sara123");
    } else {
      console.log(`⚠️ ${guardCount} security guards already exist`);
    }

    // Verify users were created correctly
    const allUsers = await SecurityGuard.find({}).select("username role");
    console.log("\n📋 Current users in database:");
    allUsers.forEach((user) => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
