const express = require("express");
const { registerUser, loginUser, forgotPassword, resetPassword, verifyToken } = require("../controllers/user/userAuthControllers");
const router = express.Router();
const multer = require("multer");
const upload = multer();

router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(upload.none(), loginUser); 
router.route("/forgot").post(upload.none(), forgotPassword); 
router.route("/reset").post(upload.none(), resetPassword); 
router.route("/verifyToken").get(upload.none(), verifyToken); 

module.exports = router;