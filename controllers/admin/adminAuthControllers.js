const adminAuth = require("../../models/adminAuthModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    const existingAdmin = await adminAuth.findOne({ email, mobile });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "admin already registered with this email or password",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new adminAuth({
      ...req.body,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "admin registered successfully",
      data: newAdmin,
    });
  } catch (error) {
    console.error("Error during admin registration:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminLogin = await adminAuth.findOne({ email });

    if (!adminLogin) {
      return res.status(401).json({
        success: false,
        message: "Please enter a email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, adminLogin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: adminLogin._id, email: adminLogin.email },
      process.env.SECRET_KEY,
      { expiresIn: "8h" }
    );

    // Store the token in the database
    adminLogin.token = token;
    await adminLogin.save();

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
    });
  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization header with Bearer token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const admin = await adminAuth.findOne({ token });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Admin not found",
      });
    }

    // let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      console.error("JWT verification failed:", err);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Token is valid
    res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during token verification",
      error: error.message,
    });
  }
};
