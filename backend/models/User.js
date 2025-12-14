const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic User Data
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // 👇 THE CART LOGIC (Essential for your fix)
  cart: [
    {
      sweet: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Sweet' // Links to your Sweet inventory
      },
      quantity: { type: Number, default: 1 }
    }
  ]
});

// Password Hashing Middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password Comparison Method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);