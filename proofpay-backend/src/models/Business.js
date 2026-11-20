
const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    razorpayAccountId: {
      type: String,
      default: null,
    },
    razorpayAccountStatus: {
      type: String,
      enum: ["not_connected", "pending", "active", "restricted"],
      default: "not_connected",
    },
    businessType: {
      type: String,
      default: "Wholesale / Distribution",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
