const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const PublishedItem = sequelize.define('publishedItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
})

module.exports = PublishedItem;