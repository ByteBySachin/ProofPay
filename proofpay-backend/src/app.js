
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporary login request debugging
app.use((req, res, next) => {
  if (req.path === "/api/auth/login") {
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Parsed body:", req.body);
  }
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ProofPay API is running",
  });
});

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

// Dashboard routes
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Customer routes
app.use("/api/customers", require("./routes/customerRoutes"));

// Invoice routes
app.use("/api/invoices", require("./routes/invoiceRoutes"));

// Payment routes
app.use("/api/payments", require("./routes/paymentRoutes"));

// 404 handler — must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
