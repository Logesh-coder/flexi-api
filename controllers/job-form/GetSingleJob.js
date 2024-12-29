const Job = require("../../models/CreateJobForm");
const ApplyJobModel = require("../../models/ApplyJobModel");
const { findUserByToken } = require("../../utils/TokenFuncations");

exports.GetSingleJobs = async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        if (!token) {
          return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
          });
        }

        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
          return res.status(400).json({
            success: false,
            message: "Authorization header with Bearer token is required",
          });
        }

        const findToken = await findUserByToken(token)

        if (!findToken?.success) {
            return res.status(400).json({
              success: false,
              message: findToken.message
            });
        }

        const singleId = req.params.id;

        const job = await Job.findById(singleId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        const application = await ApplyJobModel.findOne({
            jobId: singleId, 
            userId: findToken?.user?._id 
        });


        const findAlredyAppled = application ? true : false

        res.status(200).json({
            success: true,
            message: "Successfully retrieved single job",
            data: {
                job,
                alreadyApplied: findAlredyAppled
            },
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};