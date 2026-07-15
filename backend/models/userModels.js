const {DataTypes} = require ("sequelize");
const {sequelize} = require ("../database/database");

const Register = sequelize.define(
    "Users",
    {
        id:{    
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        username:{
            type:DataTypes.STRING,
            unique:true
        },
        email:{
            type:DataTypes.STRING,
            unique:true
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false
        },
        
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user', 
            validate: {
                isIn: [['user', 'trainer']] 
            }
        },
        isVerified:{
            type :DataTypes.BOOLEAN,
            defaultValue: false
        },
        verificationToken:{
            type:DataTypes.STRING,
            allowNull:true
        },
        verificationTokenExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        timestamps:true,
        tableName:"users"
    }
);

module.exports = Register;