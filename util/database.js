// Sequelize instance passing the connection paramenters separately to the Sequelize constructor
const Sequelize = require('sequelize')

//Passing parameters separately using dialect
const sequelize = new Sequelize('job-search', 'root', 'Dublin2024', {
  dialect: 'mysql',
  host:'localhost',
  logging: false,
})

module.exports = sequelize;