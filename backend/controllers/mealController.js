const Meal = require("../models/mealModels");


const addMeal = async (req, res) => {
  const { type, protein, carbs, fats } = req.body;
  const userId = req.user.id;

  if (!type) {
    return res.status(400).json({ message: "Please provide meal type" });
  }

  try {
    const calories = (Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fats) || 0) * 9;

    const meal = await Meal.create({
      type,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fats || 0,
      calories: calories,
      userId: userId,
    });

    return res.status(201).json({ message: "Meal added successfully", data: meal });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const getMeals = async (req, res) => {
  try {
    const userId = req.user.id; 
    const meals = await Meal.findAll({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ data: meals });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const updateMeal = async (req, res) => {
  const { id } = req.params;
  const { type, protein, carbs, fats } = req.body;
  const userId = req.user.id;

  try {
   
    const meal = await Meal.findOne({ where: { id, userId } });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found or unauthorized" });
    }

   
    const newProtein = protein !== undefined ? protein : meal.protein;
    const newCarbs = carbs !== undefined ? carbs : meal.carbs;
    const newFats = fats !== undefined ? fats : meal.fats;
    const newCalories = (Number(newProtein) * 4) + (Number(newCarbs) * 4) + (Number(newFats) * 9);

    await meal.update({
      type: type || meal.type,
      protein: newProtein,
      carbs: newCarbs,
      fats: newFats,
      calories: newCalories
    });

    return res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      data: meal,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteMeal = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const meal = await Meal.findOne({ where: { id, userId } });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found or unauthorized" });
    }

    await Meal.destroy({ where: { id } });
    return res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMeal,
  getMeals,
  updateMeal, 
  deleteMeal,
};