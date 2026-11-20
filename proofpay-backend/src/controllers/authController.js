
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Business = require("../models/Business");

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const signup = async (req, res) => {
  try {
    const name = (req.body.name || req.body.fullName || "").trim();
    const { email, password, businessName } = req.body;

    if (
      !name ||
      !email?.trim() ||
      !password ||
      !businessName?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and business name are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the business and its owner together.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    try {
      const business = await Business.create({
        name: businessName.trim(),
        ownerId: user._id,
        email: normalizedEmail,
      });

      user.businessId = business._id;
      await user.save();
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }

    // Fetch the business so we can include its name in the response.
    const business = await Business.findById(user.businessId)
      .select("name")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessId: user.businessId,
        businessName: business?.name || "",
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Fetch the business so we can include its name in the response.
    const business = await Business.findById(user.businessId)
      .select("name")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessId: user.businessId,
        businessName: business?.name || "",
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
};

const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware and derived from the JWT.
    const user = req.user;

    const business = await Business.findById(user.businessId)
      .select("name email businessType address razorpayAccountStatus")
      .lean();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        businessId: user.businessId,
        businessName: business?.name || "",
        businessEmail: business?.email || user.email,
        businessType: business?.businessType || "Wholesale / Distribution",
        businessAddress: business?.address || "",
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get me error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile",
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const businessId = req.user.businessId;
    const {
      name,
      fullName,
      phone,
      avatar,
      businessName,
      businessEmail,
      businessType,
      businessAddress,
    } = req.body;

    const effectiveName = (fullName || name);
    const userUpdates = {};
    if (effectiveName !== undefined) userUpdates.name = effectiveName.trim();
    if (phone !== undefined) userUpdates.phone = phone.trim();
    if (avatar !== undefined) userUpdates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(userId, userUpdates, {
      new: true,
      runValidators: true,
    }).select("_id name email phone avatar businessId role createdAt");

    const businessUpdates = {};
    if (businessName !== undefined) businessUpdates.name = businessName.trim();
    if (businessEmail !== undefined)
      businessUpdates.email = businessEmail.trim().toLowerCase();
    if (businessType !== undefined) businessUpdates.businessType = businessType.trim();
    if (businessAddress !== undefined)
      businessUpdates.address = businessAddress.trim();

    let updatedBusiness = null;
    if (businessId && Object.keys(businessUpdates).length > 0) {
      updatedBusiness = await Business.findByIdAndUpdate(
        businessId,
        businessUpdates,
        { new: true, runValidators: true }
      ).lean();
    } else if (businessId) {
      updatedBusiness = await Business.findById(businessId).lean();
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        avatar: updatedUser.avatar || "",
        businessId: updatedUser.businessId,
        businessName: updatedBusiness?.name || "",
        businessEmail: updatedBusiness?.email || updatedUser.email,
        businessType:
          updatedBusiness?.businessType || "Wholesale / Distribution",
        businessAddress: updatedBusiness?.address || "",
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Update me error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update profile",
    });
  }
};

module.exports = { signup, login, getMe, updateMe };
