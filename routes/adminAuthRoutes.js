const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  registerAdmin,
  loginAdmin,
  verifyToken
} = require("../controllers/admin/adminAuthControllers");
const upload = multer();

router.route("/register").post(upload.none(), registerAdmin);
router.route("/login").post(upload.none(), loginAdmin);
router.route("/verifyToken").get(upload.none(), verifyToken);

module.exports = router;