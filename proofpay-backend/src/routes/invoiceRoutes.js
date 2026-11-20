const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getInvoices,
  createInvoice,
  getInvoiceById,
  deleteInvoice,
} = require("../controllers/invoiceController");

router.use(authMiddleware);

router.get("/", getInvoices);
router.post("/", createInvoice);
router.get("/:id", getInvoiceById);
router.delete("/:id", deleteInvoice);

module.exports = router;
