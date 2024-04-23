const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
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
  resetToken: {
    type: Sequelize.STRING,
    allowNull: true
  
  },
  resetTokenExpiration: {
    type: Sequelize.DATE,
    defaultValue: Date.now() +  43200,
    allowNull: true
  }

});

// User.prototype.addToCart = function(post) {
//   const cartPostIndex = this.cart.items.findIndex(cp => {
//     return cp.postId.toString() === post._id.toString();
//   });
//   if (cartPostIndex >=0) {
//     updatedCartItems[cartPostIndex];
//   } else {
//     updatedCartItems.push({postId: post._id})
//   }
//   const updatedCart = {
//     items: updatedCartItems
//   }
//   this.cart = updatedCart;
//   return this.save();
// }

// User.prototype.removeFromCart = function(postId) {
//   const updatedCartItems = this.cart.item.filter(item => {
//     return item.postId.toString() !== postId.toString();
//   })
//   this.cart.items = updatedCartItems;
//   return this.save();
// }

// User.prototype.clearCart = function() {
//   this.cart = {items: []};
//   return this.save()
// }

module.exports = User;