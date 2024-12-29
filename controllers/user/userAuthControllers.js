const userAuth = require("../../models/userAuthModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.registerUser = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    const existingUser = await userAuth.findOne({ email, mobile });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered with this email or password",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new userAuth({
      ...req.body,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Error during user registration:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userLogin = await userAuth.findOne({ email });

    if (!userLogin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, userLogin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: userLogin._id, email: userLogin.email },
      process.env.SECRET_KEY, // Replace with your secret key
      { expiresIn: "8h" } // Token expires in 1 hour
    );

    // Store the token in the database
    userLogin.token = token;
    await userLogin.save();

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userAuth.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const resetLink = `https://your-frontend-url/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: email,
      to: user.email,
      subject: "Password Reset",
      html: `<p>You requested a password reset</p>
             <p>Click this <a href="${resetLink}">link</a> to reset your password.</p>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    user.resetPasswordToken = resetToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset request",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validate that the password fields are not empty
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password fields cannot be empty",
      });
    }

    // Validate if both passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Validate the presence of the token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    console.log("token in check", token);

    // Find the user with the token and ensure the token has not expired
    const user = await userAuth.findOne({
      token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token user",
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password and clear the reset token and expiration time
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset",
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

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Find the user with the provided token
    const user = await userAuth.findOne({ token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify the token using JWT and get the decoded payload
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
      data: {
        userId: user._id,
        email: user.email,
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during token verification",
      error: error.message,
    });
  }
};