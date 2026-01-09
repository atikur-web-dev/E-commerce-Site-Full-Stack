// Backend/controllers/authController.js 
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Upload image to Cloudinary
const uploadImageToCloudinary = async (imageBuffer, mimetype) => {
  try {
    // Convert buffer to base64
    const base64Image = `data:${mimetype};base64,${imageBuffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "shopeasy/users",
      width: 300,
      height: 300,
      crop: "fill",
      format: "webp",
      quality: "auto",
      resource_type: "image"
    });
    
    return result.secure_url;
  } catch (error) {
    console.error(" Cloudinary upload error:", error);
    throw new Error("Image upload failed: " + error.message);
  }
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Registration attempt for:", { name, email });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    console.log(" User created in DB:", user._id);

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      message: "Registration successful",
    });
  } catch (error) {
    console.error(" Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(" Login attempt for:", email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user WITH password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log(" User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log(" Password mismatch for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      avatar: user.avatar || "",
      shippingAddress: user.shippingAddress || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Bangladesh"
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      avatar: user.avatar || "",
      shippingAddress: user.shippingAddress || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Bangladesh"
      },
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(" Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update User Profile - Main function
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(" Updating profile for:", user.email);
    console.log(" Request body:", req.body);
    console.log(" File received:", req.file ? "Yes" : "No");

    // Update basic info
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    // Handle shipping address - support both formats
    if (req.body.shippingAddress) {
      const addr = req.body.shippingAddress;
      user.shippingAddress = {
        street: addr.street || user.shippingAddress?.street || "",
        city: addr.city || user.shippingAddress?.city || "",
        state: addr.state || user.shippingAddress?.state || "",
        zipCode: addr.zipCode || user.shippingAddress?.zipCode || "",
        country: addr.country || user.shippingAddress?.country || "Bangladesh"
      };
    } else {
      // Handle formData individual fields
      if (req.body['shippingAddress[street]'] !== undefined) {
        user.shippingAddress = user.shippingAddress || {};
        user.shippingAddress.street = req.body['shippingAddress[street]'];
      }
      if (req.body['shippingAddress[city]'] !== undefined) {
        user.shippingAddress = user.shippingAddress || {};
        user.shippingAddress.city = req.body['shippingAddress[city]'];
      }
      if (req.body['shippingAddress[state]'] !== undefined) {
        user.shippingAddress = user.shippingAddress || {};
        user.shippingAddress.state = req.body['shippingAddress[state]'];
      }
      if (req.body['shippingAddress[zipCode]'] !== undefined) {
        user.shippingAddress = user.shippingAddress || {};
        user.shippingAddress.zipCode = req.body['shippingAddress[zipCode]'];
      }
      if (req.body['shippingAddress[country]'] !== undefined) {
        user.shippingAddress = user.shippingAddress || {};
        user.shippingAddress.country = req.body['shippingAddress[country]'];
      }
    }

    // Handle avatar upload
    if (req.file) {
      try {
        console.log(" Uploading avatar to Cloudinary...");
        const avatarUrl = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
        user.avatar = avatarUrl;
        console.log(" Avatar uploaded:", avatarUrl);
      } catch (uploadError) {
        console.error(" Avatar upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload image. Please try again."
        });
      }
    }
    // Handle base64 avatar
    else if (req.body.avatar && req.body.avatar.startsWith('data:image')) {
      try {
        console.log(" Processing base64 avatar...");
        // Remove the data:image/xxx;base64, part
        const base64Data = req.body.avatar.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const avatarUrl = await uploadImageToCloudinary(buffer, req.body.avatar.split(';')[0].split(':')[1]);
        user.avatar = avatarUrl;
        console.log(" Base64 avatar processed:", avatarUrl);
      } catch (uploadError) {
        console.error(" Base64 avatar error:", uploadError);
        // Continue without avatar if upload fails
      }
    }

    // Update password if provided
    if (req.body.password && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    // Save user
    await user.save();
    console.log(" User profile saved");

    // Generate new token
    const token = generateToken(user._id);

    // Response
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        shippingAddress: user.shippingAddress || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Bangladesh"
        },
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error(" Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};