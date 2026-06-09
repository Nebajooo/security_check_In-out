const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    shift: {
      type: String,
      enum: [
        "Morning (6am-2pm)",
        "Afternoon (2pm-10pm)",
        "Night (10pm-6am)",
        "Admin",
      ],
      default: "Morning (6am-2pm)",
    },
    role: {
      type: String,
      enum: ["security", "manager", "admin"],
      default: "security",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
