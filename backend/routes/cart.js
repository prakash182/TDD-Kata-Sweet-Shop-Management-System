// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Sweet = require('../models/Sweet');
const { authMiddleware } = require('../middleware/auth');

// 1. Get MY Cart (User specific)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Find the cart belonging to the currently logged-in user
    let cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
        // If no cart exists, return an empty one or create it
        return res.json({ items: [], totalPrice: 0 });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Add Item to Cart
router.post('/add', authMiddleware, async (req, res) => {
  const { sweetId, quantity } = req.body;
  const userId = req.user.userId; // EXTRACTED FROM TOKEN

  try {
    // Check if product exists
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) return res.status(404).json({ error: 'Product not found' });

    // Find user's cart or create new one
    let cart = await Cart.findOne({ userId });
    
    if (cart) {
      // Cart exists, check if item is already in it
      const itemIndex = cart.items.findIndex(p => p.sweetId == sweetId);

      if (itemIndex > -1) {
        // Product exists in cart, update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Product not in cart, push new item
        cart.items.push({ sweetId, quantity, price: sweet.price, name: sweet.name });
      }
    } else {
      // No cart for user, create new one
      cart = new Cart({
        userId,
        items: [{ sweetId, quantity, price: sweet.price, name: sweet.name }]
      });
    }
    
    // Recalculate total price could be done here
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;