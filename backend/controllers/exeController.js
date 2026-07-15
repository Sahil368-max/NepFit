const WorkoutLog = require("../models/exeModels");

const saveWorkout = async (req, res) => {
  try {
    
    const { userId, dateString, completedExercises, dailyGoal } = req.body;

    let log = await WorkoutLog.findOne({ 
        where: { userId: userId, dateString: dateString } 
    });

    if (log) {
      log.completedExercises = completedExercises;
      log.dailyGoal = dailyGoal || log.dailyGoal;
      await log.save();
    } else {
      log = await WorkoutLog.create({
        userId,
        dateString,
        completedExercises,
        dailyGoal
      });
    }

    return res.status(200).json({ success: true, log });
  } catch (error) {
    console.error("Save Workout Error:", error);
    return res.status(500).json({ message: "Failed to save workout" });
  }
};

const getWorkouts = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await WorkoutLog.findAll({
      where: { userId: userId }
    });

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Get Workouts Error:", error);
    return res.status(500).json({ message: "Failed to fetch workouts" });
  }
};

module.exports = { saveWorkout, getWorkouts };