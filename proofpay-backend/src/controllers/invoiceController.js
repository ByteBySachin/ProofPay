const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");

// GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const businessId = req.businessId;

    const invoices = await Invoice.find({
      businessId,
      status: { $ne: "cancelled" },
    })
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = invoices.map((inv) => ({
      ...inv,
      id: inv.invoiceNumber || inv._id.toString(),
      _id: inv._id.toString(),
      customerName: inv.customerId?.name || inv.customerName || "Unnamed Customer",
      customerPhone: inv.customerId?.phone || "",
      total: inv.totalAmount,
      paid: inv.amountPaid,
      balance: inv.balanceDue,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve invoices",
    });
  }
};

// POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const businessId = req.businessId;
    const {
      customerId,
      customerName,
      invoiceNumber: customInvoiceNumber,
      items,
      taxRate = 0,
      dueDate,
      status = "draft",
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "An invoice must contain at least one item",
      });
    }

    // Validate and sanitize items
    const parsedItems = [];
    let subtotal = 0;
    for (const item of items) {
      const description = (item.description || "").trim();
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice ?? item.price);

      if (!description || quantity <= 0 || unitPrice < 0 || isNaN(quantity) || isNaN(unitPrice)) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a description, positive quantity, and non-negative price",
        });
      }

      parsedItems.push({ description, quantity, unitPrice });
      subtotal += quantity * unitPrice;
    }

    const numericTaxRate = Math.max(0, Math.min(100, Number(taxRate) || 0));
    const taxAmount = Math.round(subtotal * (numericTaxRate / 100) * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    // Verify or find customer
    let validCustomerId = null;
    let finalCustomerName = (customerName || "").trim();

    if (customerId) {
      const customer = await Customer.findOne({ _id: customerId, businessId });
      if (customer) {
        validCustomerId = customer._id;
        if (!finalCustomerName) {
          finalCustomerName = customer.name;
        }
      }
    }

    // Generate invoiceNumber if not provided
    let invoiceNumber = (customInvoiceNumber || "").trim();
    if (!invoiceNumber) {
      const currentYear = new Date().getFullYear();
      const count = await Invoice.countDocuments({ businessId });
      const nextSequence = String(count + 1).padStart(3, "0");
      invoiceNumber = `INV-${currentYear}-${nextSequence}`;

      // Check collision
      const exists = await Invoice.findOne({ businessId, invoiceNumber });
      if (exists) {
        invoiceNumber = `INV-${currentYear}-${Date.now().toString().slice(-4)}`;
      }
    }

    const invoice = await Invoice.create({
      businessId,
      customerId: validCustomerId,
      customerName: finalCustomerName,
      invoiceNumber,
      items: parsedItems,
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status === "sent" ? "sent" : "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        ...invoice.toObject(),
        id: invoice.invoiceNumber,
        customerName: finalCustomerName,
      },
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Invoice number already exists for your business",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to create invoice",
    });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id, businessId }
      : { invoiceNumber: id, businessId };

    const invoice = await Invoice.findOne(query)
      .populate("customerId", "name phone email")
      .lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...invoice,
        id: invoice.invoiceNumber || invoice._id.toString(),
        customerName: invoice.customerId?.name || invoice.customerName || "Unnamed Customer",
      },
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve invoice",
    });
  }
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id, businessId }
      : { invoiceNumber: id, businessId };

    const invoice = await Invoice.findOneAndDelete(query);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete invoice",
    });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  getInvoiceById,
  deleteInvoice,
};
