const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database");

const Badge = sequelize.define("Badge", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING, 
    defaultValue: "🏆",
  },
  trainerName: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

module.exports = Badge;