// Backend/seedProducts.js
import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const products = [
  // ==================== SMARTPHONES (4 products) ====================
  {
    name: "iPhone 15 Pro Max",
    description:
      "Latest iPhone with A17 Pro chip, Titanium design, 48MP camera",
    price: 1299.99,
    category: "Smartphones", // ✅ Exact match with enum
    brand: "Apple",
    image: "/images/products/Mobile/iPhone 15 Pro Max.jpg",

    stock: 15,
    rating: 4.8,
    numReviews: 124,
    isFeatured: true,
    isNewArrival: true,
    specifications: {
      display: "6.7-inch Super Retina XDR",
      ram: "8GB",
      storage: "256GB",
      battery: "4422mAh",
      camera: "48MP + 12MP + 12MP",
    },
    warranty: 12,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "AI-powered smartphone with S Pen, 200MP camera",
    price: 1199.99,
    category: "Smartphones",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
    stock: 20,
    rating: 4.7,
    numReviews: 89,
    isNewArrival: true,
    specifications: {
      display: "6.8-inch Dynamic AMOLED",
      ram: "12GB",
      storage: "512GB",
      battery: "5000mAh",
      camera: "200MP + 50MP + 12MP",
    },
    warranty: 12,
  },
  {
    name: "Google Pixel 8 Pro",
    description: "Best camera smartphone with Tensor G3 chip",
    price: 999.99,
    category: "Smartphones",
    brand: "Google",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500",
    stock: 18,
    rating: 4.6,
    numReviews: 67,
    specifications: {
      display: "6.7-inch OLED",
      ram: "12GB",
      storage: "128GB",
      battery: "5050mAh",
      camera: "50MP + 48MP + 48MP",
    },
    warranty: 12,
  },
  {
    name: "OnePlus 12",
    description: "Flagship killer with Snapdragon 8 Gen 3",
    price: 899.99,
    category: "Smartphones",
    brand: "OnePlus",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500",
    stock: 25,
    rating: 4.5,
    numReviews: 45,
    isBestSeller: true,
    specifications: {
      display: "6.82-inch AMOLED",
      ram: "16GB",
      storage: "256GB",
      battery: "5400mAh",
      camera: "50MP + 48MP + 64MP",
    },
    warranty: 12,
  },

  // ==================== LAPTOPS (4 products) ====================
  {
    name: "MacBook Pro 16-inch M3 Max",
    description: "Professional laptop for creators and developers",
    price: 3499.99,
    category: "Laptops", // ✅ Exact match
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    stock: 10,
    rating: 4.9,
    numReviews: 56,
    isFeatured: true,
    specifications: {
      processor: "Apple M3 Max",
      ram: "64GB",
      storage: "2TB SSD",
      display: "16.2-inch Liquid Retina XDR",
    },
    warranty: 12,
  },
  {
    name: "Dell XPS 15",
    description: "Premium Windows laptop with OLED display",
    price: 1999.99,
    category: "Laptops",
    brand: "Dell",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500",
    stock: 12,
    rating: 4.7,
    numReviews: 78,
    isBestSeller: true,
    specifications: {
      processor: "Intel Core i9",
      ram: "32GB",
      storage: "1TB SSD",
      display: "15.6-inch 4K OLED",
    },
    warranty: 12,
  },
  {
    name: "ASUS ROG Zephyrus G14",
    description: "Gaming laptop with RTX 4090, AMD Ryzen 9",
    price: 2499.99,
    category: "Laptops",
    brand: "ASUS",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
    stock: 8,
    rating: 4.8,
    numReviews: 42,
    specifications: {
      processor: "AMD Ryzen 9",
      ram: "32GB",
      storage: "2TB SSD",
      graphics: "RTX 4090",
    },
    warranty: 12,
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    description: "Business laptop with military-grade durability",
    price: 1799.99,
    category: "Laptops",
    brand: "Lenovo",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    stock: 15,
    rating: 4.6,
    numReviews: 34,
    specifications: {
      processor: "Intel Core i7",
      ram: "16GB",
      storage: "512GB SSD",
      display: "14-inch 2.8K OLED",
    },
    warranty: 12,
  },

  // ==================== TABLETS (4 products) ====================
  {
    name: "iPad Pro 12.9-inch M2",
    description: "Professional tablet with Liquid Retina XDR display",
    price: 1299.99,
    category: "Tablets", // ✅ Exact match
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
    stock: 14,
    rating: 4.8,
    numReviews: 89,
    isFeatured: true,
    specifications: {
      display: "12.9-inch Liquid Retina XDR",
      storage: "256GB",
      camera: "12MP + 10MP",
      battery: "40Wh",
    },
    warranty: 12,
  },
  {
    name: "Samsung Galaxy Tab S9 Ultra",
    description: "Android tablet with S Pen, AMOLED display",
    price: 1199.99,
    category: "Tablets",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1546054451-4cffa2c1d4e7?w=500",
    stock: 18,
    rating: 4.7,
    numReviews: 56,
    isNewArrival: true,
    specifications: {
      display: "14.6-inch Dynamic AMOLED",
      storage: "512GB",
      ram: "12GB",
      spen: "Included",
    },
    warranty: 12,
  },
  {
    name: "Microsoft Surface Pro 9",
    description: "2-in-1 laptop tablet with Intel Core i7",
    price: 1499.99,
    category: "Tablets",
    brand: "Microsoft",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500",
    stock: 9,
    rating: 4.6,
    numReviews: 34,
    specifications: {
      display: "13-inch PixelSense",
      processor: "Intel Core i7",
      storage: "256GB SSD",
      type: "2-in-1",
    },
    warranty: 12,
  },
  {
    name: "OnePlus Pad",
    description: "Premium Android tablet with 144Hz display",
    price: 599.99,
    category: "Tablets",
    brand: "OnePlus",
    image: "https://images.unsplash.com/photo-1565330503288-44f2a4e9c73e?w=500",
    stock: 22,
    rating: 4.4,
    numReviews: 28,
    specifications: {
      display: "11.6-inch 144Hz",
      processor: "Dimensity 9000",
      storage: "128GB",
      battery: "9510mAh",
    },
    warranty: 12,
  },

  // ==================== GAMING (4 products) ====================
  {
    name: "PlayStation 5 Pro",
    description: "Next-gen gaming console with 4K 120FPS",
    price: 699.99,
    category: "Gaming", // ✅ Exact match
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500",
    stock: 7,
    rating: 4.9,
    numReviews: 156,
    isFeatured: true,
    isBestSeller: true,
    specifications: {
      storage: "2TB SSD",
      resolution: "8K",
      fps: "120FPS",
      controller: "DualSense Edge",
    },
    warranty: 12,
  },
  {
    name: "Xbox Series X",
    description: "Most powerful Xbox with Game Pass",
    price: 599.99,
    category: "Gaming",
    brand: "Microsoft",
    image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=500",
    stock: 11,
    rating: 4.8,
    numReviews: 98,
    specifications: {
      storage: "1TB SSD",
      resolution: "4K",
      fps: "120FPS",
      features: "Game Pass Ultimate",
    },
    warranty: 12,
  },
  {
    name: "Nintendo Switch OLED",
    description: "Hybrid gaming console with OLED screen",
    price: 349.99,
    category: "Gaming",
    brand: "Nintendo",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500",
    stock: 25,
    rating: 4.7,
    numReviews: 203,
    specifications: {
      display: "7-inch OLED",
      storage: "64GB",
      battery: "4.5-9 hours",
      mode: "Hybrid",
    },
    warranty: 12,
  },
  {
    name: "ASUS ROG Ally",
    description: "Windows gaming handheld with AMD Z1 Extreme",
    price: 799.99,
    category: "Gaming",
    brand: "ASUS",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500",
    stock: 6,
    rating: 4.6,
    numReviews: 45,
    specifications: {
      display: "7-inch 120Hz",
      processor: "AMD Z1 Extreme",
      storage: "512GB SSD",
      os: "Windows 11",
    },
    warranty: 12,
  },

  // ==================== PC COMPONENTS (4 products) ====================
  {
    name: "NVIDIA RTX 4090",
    description: "Flagship GPU with 24GB GDDR6X, DLSS 3",
    price: 1599.99,
    category: "PC Components", // ✅ Exact match
    brand: "NVIDIA",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500",
    stock: 5,
    rating: 4.9,
    numReviews: 234,
    isFeatured: true,
    specifications: {
      memory: "24GB GDDR6X",
      cores: "16384 CUDA",
      power: "450W",
      interface: "PCIe 4.0",
    },
    warranty: 36,
  },
  {
    name: "AMD Ryzen 9 7950X3D",
    description: "16-core gaming CPU with 3D V-Cache",
    price: 699.99,
    category: "PC Components",
    brand: "AMD",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500",
    stock: 12,
    rating: 4.8,
    numReviews: 156,
    specifications: {
      cores: "16 cores",
      threads: "32 threads",
      cache: "144MB",
      socket: "AM5",
    },
    warranty: 36,
  },
  {
    name: "Corsair Dominator Platinum RGB",
    description: "Premium DDR5 RAM with RGB lighting",
    price: 299.99,
    category: "PC Components",
    brand: "Corsair",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500",
    stock: 30,
    rating: 4.7,
    numReviews: 89,
    specifications: {
      capacity: "32GB (2x16GB)",
      speed: "6000MHz",
      timing: "CL36",
      type: "DDR5",
    },
    warranty: 36,
  },
  {
    name: "Samsung 990 Pro 2TB",
    description: "Fastest consumer SSD with PCIe 4.0",
    price: 199.99,
    category: "PC Components",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    stock: 25,
    rating: 4.9,
    numReviews: 203,
    specifications: {
      capacity: "2TB",
      interface: "PCIe 4.0",
      read: "7450MB/s",
      write: "6900MB/s",
    },
    warranty: 36,
  },

  // ==================== ACCESSORIES (4 products) ====================
  {
    name: "Apple Magic Keyboard",
    description: "Wireless keyboard with Touch ID for Mac",
    price: 149.99,
    category: "Accessories", // ✅ Exact match
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
    stock: 40,
    rating: 4.6,
    numReviews: 178,
    specifications: {
      connectivity: "Bluetooth",
      battery: "1 month",
      features: "Touch ID",
      layout: "US English",
    },
    warranty: 12,
  },
  {
    name: "Logitech MX Master 3S",
    description: "Advanced wireless mouse for productivity",
    price: 99.99,
    category: "Accessories",
    brand: "Logitech",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
    stock: 35,
    rating: 4.8,
    numReviews: 256,
    isBestSeller: true,
    specifications: {
      dpi: "8000",
      battery: "70 days",
      connectivity: "Bluetooth/2.4GHz",
      buttons: "7",
    },
    warranty: 12,
  },
  {
    name: "Anker 737 Power Bank",
    description: "140W GaN Prime power bank with display",
    price: 129.99,
    category: "Accessories",
    brand: "Anker",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    stock: 28,
    rating: 4.7,
    numReviews: 134,
    specifications: {
      capacity: "24000mAh",
      output: "140W",
      ports: "2× USB-C, 1× USB-A",
      display: "Yes",
    },
    warranty: 12,
  },
  {
    name: "Samsung T7 Shield SSD",
    description: "Rugged portable SSD with waterproof design",
    price: 129.99,
    category: "Accessories",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    stock: 22,
    rating: 4.5,
    numReviews: 89,
    specifications: {
      capacity: "2TB",
      speed: "1050MB/s",
      protection: "IP65",
      interface: "USB 3.2",
    },
    warranty: 12,
  },

  // ==================== NETWORKING (4 products) ====================
  {
    name: "TP-Link Archer AXE95",
    description: "Tri-band WiFi 6E router with 10G port",
    price: 399.99,
    category: "Networking", // ✅ Exact match
    brand: "TP-Link",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500",
    stock: 15,
    rating: 4.7,
    numReviews: 67,
    specifications: {
      standard: "WiFi 6E",
      speed: "11000Mbps",
      ports: "1× 10G, 4× 1G",
      bands: "Tri-band",
    },
    warranty: 24,
  },
  {
    name: "ASUS ROG Rapture GT-AXE16000",
    description: "Gaming router with quad-band WiFi 6E",
    price: 649.99,
    category: "Networking",
    brand: "ASUS",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500",
    stock: 8,
    rating: 4.9,
    numReviews: 45,
    specifications: {
      standard: "WiFi 6E",
      speed: "16000Mbps",
      gamingFeatures: "Yes",
      bands: "Quad-band",
    },
    warranty: 24,
  },
  {
    name: "Netgear Nighthawk RAXE300",
    description: "Tri-band WiFi 6E router for 8K streaming",
    price: 449.99,
    category: "Networking",
    brand: "Netgear",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500",
    stock: 12,
    rating: 4.6,
    numReviews: 56,
    specifications: {
      standard: "WiFi 6E",
      speed: "7800Mbps",
      processor: "1.7GHz quad-core",
      antennas: "6",
    },
    warranty: 24,
  },
  {
    name: "Google Nest Wifi Pro",
    description: "Mesh WiFi 6E system with smart features",
    price: 399.99,
    category: "Networking",
    brand: "Google",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500",
    stock: 20,
    rating: 4.5,
    numReviews: 89,
    specifications: {
      standard: "WiFi 6E",
      coverage: "6600 sq ft",
      nodes: "3-pack",
      smartFeatures: "Yes",
    },
    warranty: 24,
  },
];

const seedProducts = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing products
    console.log("🗑️ Clearing existing products...");
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} products`);

    // Insert new products
    console.log("📦 Inserting products...");
    const result = await Product.insertMany(products);
    console.log(`✅ ${result.length} products added successfully!`);

    // Show detailed summary
    console.log("\n📊 DETAILED SUMMARY BY CATEGORY:");

    const categoryCounts = {};
    products.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   📁 ${category}: ${count} products`);
    });

    console.log("\n🎯 TOTAL PRODUCTS:", products.length);
    console.log("🏷️  CATEGORIES:", Object.keys(categoryCounts).length);

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    if (error.errors) {
      Object.entries(error.errors).forEach(([field, err]) => {
        console.error(`   ${field}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

seedProducts();
