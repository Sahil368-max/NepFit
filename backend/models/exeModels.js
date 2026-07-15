const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database");

const WorkoutLog = sequelize.define(
    "WorkoutLog",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            
            references: {
                model: 'users', 
                key: 'id'
            }
        },
        dateString: {
            type: DataTypes.STRING,
            allowNull: false,
            
        },
        completedExercises: {
            type: DataTypes.JSON, 
            defaultValue: []
            
        },
        dailyGoal: {
            type: DataTypes.STRING,
            allowNull: true
            
        }
    },
    {
        timestamps: true,
        tableName: "workout_logs"
    }
);

module.exports = WorkoutLog;