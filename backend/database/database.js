const { Sequelize } = require("sequelize");
require("dotenv").config();
const isTestEnv = process.env.NODE_ENV === "test";
console.log(`Running in ${isTestEnv ? 'Test': 'DEVELOPMENT'}mode.`);

const sequelize = new Sequelize(
  isTestEnv ? process.env.TEST_DB_NAME : process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully ✅");
  } catch (error) {
    console.error("Unable to connect to the database ❌", error);
  }
};

module.exports = { sequelize, connectDB };