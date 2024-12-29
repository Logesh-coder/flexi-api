const { findUserByToken } = require("../../utils/TokenFuncations");
const ApplyJobForm = require("../../models/ApplyJobModel");
const createJobForm = require("../../models/CreateJobForm")
const userAuthModul = require("../../models/userAuthModel")
const nodemailer = require("nodemailer");

exports.userApplyJobForm = async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const findUser = await findUserByToken(token);

        if (!findUser?.success) {
            return res.status(400).json({
                success: false,
                message: findUser.message
            });
        }

        const userId = findUser?.user?._id;

        const { applyJob_id, payYourAmount } = req.body;

        const existingApplication = await ApplyJobForm.findOne({ userId, applyJob_id });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted an application for this job.'
            });
        }

        const storeApplyJobs = new ApplyJobForm({
            applyJob_id,
            payYourAmount,
            userId
        });

        await storeApplyJobs.save();

        const findJobOwner = await createJobForm.findOne({ _id: applyJob_id}) 

        const findJobPostUserData = await userAuthModul.findOne({_id: findJobOwner?.createUserId}) 

        console.log("findJobOwner", findJobOwner);

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
            from: process.env.MAIL_USERNAME,
            to: findJobPostUserData.email,
            subject: "Applied candidate in your job",
            html: `<h2>Pleace check your job</h2>
                    <h3> Job Title : ${findJobOwner?.title} </h3/>
                   <h3>Click this link : <a href="${process.env.WEBSITE_LINK}">${process.env.WEBSITE_LINK}</a></h3>`,
        };
      
        // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: 'Job application submitted successfully',
            data: storeApplyJobs
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};