const axios = require("axios");

const loginUser = async () => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/app/login/", {  // Check if /app/ is needed
      email: "jalcantarabedtc@gmail.com",
      password: "SecurePassword123"
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("Login successful!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error logging in:", error.response ? error.response.data : error.message);
  }
};

loginUser();
