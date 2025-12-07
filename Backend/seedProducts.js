import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const sampleProducts = [
  // ========== SMARTPHONES ==========
  {
    name: "iPhone 15 Pro Max",
    description:
      "Latest Apple smartphone with A17 Pro chip, 6.7-inch Super Retina XDR display, titanium design, and 48MP camera system",
    price: 1299.99,
    category: "Smartphones",
    brand: "Apple",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop",
    stock: 45,
    rating: 4.8,
    numReviews: 120,
    isFeatured: true,
    specifications: {
      display: "6.7-inch Super Retina XDR",
      processor: "A17 Pro Chip",
      ram: "8GB",
      storage: "256GB",
      camera: "48MP + 12MP + 12MP",
      battery: "4422mAh",
    },
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description:
      "Powerful Android smartphone with Snapdragon 8 Gen 3, 6.8-inch Dynamic AMOLED 2X, S Pen included, and 200MP camera",
    price: 1199.99,
    category: "Smartphones",
    brand: "Samsung",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
    stock: 60,
    rating: 4.7,
    numReviews: 95,
    isFeatured: true,
    specifications: {
      display: "6.8-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      camera: "200MP + 50MP + 12MP + 10MP",
      battery: "5000mAh",
    },
  },
  {
    name: "Google Pixel 8 Pro",
    description:
      "AI-powered smartphone with Google Tensor G3, 6.7-inch LTPO OLED, and advanced computational photography",
    price: 999.99,
    category: "Smartphones",
    brand: "Google",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    stock: 35,
    rating: 4.6,
    numReviews: 78,
    isFeatured: false,
    specifications: {
      display: "6.7-inch LTPO OLED",
      processor: "Google Tensor G3",
      ram: "12GB",
      storage: "128GB",
      camera: "50MP + 48MP + 48MP",
      battery: "5050mAh",
    },
  },
  {
    name: "OnePlus 12",
    description:
      "Flagship killer with Snapdragon 8 Gen 3, 6.82-inch LTPO AMOLED, and 100W fast charging",
    price: 799.99,
    category: "Smartphones",
    brand: "OnePlus",
    image:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&auto=format&fit=crop",
    stock: 50,
    rating: 4.5,
    numReviews: 65,
    isFeatured: false,
    specifications: {
      display: "6.82-inch LTPO AMOLED",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      camera: "50MP + 64MP + 48MP",
      battery: "5400mAh",
    },
  },

  // ========== LAPTOPS ==========
  {
    name: "MacBook Pro 16-inch M3 Max",
    description:
      "Professional laptop with M3 Max chip, 16-inch Liquid Retina XDR display, and up to 128GB unified memory",
    price: 3499.99,
    category: "Laptops",
    brand: "Apple",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
    stock: 25,
    rating: 4.9,
    numReviews: 210,
    isFeatured: true,
    specifications: {
      display: "16.2-inch Liquid Retina XDR",
      processor: "Apple M3 Max",
      ram: "36GB",
      storage: "1TB SSD",
      graphics: "40-core GPU",
      battery: "100Wh",
    },
  },
  {
    name: "Dell XPS 15",
    description:
      "Premium Windows laptop with Intel Core i9, 15.6-inch 4K OLED touchscreen, and RTX 4070 graphics",
    price: 2499.99,
    category: "Laptops",
    brand: "Dell",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
    stock: 30,
    rating: 4.7,
    numReviews: 145,
    isFeatured: true,
    specifications: {
      display: "15.6-inch 4K OLED Touch",
      processor: "Intel Core i9-13900H",
      ram: "32GB",
      storage: "1TB SSD",
      graphics: "NVIDIA RTX 4070",
      battery: "86Wh",
    },
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    description:
      "Business laptop with Intel Core i7, 14-inch 2.8K OLED, military-grade durability, and ThinkShield security",
    price: 1899.99,
    category: "Laptops",
    brand: "Lenovo",
    image:
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&auto=format&fit=crop",
    stock: 40,
    rating: 4.6,
    numReviews: 120,
    isFeatured: false,
    specifications: {
      display: "14-inch 2.8K OLED",
      processor: "Intel Core i7-1365U",
      ram: "16GB",
      storage: "512GB SSD",
      graphics: "Intel Iris Xe",
      battery: "57Wh",
    },
  },
  {
    name: "ASUS ROG Zephyrus G14",
    description:
      "Gaming laptop with AMD Ryzen 9, 14-inch QHD+ 165Hz display, and RTX 4060 graphics for ultimate gaming",
    price: 1699.99,
    category: "Laptops",
    brand: "ASUS",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
    stock: 28,
    rating: 4.8,
    numReviews: 95,
    isFeatured: true,
    specifications: {
      display: "14-inch QHD+ 165Hz",
      processor: "AMD Ryzen 9 7940HS",
      ram: "16GB",
      storage: "1TB SSD",
      graphics: "NVIDIA RTX 4060",
      battery: "76Wh",
    },
  },

  // ========== PC COMPONENTS ==========
  {
    name: "NVIDIA RTX 4090 Founders Edition",
    description:
      "Flagship graphics card with 24GB GDDR6X, DLSS 3, and ray tracing for 4K gaming and AI workloads",
    price: 1599.99,
    category: "PC Components",
    brand: "NVIDIA",
    image:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop",
    stock: 15,
    rating: 4.9,
    numReviews: 180,
    isFeatured: true,
    specifications: {
      memory: "24GB GDDR6X",
      coreClock: "2235 MHz",
      boostClock: "2520 MHz",
      power: "450W",
      ports: "3x DP 1.4a, 1x HDMI 2.1",
    },
  },
  {
    name: "AMD Ryzen 9 7950X",
    description:
      "16-core, 32-thread processor with 5.7GHz boost clock, AM5 socket, and RDNA 2 graphics",
    price: 699.99,
    category: "PC Components",
    brand: "AMD",
    image:
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop",
    stock: 35,
    rating: 4.8,
    numReviews: 125,
    isFeatured: false,
    specifications: {
      cores: "16",
      threads: "32",
      baseClock: "4.5GHz",
      boostClock: "5.7GHz",
      cache: "80MB",
      tdp: "170W",
    },
  },
  {
    name: "Corsair Dominator Platinum RGB",
    description:
      "Premium DDR5 RAM with 64GB (2x32GB) 6000MHz, RGB lighting, and Intel XMP 3.0 certification",
    price: 349.99,
    category: "PC Components",
    brand: "Corsair",
    image:
      "https://images.unsplash.com/photo-1585771724684-382b1b0f2c8e?w=600&auto=format&fit=crop",
    stock: 50,
    rating: 4.7,
    numReviews: 90,
    isFeatured: false,
    specifications: {
      capacity: "64GB (2x32GB)",
      speed: "6000MHz",
      timings: "CL36",
      voltage: "1.35V",
      rgb: "Yes",
    },
  },
  {
    name: "Samsung 990 Pro 2TB NVMe SSD",
    description:
      "High-performance PCIe 4.0 NVMe SSD with read speeds up to 7450MB/s, ideal for gaming and content creation",
    price: 199.99,
    category: "PC Components",
    brand: "Samsung",
    image:
      "https://images.unsplash.com/photo-1581349485608-9469926de2d1?w=600&auto=format&fit=crop",
    stock: 75,
    rating: 4.9,
    numReviews: 210,
    isFeatured: true,
    specifications: {
      capacity: "2TB",
      interface: "PCIe 4.0 x4",
      readSpeed: "7450MB/s",
      writeSpeed: "6900MB/s",
      endurance: "1200TBW",
    },
  },

  // ========== ACCESSORIES ==========
  {
    name: "Apple AirPods Pro (2nd Gen)",
    description:
      "Wireless earbuds with active noise cancellation, spatial audio, and MagSafe charging case",
    price: 249.99,
    category: "Accessories",
    brand: "Apple",
    image:
      "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&auto=format&fit=crop",
    stock: 100,
    rating: 4.7,
    numReviews: 300,
    isFeatured: true,
    specifications: {
      battery: "6 hours (ANC on)",
      charging: "MagSafe, Qi",
      connectivity: "Bluetooth 5.3",
      features: "ANC, Spatial Audio, Transparency Mode",
    },
  },
  {
    name: "Logitech MX Master 3S",
    description:
      "Wireless mouse with 8K DPI, ergonomic design, multi-device connectivity, and MagSpeed scrolling",
    price: 99.99,
    category: "Accessories",
    brand: "Logitech",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&auto=format&fit=crop",
    stock: 80,
    rating: 4.8,
    numReviews: 180,
    isFeatured: false,
    specifications: {
      dpi: "8000",
      connectivity: "Bluetooth, 2.4GHz",
      battery: "70 days",
      buttons: "7 programmable",
      scroll: "MagSpeed electromagnetic",
    },
  },
  {
    name: "Keychron K8 Pro",
    description:
      "Mechanical keyboard with Gateron Brown switches, RGB backlighting, Bluetooth 5.1, and aluminum frame",
    price: 129.99,
    category: "Accessories",
    brand: "Keychron",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
    stock: 45,
    rating: 4.6,
    numReviews: 95,
    isFeatured: false,
    specifications: {
      switches: "Gateron Brown",
      layout: "TKL (87 keys)",
      connectivity: "Bluetooth 5.1, USB-C",
      rgb: "Yes",
      frame: "Aluminum",
    },
  },
  {
    name: "Samsung Odyssey G9 Neo",
    description:
      "49-inch super ultrawide gaming monitor with 5120x1440 resolution, 240Hz refresh rate, and Quantum Mini-LED",
    price: 1799.99,
    category: "Accessories",
    brand: "Samsung",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop",
    stock: 20,
    rating: 4.9,
    numReviews: 75,
    isFeatured: true,
    specifications: {
      size: "49-inch",
      resolution: "5120x1440",
      refreshRate: "240Hz",
      panel: "Quantum Mini-LED",
      curvature: "1000R",
    },
  },
];

async function seedDatabase() {
  try {
    console.log("🚀 Seeding Tech Database...");

    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopeasy"
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️ Cleared existing products");

    // Insert tech products
    await Product.insertMany(sampleProducts);
    console.log(`📦 Inserted ${sampleProducts.length} tech products`);

    // Verify
    const count = await Product.countDocuments();
    console.log(`📊 Total products in database: ${count}`);

    // Show categories
    const categories = [...new Set(sampleProducts.map((p) => p.category))];
    console.log("\n🏷️ Product Categories:");
    categories.forEach((cat, i) => {
      const count = sampleProducts.filter((p) => p.category === cat).length;
      console.log(`  ${i + 1}. ${cat} (${count} products)`);
    });

    console.log("\n🎉 Tech database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seedDatabase();
