const BMI = require("../models/bmiModels");

const addBMI = async (req, res) => {
  const { weight, height } = req.body;
  const userId = req.user.id; 

  if (!weight || !height) {
    return res.status(400).json({
      message: "Please provide weight and height",
    });
  }

  try {
    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    const bmi = await BMI.create({
      weight,
      height,
      bmi: bmiValue,
      userId: userId, 
    });

    return res.status(201).json({
      message: "BMI added successfully",
      data: bmi,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getBMI = async (req, res) => {
  try {
    const userId = req.user.id; 

    const bmi = await BMI.findAll({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      data: bmi,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


const updateBMI = async (req, res) => {
  const { id } = req.params;
  const { weight, height } = req.body;
  const userId = req.user.id;

  try {
   
    const bmiRecord = await BMI.findOne({ where: { id, userId } });

    if (!bmiRecord) {
      return res.status(404).json({
        message: "BMI record not found or unauthorized",
      });
    }

    
    const newHeight = height !== undefined ? parseFloat(height) : bmiRecord.height;
    const newWeight = weight !== undefined ? parseFloat(weight) : bmiRecord.weight;

    
    const heightInMeters = newHeight / 100;
    const newBmiValue = (newWeight / (heightInMeters * heightInMeters)).toFixed(1);

   
    await bmiRecord.update({
      weight: newWeight,
      height: newHeight,
      bmi: newBmiValue,
    });

    return res.status(200).json({
      message: "BMI updated successfully",
      data: bmiRecord,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const deleteBMI = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    
    const bmi = await BMI.findOne({ where: { id, userId } });

    if (!bmi) {
      return res.status(404).json({
        message: "BMI record not found or unauthorized",
      });
    }

    await BMI.destroy({ where: { id } });

    return res.status(200).json({
      message: "BMI deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addBMI,
  getBMI,
  updateBMI, 
  deleteBMI,
};