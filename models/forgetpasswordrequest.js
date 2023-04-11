const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("./../util/database"); // replace this with your Sequelize instance

const Frequest = sequelize.define("frequest", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
});

Frequest.beforeCreate((request) => {
  request.id = uuidv4(); // generate a UUID for the id field before creating a new Request
});

module.exports = Frequest;
