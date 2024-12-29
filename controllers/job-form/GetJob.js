// controllers/job-form/GetJob.js
const Job = require("../../models/CreateJobForm")

exports.getJobs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); 

        const jobs = await Job.find().limit(limit);

        res.status(200).json({
            success: true,
            message: "Jobs data retrieved successfully",
            data: jobs,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve jobs data",
            error: error.message,
        });
    }
};