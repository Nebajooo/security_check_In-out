const Transaction = require("../models/Transaction");

const generateTransactionNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Transaction.countDocuments({
    timestamp: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
  });
  const sequence = (count + 1).toString().padStart(4, "0");
  return `${dateStr}-${sequence}`;
};

// ============ GUEST PERSONAL EQUIPMENT ============
// Guest brings equipment INTO hotel (REGISTER at entry)
exports.guestCheckIn = async (req, res) => {
  try {
    const {
      equipmentName,
      quantity,
      brand,
      serialNumber,
      description,
      guestName,
      guestId,
      roomNumber,
      nationality,
      condition,
      notes,
    } = req.body;

    const transactionNumber = await generateTransactionNumber();

    const transaction = new Transaction({
      transactionNumber,
      transactionType: "guest_personal",
      equipmentName,
      quantity: quantity || 1,
      brand,
      serialNumber,
      description,
      guestName,
      guestId,
      roomNumber,
      nationality,
      direction: "IN", // Entering hotel
      securityName: req.user.name,
      securityId: req.user.id,
      condition: condition || "Good",
      notes,
      status: "active",
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: `Equipment registered for ${guestName} (Room ${roomNumber})`,
      transaction,
    });
  } catch (error) {
    console.error("Guest check-in error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Guest takes equipment OUT of hotel (VERIFY before allowing exit)
exports.guestCheckOut = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Equipment not found in registry",
        action: "REJECT",
      });
    }

    if (transaction.direction === "OUT") {
      return res.status(400).json({
        success: false,
        error: "Equipment already checked out",
        action: "REJECT",
      });
    }

    // Mark as checked out
    transaction.direction = "OUT";
    transaction.status = "returned";
    await transaction.save();

    res.json({
      success: true,
      message: `Equipment verified and released for ${transaction.guestName}`,
      transaction,
      action: "ALLOW_EXIT",
    });
  } catch (error) {
    console.error("Guest checkout error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Search guest equipment by name or room
exports.searchGuestEquipment = async (req, res) => {
  try {
    const { query } = req.query;

    const results = await Transaction.find({
      transactionType: "guest_personal",
      direction: "IN", // Still inside hotel
      status: "active",
      $or: [
        { guestName: { $regex: query, $options: "i" } },
        { roomNumber: { $regex: query, $options: "i" } },
        { equipmentName: { $regex: query, $options: "i" } },
        { serialNumber: { $regex: query, $options: "i" } },
      ],
    }).sort({ timestamp: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ COMPANY EQUIPMENT ============
// Staff takes company equipment OUT of hotel (MUST register first)
exports.companyEquipmentOut = async (req, res) => {
  try {
    const {
      equipmentName,
      quantity,
      brand,
      serialNumber,
      description,
      staffName,
      staffDepartment,
      staffEmployeeId,
      purpose,
      expectedReturnTime,
      condition,
      notes,
    } = req.body;

    const transactionNumber = await generateTransactionNumber();

    const transaction = new Transaction({
      transactionNumber,
      transactionType: "company_equipment",
      equipmentName,
      quantity: quantity || 1,
      brand,
      serialNumber,
      description,
      staffName,
      staffDepartment,
      staffEmployeeId,
      purpose,
      expectedReturnTime,
      direction: "OUT", // Leaving hotel
      securityName: req.user.name,
      securityId: req.user.id,
      condition: condition || "Good",
      notes,
      status: "active",
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: `Company equipment checked out to ${staffName}`,
      transaction,
    });
  } catch (error) {
    console.error("Company equipment out error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Staff returns company equipment INTO hotel
exports.companyEquipmentIn = async (req, res) => {
  try {
    const { transactionId, condition, notes } = req.body;

    const outTransaction = await Transaction.findById(transactionId);

    if (!outTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (outTransaction.isReturned) {
      return res.status(400).json({ error: "Equipment already returned" });
    }

    // Mark as returned
    outTransaction.isReturned = true;
    outTransaction.status = "returned";
    outTransaction.condition = condition || outTransaction.condition;
    outTransaction.notes = notes || outTransaction.notes;
    await outTransaction.save();

    res.json({
      success: true,
      message: `Company equipment returned by ${outTransaction.staffName}`,
      transaction: outTransaction,
    });
  } catch (error) {
    console.error("Company equipment in error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all active company equipment (not yet returned)
exports.getActiveCompanyEquipment = async (req, res) => {
  try {
    const active = await Transaction.find({
      transactionType: "company_equipment",
      isReturned: false,
      direction: "OUT",
    }).sort({ expectedReturnTime: 1 });

    res.json(active);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get overdue company equipment
exports.getOverdueCompanyEquipment = async (req, res) => {
  try {
    const overdue = await Transaction.find({
      transactionType: "company_equipment",
      isReturned: false,
      direction: "OUT",
      expectedReturnTime: { $lt: new Date() },
    }).sort({ expectedReturnTime: 1 });

    res.json(overdue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Report overdue equipment to manager
exports.reportToManager = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transaction.reportedToManager = true;
    transaction.reportDate = new Date();
    transaction.status = "reported";
    await transaction.save();

    res.json({
      success: true,
      message: `Reported to manager: ${transaction.equipmentName} taken by ${transaction.staffName}`,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ DASHBOARD STATISTICS ============
exports.getStatistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      guestsInside,
      guestsCheckedOutToday,
      companyOut,
      companyOverdue,
      companyReturnedToday,
    ] = await Promise.all([
      // Guests with equipment still inside hotel
      Transaction.countDocuments({
        transactionType: "guest_personal",
        direction: "IN",
        status: "active",
      }),
      // Guests who checked out today
      Transaction.countDocuments({
        transactionType: "guest_personal",
        direction: "OUT",
        timestamp: { $gte: today },
      }),
      // Company equipment currently out
      Transaction.countDocuments({
        transactionType: "company_equipment",
        isReturned: false,
        direction: "OUT",
      }),
      // Overdue company equipment
      Transaction.countDocuments({
        transactionType: "company_equipment",
        isReturned: false,
        direction: "OUT",
        expectedReturnTime: { $lt: new Date() },
      }),
      // Company equipment returned today
      Transaction.countDocuments({
        transactionType: "company_equipment",
        isReturned: true,
        timestamp: { $gte: today },
      }),
    ]);

    res.json({
      guestsInside,
      guestsCheckedOutToday,
      companyOut,
      companyOverdue,
      companyReturnedToday,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all active guest equipment (inside hotel)
exports.getActiveGuests = async (req, res) => {
  try {
    const guests = await Transaction.find({
      transactionType: "guest_personal",
      direction: "IN",
      status: "active",
    }).sort({ timestamp: -1 });

    res.json(guests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get today's check-ins (all equipment that came IN today)
exports.getTodayCheckins = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkins = await Transaction.find({
      direction: "IN",
      timestamp: { $gte: today, $lt: tomorrow },
    }).sort({ timestamp: -1 });

    res.json(checkins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get today's check-outs (all equipment that went OUT today)
exports.getTodayCheckouts = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkouts = await Transaction.find({
      direction: "OUT",
      timestamp: { $gte: today, $lt: tomorrow },
    }).sort({ timestamp: -1 });

    res.json(checkouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
