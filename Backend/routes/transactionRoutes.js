const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const auth = require("../middleware/auth");

router.use(auth);

// Guest routes (personal equipment)
router.post("/guest/checkin", transactionController.guestCheckIn);
router.post("/guest/checkout", transactionController.guestCheckOut);
router.get("/guest/search", transactionController.searchGuestEquipment);
router.get("/guest/active", transactionController.getActiveGuests);

// Company equipment routes
router.post("/company/out", transactionController.companyEquipmentOut);
router.post("/company/in", transactionController.companyEquipmentIn);
router.get("/company/active", transactionController.getActiveCompanyEquipment);
router.get(
  "/company/overdue",
  transactionController.getOverdueCompanyEquipment,
);
router.post("/company/report", transactionController.reportToManager);

// Dashboard routes
router.get("/statistics", transactionController.getStatistics);
router.get("/recent", transactionController.getRecentActivity);
router.get("/today/checkins", transactionController.getTodayCheckins);
router.get("/today/checkouts", transactionController.getTodayCheckouts);
module.exports = router;
