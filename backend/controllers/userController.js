const RegisterUser = require("../models/userModels");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utlis/verifyEmail");

const BMI = require("../models/bmiModels"); 
const Meal = require("../models/mealModels");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await RegisterUser.findOne({ where: { username } });
    const emailExists = await RegisterUser.findOne({ where: { email } });
    
    if (userExists) return res.status(400).json({ message: `${username} already exists` });
    if (emailExists) return res.status(400).json({ message: `Email already registered` });

    const hashedpassword = bcrypt.hashSync(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); 

    const assignedRole = role === 'trainer' ? 'trainer' : 'user';

    const createUser = await RegisterUser.create({
      username,
      email,
      password: hashedpassword,
      role: assignedRole, 
      verificationToken,
      verificationTokenExpires,
      isVerified: false 
    });

    const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`; 

    await sendEmail(
      email,
      "Verify your account",
      `<h1>Welcome to STRIDE.FIT!</h1> <a href="${verifyLink}">Click here to verify your account</a>`
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify.",
      user: { username: createUser.username, email: createUser.email, role: createUser.role }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal server error during registration" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or password cannot be empty" });
    }

    const user = await RegisterUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: `No user found with this email` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { 
            id: user.id,
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error during login" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await RegisterUser.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Password Reset Request - STRIDE.FIT",
      `<h2>Reset Your Password</h2>
       <p>We received a request to reset your password. Click the link below to create a new one:</p>
       <a href="${resetLink}">Reset Password</a>
       <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
    );

    return res.status(200).json({ message: "Password reset email sent successfully!" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Failed to send reset email" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user = await RegisterUser.findOne({ where: { resetPasswordToken: token } });

    if (!user || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful! You can now log in." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal server error during password reset" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, username, email } = req.body;
    
    const user = await RegisterUser.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username !== user.username) {
      const nameExists = await RegisterUser.findOne({ where: { username } });
      if (nameExists) return res.status(400).json({ message: "Username already taken" });
    }
    if (email !== user.email) {
      const emailExists = await RegisterUser.findOne({ where: { email } });
      if (emailExists) return res.status(400).json({ message: "Email already taken" });
    }

    user.username = username;
    user.email = email;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "Profile updated!", 
      user: { id: user.id, username: user.username, email: user.email, role: user.role } 
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    
    const user = await RegisterUser.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully!" });

  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({ message: "Failed to update password" });
  }
};

const getTrainerClients = async (req, res) => {
  try {
    const clients = await RegisterUser.findAll({ 
        where: { role: 'user' }, 
        attributes: ['id', 'username', 'email'] 
    });
    
    const clientsWithData = await Promise.all(clients.map(async (client) => {
        let currentBmi = "N/A";
        let goal = "Maintain";
        let totalCalories = 0;

        try {
            const bmiRecord = await BMI.findOne({ 
                where: { userId: client.id }, 
                order: [['createdAt', 'DESC']] 
            });
            
            if (bmiRecord) {
                currentBmi = bmiRecord.bmi;
                if (currentBmi < 18.5) goal = "Gain Mass";
                else if (currentBmi >= 25) goal = "Lose Weight";
            }

            const meals = await Meal.findAll({ where: { userId: client.id } });
            totalCalories = meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);

        } catch (err) {
            console.log(`\n❌ ERROR FETCHING DATA FOR ${client.username}:`);
            console.log(err.message); 
            console.log("-------------------------------------------\n");
        }

        return {
            id: client.id,
            name: client.username,
            email: client.email,
            bmi: currentBmi,
            calories: totalCalories,
            goal: goal,
            avatar: client.username.charAt(0).toUpperCase()
        };
    }));

    return res.status(200).json({ success: true, data: clientsWithData });

  } catch (error) {
    console.error("Trainer Clients Error:", error);
    return res.status(500).json({ message: "Failed to fetch clients data" });
  }
};

const getClientHistory = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const client = await RegisterUser.findOne({ 
        where: { id: clientId, role: 'user' },
        attributes: ['id', 'username', 'email']
    });
    
    if (!client) {
        return res.status(404).json({ message: "Client not found" });
    }

    const bmiHistory = await BMI.findAll({ 
        where: { userId: clientId }, 
        order: [['createdAt', 'DESC']] 
    });

    const mealHistory = await Meal.findAll({ 
        where: { userId: clientId }, 
        order: [['createdAt', 'DESC']] 
    });

    return res.status(200).json({ 
        success: true, 
        clientName: client.username,
        bmiHistory, 
        mealHistory 
    });

  } catch (error) {
    console.error("Client History Error:", error);
    return res.status(500).json({ message: "Failed to fetch client history" });
  }
};

module.exports = { registerUser, userLogin, forgotPassword, resetPassword, updateProfile, updatePassword, getTrainerClients, getClientHistory };