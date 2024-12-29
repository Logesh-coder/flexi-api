const createJobForm = require("../../models/CreateJobForm")
const { findUserByToken } = require("../../utils/TokenFuncations");

exports.createJobForm = async (req, res) => {
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
        
        const { title, description, payRate, date, durationStartTime, durationEndTime, location, city, landMark} = req.body

        const createUserId = findToken?.user?._id

        if (!title || !description || !date || !payRate || !durationStartTime || !durationEndTime || !location || !city || !landMark) {
          return res.status(400).json({
            success: false,
            message: "All fields are required."
          });
        }

        const newJob = new createJobForm({
            title,
            description,
            date,
            payRate,
            durationStartTime,
            durationEndTime,
            location,
            city,
            landMark,
            createUserId
        });

      await newJob.save();

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: newJob
      });

    } catch (error) {
      console.error("Error during admin registration:", error);

      res.status(500).json({
        success: false,
        message: "An error occurred during registration",
        error: error.message,
      });
    }
}