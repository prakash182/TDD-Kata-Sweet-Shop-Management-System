const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Sweet name is required"], 
    trim: true // 🧹 Auto-removes extra spaces
  },
  category: { 
    type: String, 
    required: [true, "Category is required"],
    // 🛡️ ENUM: Forces consistency. No "choc" vs "Chocolate" typos allowed.
    enum: {
      values: ['chocolate', 'candy', 'gummy', 'hard candy', 'lollipop', 'traditional'],
      message: '{VALUE} is not a valid category'
    }
  },
  price: { 
    type: Number, 
    required: true, 
    min: [0, "Price cannot be negative"] // 🛡️ Security: Prevents negative prices
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: [0, "Stock cannot be negative"] // 🛡️ Security: Prevents negative stock
  },
  image: { 
    type: String, 
    // 🎨 Royal Default: If no image is provided, use a nice placeholder
    default: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=500&q=60' 
  },
  description: { 
    type: String, 
    default: '',
    maxLength: [500, "Description is too long (max 500 chars)"]
  },
}, { timestamps: true });

module.exports = mongoose.model('Sweet', sweetSchema);