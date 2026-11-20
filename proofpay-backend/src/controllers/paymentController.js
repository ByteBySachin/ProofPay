const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

// GET /api/payments
const getPayments = async (req, res) => {
  try {
    const businessId = req.businessId;

    const payments = await Payment.find({ businessId })
      .populate("invoiceId", "invoiceNumber totalAmount balanceDue amountPaid status dueDate")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const formatted = payments.map((p) => {
      const invoiceNum = p.invoiceId?.invoiceNumber || (p.invoiceId ? p.invoiceId.toString() : "—");
      return {
        ...p,
        id: p._id.toString(),
        _id: p._id.toString(),
        invoiceNumber: invoiceNum,
        customer: p.customerName || "Customer",
        customerName: p.customerName || "Customer",
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payments",
    });
  }
};

// POST /api/payments
const createPayment = async (req, res) => {
  try {
    const businessId = req.businessId;
    const {
      invoiceId,
      amount,
      date,
      method = "UPI",
      reference = "",
      notes = "",
      status = "Completed",
    } = req.body;

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero",
      });
    }

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    // Locate invoice by ObjectId or invoiceNumber
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(invoiceId);
    const invoiceQuery = isObjectId
      ? { _id: invoiceId, businessId }
      : { invoiceNumber: invoiceId, businessId };

    const invoice = await Invoice.findOne(invoiceQuery);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found for this business",
      });
    }

    if (paymentAmount > invoice.balanceDue) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${paymentAmount}) exceeds invoice balance due (${invoice.balanceDue})`,
      });
    }

    const userName = req.user?.name || "Business User";
    const paymentDate = date ? new Date(date) : new Date();

    const payment = await Payment.create({
      businessId,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount: paymentAmount,
      date: paymentDate,
      method,
      status,
      reference: reference.trim(),
      notes: notes.trim(),
      createdBy: userName,
      audit: [
        {
          action: `Payment recorded as ${status}`,
          by: userName,
          at: new Date(),
        },
      ],
    });

    // Update invoice if payment is Completed
    if (status === "Completed") {
      invoice.amountPaid = Math.round(((invoice.amountPaid || 0) + paymentAmount) * 100) / 100;
      invoice.balanceDue = Math.max(0, Math.round((invoice.totalAmount - invoice.amountPaid) * 100) / 100);
      invoice.status = invoice.balanceDue <= 0 ? "paid" : "partially_paid";
      await invoice.save();
    }

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        ...payment.toObject(),
        id: payment._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customerName,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to record payment",
    });
  }
};

// POST /api/payments/:id/refund
const refundPayment = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;
    const { amount, date, reason = "" } = req.body;

    const refundAmount = Number(amount);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Refund amount must be greater than zero",
      });
    }

    const payment = await Payment.findOne({ _id: id, businessId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const completedRefundsTotal = (payment.refunds || [])
      .filter((r) => r.status === "Completed")
      .reduce((sum, r) => sum + r.amount, 0);

    const netPaid = Math.max(0, payment.amount - completedRefundsTotal);
    if (refundAmount > netPaid) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (${refundAmount}) exceeds net paid balance (${netPaid})`,
      });
    }

    const userName = req.user?.name || "Business User";

    payment.refunds.push({
      amount: refundAmount,
      date: date ? new Date(date) : new Date(),
      reason: reason.trim(),
      status: "Completed",
      createdBy: userName,
      createdAt: new Date(),
    });

    const newCompletedTotal = completedRefundsTotal + refundAmount;
    if (newCompletedTotal >= payment.amount) {
      payment.status = "Refunded";
    }

    payment.audit.push({
      action: `Refund completed: ${refundAmount}`,
      by: userName,
      at: new Date(),
    });

    await payment.save();

    // Adjust corresponding invoice
    const invoice = await Invoice.findOne({ _id: payment.invoiceId, businessId });
    if (invoice) {
      invoice.amountPaid = Math.max(0, Math.round(((invoice.amountPaid || 0) - refundAmount) * 100) / 100);
      invoice.balanceDue = Math.round((invoice.totalAmount - invoice.amountPaid) * 100) / 100;
      invoice.status = invoice.amountPaid <= 0 ? "sent" : "partially_paid";
      await invoice.save();
    }

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process refund",
    });
  }
};

module.exports = {
  getPayments,
  createPayment,
  refundPayment,
};
