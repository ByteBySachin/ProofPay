
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "owner",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
