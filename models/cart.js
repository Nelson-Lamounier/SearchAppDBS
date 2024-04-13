// Model for the Cart => will be used for creating a section where created post will be sumitted to the main page => Show how the post will look like once is published on the main page => Work as layer between editing the post and publishing the new created post
const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Cart = sequelize.define('cart', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
})

module.exports = Cart;