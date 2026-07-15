const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database");

const BMI = sequelize.define("BMI", {
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  bmi: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = BMI;
