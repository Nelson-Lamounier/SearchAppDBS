const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Profile = sequelize.define('profile', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  }, 
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  }, 
  headline: {
    type: Sequelize.STRING,
    allowNull: true,
  }, 
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
    
  },
  uploadCv: {
    type: Sequelize.STRING,
    allowNull: true
  
  },

  resetToken: {
    type: Sequelize.STRING,
    allowNull: true
  
  },
  resetTokenExpiration: {
    type: Sequelize.DATE,
    allowNull: true
  }

});



module.exports = Profile;