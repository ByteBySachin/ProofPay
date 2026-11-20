const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");

// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const businessId = req.businessId;

    const customers = await Customer.find({ businessId })
      .sort({ createdAt: -1 })
      .lean();

    // Dynamically calculate accurate outstanding balance from active invoices
    const customerIds = customers.map((c) => c._id);
    const invoiceBalances = await Invoice.aggregate([
      {
        $match: {
          businessId,
          customerId: { $in: customerIds },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalOutstanding: { $sum: "$balanceDue" },
        },
      },
    ]);

    const balanceMap = {};
    invoiceBalances.forEach((item) => {
      balanceMap[item._id.toString()] = item.totalOutstanding;
    });

    const enrichedCustomers = customers.map((c) => ({
      ...c,
      id: c._id.toString(),
      outstanding: balanceMap[c._id.toString()] ?? c.outstanding ?? 0,
    }));

    return res.status(200).json({
      success: true,
      count: enrichedCustomers.length,
      data: enrichedCustomers,
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customers",
    });
  }
};

// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { name, phone, email, city } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number is required",
      });
    }

    // Check duplicate phone for this business
    const existing = await Customer.findOne({
      businessId,
      phone: phone.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A customer with this phone number already exists for your business",
      });
    }

    const customer = await Customer.create({
      businessId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : "",
      city: city ? city.trim() : "",
      outstanding: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        ...customer.toObject(),
        id: customer._id.toString(),
      },
    });
  } catch (error) {
    console.error("Create customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create customer",
    });
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;
    const { name, phone, email, city } = req.body;

    const customer = await Customer.findOne({ _id: id, businessId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (name) customer.name = name.trim();
    if (phone) customer.phone = phone.trim();
    if (email !== undefined) customer.email = email.trim().toLowerCase();
    if (city !== undefined) customer.city = city.trim();

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: {
        ...customer.toObject(),
        id: customer._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update customer",
    });
  }
};

// DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;

    const customer = await Customer.findOneAndDelete({ _id: id, businessId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete customer",
    });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
