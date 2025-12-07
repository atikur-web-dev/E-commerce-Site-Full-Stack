import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1234567/avatar.png",
    },
    shippingAddress: {
      country: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
      postalCode: {
        type: String,
        default: "",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        return ret;
      },
    },
  }
);

// ====================== MIDDLEWARE ======================

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin before findOneAndUpdate
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.lastLogin) {
    this.setUpdate({
      ...update,
      $set: { ...update.$set, updatedAt: new Date() },
    });
  }
  next();
});

// ====================== INSTANCE METHODS ======================

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // "this.password" is available because we used .select('+password') in login
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Get user profile (public info)
userSchema.methods.getProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    shippingAddress: this.shippingAddress,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

// Check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// ====================== STATIC METHODS ======================

// Find user by email
userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email }).select("+password");
};

// Find active users
userSchema.statics.findActiveUsers = async function () {
  return await this.find({ isActive: true });
};

// ====================== VIRTUALS ======================

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return this.name;
});

// Virtual for account age
userSchema.virtual("accountAge").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ====================== INDEXES ======================

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// ====================== QUERY HELPERS ======================

userSchema.query.byRole = function (role) {
  return this.where({ role });
};

userSchema.query.active = function () {
  return this.where({ isActive: true });
};

userSchema.query.recent = function (days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where({ createdAt: { $gte: date } });
};

const User = mongoose.model("User", userSchema);

export default User;
