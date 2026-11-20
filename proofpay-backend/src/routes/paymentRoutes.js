const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getPayments,
  createPayment,
  refundPayment,
} = require("../controllers/paymentController");

router.use(authMiddleware);

router.get("/", getPayments);
router.post("/", createPayment);
router.post("/:id/refund", refundPayment);

module.exports = router;
