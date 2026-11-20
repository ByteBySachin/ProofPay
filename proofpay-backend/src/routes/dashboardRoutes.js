
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDashboardSummary,
  getRecentInvoices,
} = require("../controllers/dashboardController");

const router = express.Router();

// All dashboard endpoints require login.
router.use(authMiddleware);

router.get("/summary", getDashboardSummary);
router.get("/recent-invoices", getRecentInvoices);

module.exports = router;
