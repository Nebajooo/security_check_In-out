const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id, name, role) => {
  return jwt.sign({ id, name, role }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("\n========== LOGIN ATTEMPT ==========");
    console.log("Username:", username);

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await User.findOne({
      username: username.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      console.log("Sorry User not found:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log(" User found:", user.username);

    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password match:", isValid);

    if (!isValid) {
      console.log(" Invalid password");
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("Login successful");

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.name, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        shift: user.shift,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    console.log("📋 Fetching all users...");
    const users = await User.find({ isActive: true }).select(
      "name shift role username _id",
    );

    console.log(`✅ Found ${users.length} users`);
    console.log(
      "Users:",
      users.map((u) => u.username),
    );

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};
