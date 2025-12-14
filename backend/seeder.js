const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sweet = require('./models/Sweet'); 

// Force load the .env file
const result = dotenv.config();

if (result.error) {
  console.log("❌ Error loading .env file:", result.error);
  process.exit(1);
}

// Debug Print (Masking the password for security)
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.log("❌ FATAL: MONGODB_URI is undefined."); 
    console.log("   -> Did you save the .env file?");
    console.log("   -> Is the variable named 'MONGODB_URI' inside it?");
    process.exit(1);
} else {
    console.log(`✅ Found Connection String: ${uri.substring(0, 20)}...`);
}

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB Connected for Seeding'))
  .catch((err) => {
    console.error("❌ Connection Error:", err);
    process.exit(1);
  });

const royalSweets = [
  {
    name: "Royal Kaju Katli",
    category: "traditional",
    price: 850,
    quantity: 50,
    description: "Premium cashew fudge topped with pure edible silver leaf.",
    image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=800"
  },
  {
    name: "Saffron Rasmalai",
    category: "traditional",
    price: 450,
    quantity: 30,
    description: "Soft cottage cheese dumplings soaked in saffron-infused milk.",
    image: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=800"
  },
  {
    name: "Mysore Pak",
    category: "traditional",
    price: 600,
    quantity: 40,
    description: "Melt-in-your-mouth ghee fudge from the palaces of Mysore.",
    image: "https://images.unsplash.com/photo-1605197585666-27e189dbe56d?auto=format&fit=crop&w=800"
  },
  {
    name: "Gulab Jamun",
    category: "traditional",
    price: 350,
    quantity: 60,
    description: "Deep-fried milk solids soaked in rose-cardamom sugar syrup.",
    image: "https://images.unsplash.com/photo-1593466100140-5e360938db4f?auto=format&fit=crop&w=800"
  },
  {
    name: "Dark Chocolate Truffle",
    category: "chocolate",
    price: 1200,
    quantity: 20,
    description: "Handcrafted dark chocolate ganache dusted with cocoa.",
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800"
  }
];

const importData = async () => {
  try {
    await Sweet.deleteMany(); 
    console.log('🗑️  Old sweets removed...');

    await Sweet.insertMany(royalSweets);
    console.log('👑 Royal Sweets Imported Successfully!');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

importData();