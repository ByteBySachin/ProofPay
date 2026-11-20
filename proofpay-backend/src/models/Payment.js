const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed", "Cancelled"],
      default: "Pending",
    },
    createdBy: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const auditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    by: {
      type: String,
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ["UPI", "Cash", "Bank transfer", "Card", "Cheque", "Other"],
      default: "UPI",
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed", "Cancelled", "Refunded"],
      default: "Completed",
    },
    reference: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String,
      trim: true,
      default: "",
    },
    refunds: [refundSchema],
    audit: [auditSchema],
  },
  { timestamps: true }
);

paymentSchema.index({ businessId: 1, date: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
