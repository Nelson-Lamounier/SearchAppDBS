const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Job = sequelize.define("job", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  salary: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  contract: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  jobUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Job;