const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const UserCart = sequelize.define('userCart', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
})

module.exports = UserCart;