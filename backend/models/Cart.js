// models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Ensures one cart per user
  },
  items: [
    {
      sweetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sweet' },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
      name: { type: String } // Optional: saves a DB lookup later
    }
  ],
  totalPrice: { type: Number, default: 0 }
});

module.exports = mongoose.model('Cart', CartSchema);