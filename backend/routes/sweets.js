const express = require('express');
const router = express.Router();
const Sweet = require('../models/Sweet');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Function to generate AI-based image URL
const generateAIImageURL = (productName) => {
  const prompt = encodeURIComponent(`${productName} sweet candy confectionery food photography high quality`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${Math.floor(Math.random() * 1000)}`;
};

// 1. Add sweet (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!req.body.image && req.body.name) {
      req.body.image = generateAIImageURL(req.body.name);
    }
    const sweet = await Sweet.create(req.body);
    res.status(201).json({ sweet });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add sweet' });
  }
});

// 2. List all sweets (Public or Auth, depending on your needs)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.status(200).json({ sweets });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Search sweets (Fixed: Fuzzy search + Case Insensitive)
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    let query = {};

    // FIX: Using Regex for partial matching (e.g., "choco" finds "Chocolate")
    if (name) query.name = { $regex: name, $options: 'i' };
    if (category) query.category = category;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(query);
    res.status(200).json({ sweets });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// 4. NEW: Get Single Sweet Details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
    res.status(200).json({ sweet });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

// 5. Update sweet (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.body.name && !req.body.image) {
      req.body.image = generateAIImageURL(req.body.name);
    }
    const sweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
    res.status(200).json({ sweet });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update sweet' });
  }
});

// 6. Delete sweet (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
    res.status(200).json({ message: 'Sweet deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete sweet' });
  }
});

// 7. Purchase sweet (Fixed: Negative Quantity Exploit)
router.post('/:id/purchase', authMiddleware, async (req, res) => {
  try {
    let { quantity } = req.body;
    
    // FIX: Ensure quantity is a positive integer
    quantity = parseInt(quantity);
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });

    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    sweet.quantity -= quantity;
    await sweet.save();
    res.status(200).json({ sweet });
  } catch (err) {
    res.status(400).json({ error: 'Failed to purchase sweet' });
  }
});

// 8. Restock sweet (Admin only)
router.post('/:id/restock', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let { quantity } = req.body;
    
    // FIX: Ensure positive restock value
    quantity = parseInt(quantity);
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });

    sweet.quantity += quantity;
    await sweet.save();
    res.status(200).json({ sweet });
  } catch (err) {
    res.status(400).json({ error: 'Failed to restock sweet' });
  }
});

module.exports = router;