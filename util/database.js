const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB, "root", process.env.PASSWORD, {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
