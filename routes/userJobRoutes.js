const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const { createJobForm } = require("../controllers/job-form/CreateJobForm");
const { getJobs } = require("../controllers/job-form/GetJob");
const { GetSingleJobs } = require("../controllers/job-form/GetSingleJob");
const { userApplyJobForm } = require("../controllers/user/userJobApply");

router.route("/jobPostForm").post(upload.none(), createJobForm); 
router.route("/getJobs").get(getJobs); 
router.route("/getSingleJobs/:id").get(GetSingleJobs);
router.route("/userApplyJob").post(upload.none(), userApplyJobForm)

module.exports = router;