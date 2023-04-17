const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Downloadfile = sequelize.define("downloadfile", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    autoIncrement: true,
    primaryKey: true,
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Downloadfile;
