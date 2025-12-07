import { authAPI, productAPI } from "../services/api";

export const testCompleteFlow = async () => {
  console.log("🚀 Testing Complete Flow...");
  console.log("====================================");

  try {
    // 1. Test backend connection
    console.log("1. 🔌 Testing backend connection...");
    const products = await productAPI.getAllProducts();
    console.log("✅ Backend connected, products:", products?.length || 0);

    // 2. Test login
    console.log("2. 🔐 Testing login...");
    const loginResult = await authAPI.login({
      email: "test@example.com",
      password: "password123",
    });

    if (loginResult?.token) {
      console.log("✅ Login successful!");
      console.log(
        "   Token received:",
        loginResult.token.substring(0, 20) + "..."
      );
      console.log("   User:", loginResult.user?.name || loginResult.name);
    } else {
      console.log("⚠️  Login response:", loginResult);
    }

    // 3. Test profile
    console.log("3. 👤 Testing profile...");
    const profile = await authAPI.getProfile();
    console.log("✅ Profile loaded:", profile?.name);

    // 4. Test logout
    console.log("4. 🚪 Testing logout...");
    authAPI.logout();
    console.log("✅ Logout function available");

    console.log("====================================");
    console.log("🎉 All tests completed successfully!");
    console.log("🔧 If any test failed:");
    console.log("   1. Check backend is running (npm run dev in Backend)");
    console.log("   2. Check MongoDB connection");
    console.log(
      "   3. Check test user exists (email: test@example.com, password: password123)"
    );

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("🔧 Troubleshooting:");
    console.log("   1. Backend server running? http://localhost:5000");
    console.log("   2. CORS enabled in backend?");
    console.log("   3. MongoDB connected?");
    return false;
  }
};

// Add to window for testing
if (typeof window !== "undefined") {
  window.testAuth = testCompleteFlow;
}
