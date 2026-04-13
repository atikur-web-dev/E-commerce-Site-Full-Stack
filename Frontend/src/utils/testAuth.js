// Frontend/src/utils/testAuth.js
import { authAPI } from "../services/api";

export const testAuthAPI = async () => {
  console.log("🔐 Testing Authentication API...");

  // Test data
  const testUser = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "password123",
  };

  try {
    // 1. Test registration
    console.log("1. Testing registration...");
    const registerResult = await authAPI.register(testUser);
    console.log("✅ Registration response:", registerResult);

    // 2. Test login
    console.log("2. Testing login...");
    const loginResult = await authAPI.login({
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login response:", loginResult);

    // 3. Test profile
    console.log("3. Testing profile...");
    const profile = await authAPI.getProfile();
    console.log("✅ Profile response:", profile);

    console.log("🎉 All auth tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Auth test failed:", error.message);
    return false;
  }
};

// Add to window for manual testing
if (typeof window !== "undefined") {
  window.testAuthAPI = testAuthAPI;
}
