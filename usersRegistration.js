const axios = require("axios");

const API_URL = "http://127.0.0.1:8000/app/user/"; // Adjust based on your Django API endpoint

const testUser = async () => {
    const userData = {
        email: "jalcantarabedtc@gmail.com",
        password: "SecurePassword123",
        first_name: "Test",
        last_name: "User",
        date_of_birth: "1995-05-20"
    };

    try {
        console.log("🔄 Sending request to register user...");
        
        const response = await axios.post(API_URL, userData, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        console.log("✅ User created successfully!");
        console.log("📌 Response Data:", response.data);
        
    } catch (error) {
        console.error("❌ Error creating user:", error.response?.data || error.message);
        
        // Extra Debugging Information
        if (error.response) {
            console.error("⚠️ Status Code:", error.response.status);
            console.error("⚠️ Response Headers:", error.response.headers);
            console.error("⚠️ Response Data:", error.response.data);
        } else if (error.request) {
            console.error("⚠️ No response received:", error.request);
        } else {
            console.error("⚠️ Request setup error:", error.message);
        }
    }
};

testUser();
