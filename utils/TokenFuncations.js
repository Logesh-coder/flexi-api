const jwt = require("jsonwebtoken");
const userAuth = require("../models/userAuthModel"); 

const findUserByToken = async (token) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY); 
    } catch (err) {
      console.error("JWT verification failed:", err);
      return {
        success: false,
        message: "Invalid or expired token"
      };
    }

    const user = await userAuth.findOne({ _id: decoded.userId });

    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }

    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while verifying user",
      error: error.message
    };
  }
};

module.exports = { findUserByToken };