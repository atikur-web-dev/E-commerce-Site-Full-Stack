import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Smartphones",
        "Laptops",
        "PC Components",
        "Accessories",
        "Tablets",
        "Gaming",
        "Networking",
      ],
    },
    brand: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },

    // Inventory
    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    // Ratings
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    // Flags
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },

    // Tech Specifications (optional)
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Warranty
    warranty: {
      type: Number,
      default: 12, // months
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
