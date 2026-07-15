const Register = require("../models/userModels");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");




const sendEmail = async(to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `Fitness App <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

const verifyEmail = async(req, res) => {
    try{
        const {token} = req.query;

        if(!token){
            return res.status(400).json({
                message : "token missing"
            });
        }

        const user = await Register.findOne({where: {verificationToken: token}});

        if(!user){
            return res.status(400).json({
                message: "Invalid token",
                token: token
            });
        }

   
        if(user.verificationTokenExpires < new Date()){
            return res.status(400).json({
                message: "Token expired. Retry"
            })
        }


        
        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;

        await user.save();

        return res.status(200).json({
            message: "Email verified successfully"
        })

    }catch(error){
        return res.status(404).json({
            message : "something went wrong in verifyemail",
            error: error.message
        })
    }
}

module.exports = {verifyEmail, sendEmail};