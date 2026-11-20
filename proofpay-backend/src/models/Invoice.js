
const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
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

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An invoice must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceDue: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Invoice numbers must be unique within each business.
invoiceSchema.index(
  { businessId: 1, invoiceNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
