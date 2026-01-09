// Backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
    },
    // এটা বদলালাম: singular image -> array images
    images: {
      type: [String],
      required: true,
      default: ["/default-product.jpg"],
      validate: {
        validator: function (images) {
          return images.length > 0;
        },
        message: "At least one image is required",
      },
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
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
    salePrice: {
      type: Number,
      default: 0,
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    warranty: {
      type: Number,
      default: 12, // months
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for display price (sale or regular)
productSchema.virtual("displayPrice").get(function () {
  return this.isOnSale && this.salePrice > 0 ? this.salePrice : this.price;
});

// Virtual field for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.isOnSale && this.salePrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

const Product = mongoose.model("Product", productSchema);

export default Product;