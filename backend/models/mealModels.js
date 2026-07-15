const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database");

const Meal = sequelize.define("Meal", {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  protein: {
    type: DataTypes.FLOAT,
  },
  carbs: {
    type: DataTypes.FLOAT,
  },
  fats: {
    type: DataTypes.FLOAT,
  },
 
  calories: {
    type: DataTypes.INTEGER, 
  }
});

module.exports = Meal;