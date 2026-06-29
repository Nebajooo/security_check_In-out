const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      unique: true,
      required: true,
    },

    transactionType: {
      type: String,
      enum: ["guest_personal", "company_equipment"],
      required: true,
    },

    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    brand: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    photos: [
      {
        type: String,
      },
    ],

    // Guest Personal Equipment (when guest brings items IN)
    guestName: {
      type: String,
      trim: true,
    },
    guestId: {
      type: String,
      trim: true,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },

    // Company Equipment (when staff takes items OUT)
    staffName: {
      type: String,
      trim: true,
    },
    staffDepartment: {
      type: String,
      trim: true,
    },
    staffEmployeeId: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
    expectedReturnTime: {
      type: Date,
    },

    direction: {
      type: String,
      enum: ["IN", "OUT"], // IN = entering hotel, OUT = leaving hotel
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },

    // For company equipment tracking (linking OUT and IN)
    outTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    isReturned: {
      type: Boolean,
      default: false,
    },

    securityName: {
      type: String,
      required: true,
    },
    securityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["active", "returned", "reported", "rejected"],
      default: "active",
    },
    condition: {
      type: String,
      enum: ["Good", "Damaged"],
      default: "Good",
    },
    notes: {
      type: String,
      trim: true,
    },

    reportedToManager: {
      type: Boolean,
      default: false,
    },
    reportDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast searching
transactionSchema.index({ guestName: "text", guestId: "text" });
transactionSchema.index({ equipmentName: "text", serialNumber: "text" });
transactionSchema.index({ transactionNumber: 1 });
transactionSchema.index({ direction: 1, transactionType: 1 });
transactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
