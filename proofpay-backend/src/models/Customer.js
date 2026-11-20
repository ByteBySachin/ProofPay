const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    outstanding: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Indexes
customerSchema.index({ businessId: 1, phone: 1 });
customerSchema.index({ businessId: 1, name: 1 });

module.exports = mongoose.model("Customer", customerSchema);
