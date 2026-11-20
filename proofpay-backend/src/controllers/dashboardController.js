const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");

const getDashboardSummary = async (req, res) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.businessId.toString());

    // 1. Invoice aggregation for totals & counts
    const [invoiceAgg] = await Invoice.aggregate([
      {
        $match: {
          businessId,
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: "$totalAmount" },
          invoiceAmountPaid: { $sum: "$amountPaid" },
          outstanding: { $sum: "$balanceDue" },
          invoiceCount: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
          },
          pendingCount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["sent", "draft", "partially_paid"]] },
                1,
                0,
              ],
            },
          },
          overdueCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$balanceDue", 0] },
                    { $ne: ["$dueDate", null] },
                    { $lt: ["$dueDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // 2. Payment aggregation for collected amounts from valid payments only
    // Calculates net collected amount: Completed payments minus any Completed refunds
    const [paymentAgg] = await Payment.aggregate([
      {
        $match: {
          businessId,
          status: "Completed",
        },
      },
      {
        $project: {
          amount: 1,
          completedRefunds: {
            $filter: {
              input: "$refunds",
              as: "ref",
              cond: { $eq: ["$$ref.status", "Completed"] },
            },
          },
        },
      },
      {
        $project: {
          netAmount: {
            $subtract: [
              "$amount",
              { $sum: "$completedRefunds.amount" },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$netAmount" },
          completedPaymentsCount: { $sum: 1 },
        },
      },
    ]);

    // 3. Customer count
    const customerCount = await Customer.countDocuments({ businessId });

    // Determine totalReceived:
    // If payments have been recorded in the Payment collection, use the payment aggregation
    // Otherwise fallback to invoice amountPaid
    let totalReceived = 0;
    if (paymentAgg && paymentAgg.completedPaymentsCount > 0) {
      totalReceived = Math.max(0, paymentAgg.totalCollected);
    } else if (invoiceAgg) {
      totalReceived = invoiceAgg.invoiceAmountPaid || 0;
    }

    const summary = {
      totalInvoiced: invoiceAgg?.totalInvoiced ?? 0,
      totalReceived,
      outstanding: invoiceAgg?.outstanding ?? 0,
      invoiceCount: invoiceAgg?.invoiceCount ?? 0,
      paidCount: invoiceAgg?.paidCount ?? 0,
      pendingCount: invoiceAgg?.pendingCount ?? 0,
      overdueCount: invoiceAgg?.overdueCount ?? 0,
      customerCount,
    };

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard summary",
    });
  }
};

const getRecentInvoices = async (req, res) => {
  try {
    const businessId = req.businessId;

    const invoices = await Invoice.find({
      businessId,
      status: { $ne: "cancelled" },
    })
      .populate("customerId", "name phone email")
      .select(
        "invoiceNumber customerId customerName totalAmount amountPaid balanceDue status dueDate createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formatted = invoices.map((inv) => ({
      ...inv,
      id: inv.invoiceNumber || inv._id.toString(),
      _id: inv._id.toString(),
      customerName: inv.customerId?.name || inv.customerName || "Customer",
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Recent invoices error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load recent invoices",
    });
  }
};

module.exports = {
  getDashboardSummary,
  getRecentInvoices,
};
