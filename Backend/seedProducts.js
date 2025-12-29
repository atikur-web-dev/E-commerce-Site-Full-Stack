// Backend/seedProducts.js - FIXED PRICES + LOCAL IMAGES
import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const products = [
  // ==================== SMARTPHONES ====================
  {
    name: "iPhone 15 Pro Max",
    description: "Latest iPhone with A17 Pro chip, Titanium design, 48MP camera",
    price: 199999, 
    category: "Smartphones",
    brand: "Apple",
    images: [
      "/images/products/Mobile/iPhone15ProMax.jpg",
      "/images/products/Mobile/iPhone15ProMax_2.jpg"
    ],
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
    price: 149999, // ৳149,999
    category: "Smartphones",
    brand: "Samsung",
    images: [
      "/images/products/Mobile/SamsungGalaxyS24Ultra.jpg",
      "/images/products/Mobile/SamsungGalaxyS24Ultra_2.jpg"
    ],
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
    price: 129999, // ৳129,999
    category: "Smartphones",
    brand: "Google",
    images: [
      "/images/products/Mobile/GooglePixel8Pro.jpg",
      "/images/products/Mobile/GooglePixel8Pro_2.jpg"
    ],
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
    price: 99999, // ৳99,999
    category: "Smartphones",
    brand: "OnePlus",
    images: [
      "/images/products/Mobile/OnePlus12.jpg",
      "/images/products/Mobile/OnePlus12_2.jpg"
    ],
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

  // ==================== LAPTOPS ====================
  {
    name: "MacBook Pro 16-inch M3 Max",
    description: "Professional laptop for creators and developers",
    price: 449999, // ৳449,999
    category: "Laptops",
    brand: "Apple",
    images: [
      "/images/products/Laptops/MacBookPro16inchM3Max.jpg",
      "/images/products/Laptops/MacBookPro16inchM3Max_2.jpg"
    ],
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
    price: 249999, // ৳249,999
    category: "Laptops",
    brand: "Dell",
    images: [
      "/images/products/Laptops/DellXPS15.jpg",
      "/images/products/Laptops/DellXPS15_2.jpg"
    ],
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
    price: 299999, // ৳299,999
    category: "Laptops",
    brand: "ASUS",
    images: [
      "/images/products/Laptops/ASUSROGZephyrusG14.jpg",
      "/images/products/Laptops/ASUSROGZephyrusG14_2.jpg"
    ],
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
    price: 219999, // ৳219,999
    category: "Laptops",
    brand: "Lenovo",
    images: [
      "/images/products/Laptops/LenovoThinkPadX1Carbon.jpg",
      "/images/products/Laptops/LenovoThinkPadX1Carbon_2.jpg"
    ],
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

  // ==================== TABLETS ====================
  {
    name: "iPad Pro 12.9-inch M2",
    description: "Professional tablet with Liquid Retina XDR display",
    price: 169999, // ৳169,999
    category: "Tablets",
    brand: "Apple",
    images: [
      "/images/products/Tablets/iPadPro12.9inchM2.jpg",
      "/images/products/Tablets/iPadPro12.9inchM2_2.jpg"
    ],
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
    price: 149999, // ৳149,999
    category: "Tablets",
    brand: "Samsung",
    images: [
      "/images/products/Tablets/SamsungGalaxyTabS9Ultra.jpg",
      "/images/products/Tablets/SamsungGalaxyTabS9Ultra_2.jpg"
    ],
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
    price: 179999, // ৳179,999
    category: "Tablets",
    brand: "Microsoft",
    images: [
      "/images/products/Tablets/MicrosoftSurfacePro9.jpg",
      "/images/products/Tablets/MicrosoftSurfacePro9_2.jpg"
    ],
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
    price: 79999, // ৳79,999
    category: "Tablets",
    brand: "OnePlus",
    images: [
      "/images/products/Tablets/OnePlusPad.jpg",
      "/images/products/Tablets/OnePlusPad_2.jpg"
    ],
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

  // ==================== GAMING ====================
  {
    name: "PlayStation 5 Pro",
    description: "Next-gen gaming console with 4K 120FPS",
    price: 89999, // ৳89,999
    category: "Gaming",
    brand: "Sony",
    images: [
      "/images/products/Gaming/PlayStation5Pro.jpg",
      "/images/products/Gaming/PlayStation5Pro_2.jpg"
    ],
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
    price: 79999, // ৳79,999
    category: "Gaming",
    brand: "Microsoft",
    images: [
      "/images/products/Gaming/XboxSeriesX.jpg",
      "/images/products/Gaming/XboxSeriesX_2.jpg"
    ],
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
    price: 49999, // ৳49,999
    category: "Gaming",
    brand: "Nintendo",
    images: [
      "/images/products/Gaming/NintendoSwitchOLED.jpg",
      "/images/products/Gaming/NintendoSwitchOLED_2.jpg"
    ],
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
    price: 99999, // ৳99,999
    category: "Gaming",
    brand: "ASUS",
    images: [
      "/images/products/Gaming/ASUSROGAlly.jpg",
      "/images/products/Gaming/ASUSROGAlly_2.jpg"
    ],
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

  // ==================== PC COMPONENTS ====================
  {
    name: "NVIDIA RTX 4090",
    description: "Flagship GPU with 24GB GDDR6X, DLSS 3",
    price: 249999, // ৳249,999
    category: "PC Components",
    brand: "NVIDIA",
    images: [
      "/images/products/PC Components/NVIDIARTX4090.jpg",
      "/images/products/PC Components/NVIDIARTX4090_2.jpg"
    ],
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
    price: 99999, // ৳99,999
    category: "PC Components",
    brand: "AMD",
    images: [
      "/images/products/PC Components/AMDRyzen97950X3D.jpg",
      "/images/products/PC Components/AMDRyzen97950X3D_2.jpg"
    ],
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
    price: 49999, // ৳49,999
    category: "PC Components",
    brand: "Corsair",
    images: [
      "/images/products/PC Components/CorsairDominatorPlatinumRGB.jpg",
      "/images/products/PC Components/CorsairDominatorPlatinumRGB_2.jpg"
    ],
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
    price: 29999, // ৳29,999
    category: "PC Components",
    brand: "Samsung",
    images: [
      "/images/products/PC Components/Samsung990Pro2TB.jpg",
      "/images/products/PC Components/Samsung990Pro2TB_2.jpg"
    ],
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

  // ==================== ACCESSORIES ====================
  {
    name: "Apple Magic Keyboard",
    description: "Wireless keyboard with Touch ID for Mac",
    price: 19999, // ৳19,999
    category: "Accessories",
    brand: "Apple",
    images: [
      "/images/products/Accessories/AppleMagicKeyboard.jpg",
      "/images/products/Accessories/AppleMagicKeyboard_2.jpg"
    ],
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
    price: 12999, // ৳12,999
    category: "Accessories",
    brand: "Logitech",
    images: [
      "/images/products/Accessories/LogitechMXMaster3S.jpg",
      "/images/products/Accessories/LogitechMXMaster3S_2.jpg"
    ],
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
    price: 15999, // ৳15,999
    category: "Accessories",
    brand: "Anker",
    images: [
      "/images/products/Accessories/Anker737PowerBank.jpg",
      "/images/products/Accessories/Anker737PowerBank_2.jpg"
    ],
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
    price: 16999, // ৳16,999
    category: "Accessories",
    brand: "Samsung",
    images: [
      "/images/products/Accessories/SamsungT7ShieldSSD.jpg",
      "/images/products/Accessories/SamsungT7ShieldSSD_2.jpg"
    ],
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

  // ==================== NETWORKING ====================
  {
    name: "TP-Link Archer AXE95",
    description: "Tri-band WiFi 6E router with 10G port",
    price: 49999, // ৳49,999
    category: "Networking",
    brand: "TP-Link",
    images: [
      "/images/products/Networking/TPLinkArcherAXE95.jpg",
      "/images/products/Networking/TPLinkArcherAXE95_2.jpg"
    ],
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
    price: 89999, // ৳89,999
    category: "Networking",
    brand: "ASUS",
    images: [
      "/images/products/Networking/ASUS-ROG-Rapture-GT-AXE16000.jpg",
      "/images/products/Networking/ASUS-ROG-Rapture-GT-AXE16000_2.jpg"
    ],
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
    price: 59999, // ৳59,999
    category: "Networking",
    brand: "Netgear",
    images: [
      "/images/products/Networking/NetgearNighthawkRAXE300.jpg",
      "/images/products/Networking/NetgearNighthawkRAXE300_2.jpg"
    ],
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
    price: 49999, // ৳49,999
    category: "Networking",
    brand: "Google",
    images: [
      "/images/products/Networking/Google-Nest-Wifi-Pro.jpg",
      "/images/products/Networking/Google-Nest-Wifi-Pro_2.jpg"
    ],
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
    console.log("📦 Inserting products with local images...");
    const result = await Product.insertMany(products);
    console.log(`✅ ${result.length} products added successfully!`);

    // Show summary
    const categoryCounts = {};
    products.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    console.log("\n📊 SUMMARY BY CATEGORY:");
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   📁 ${category}: ${count} products`);
    });

    console.log("\n🎯 TOTAL PRODUCTS:", products.length);
    console.log("🏷️  CATEGORIES:", Object.keys(categoryCounts).length);
    console.log("💰 PRICES IN BANGLADESHI TAKA (৳)");
    console.log("📸 USING LOCAL IMAGES FROM /images/products/");

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