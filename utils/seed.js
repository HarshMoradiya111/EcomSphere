require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomsphere');
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await Admin.findOne({ username: adminUsername });
  if (existing) {
    console.log('ℹ️  Admin already exists, skipping...');
    return;
  }

  const admin = new Admin({
    username: adminUsername,
    email: adminEmail,
    password: adminPassword,
  });

  await admin.save();
  console.log(`✅ Admin created: ${adminUsername} / ${adminEmail}`);
};

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  ${count} products already exist, skipping product seed...`);
    return;
  }

  const products = [
    // Men Clothing
    {
      name: "Classic Oxford Button-Down Shirt",
      description: "A timeless Oxford shirt perfect for both casual and formal occasions. Made from 100% premium cotton.",
      price: 1499,
      image: "placeholder.jpg",
      category: "Men Clothing",
    },
    {
      name: "Slim Fit Chino Trousers",
      description: "Comfortable slim-fit chinos ideal for everyday wear. Available in multiple colors.",
      price: 1999,
      image: "placeholder.jpg",
      category: "Men Clothing",
    },
    {
      name: "Graphic Print Casual T-Shirt",
      description: "Trendy graphic tee made from soft cotton blend. Perfect for a casual day out.",
      price: 799,
      image: "placeholder.jpg",
      category: "Men Clothing",
    },
    // Women Clothing
    {
      name: "Floral Wrap Dress",
      description: "Elegant floral wrap dress perfect for spring and summer. Features a flattering silhouette.",
      price: 2499,
      image: "placeholder.jpg",
      category: "Women Clothing",
    },
    {
      name: "High-Waist Skinny Jeans",
      description: "Trendy high-waist skinny jeans that provide a perfect fit and maximum comfort.",
      price: 2199,
      image: "placeholder.jpg",
      category: "Women Clothing",
    },
    {
      name: "Bohemian Maxi Skirt",
      description: "Flowy bohemian maxi skirt with beautiful prints. Perfect for beach or casual outings.",
      price: 1699,
      image: "placeholder.jpg",
      category: "Women Clothing",
    },
    // Footwear
    {
      name: "Classic White Sneakers",
      description: "Versatile white sneakers that pair with almost any outfit. Comfortable for all-day wear.",
      price: 2999,
      image: "placeholder.jpg",
      category: "Footwear",
    },
    {
      name: "Leather Oxford Shoes",
      description: "Premium leather Oxford shoes for a sophisticated look. Hand-crafted with durable materials.",
      price: 4499,
      image: "placeholder.jpg",
      category: "Footwear",
    },
    {
      name: "Casual Sports Sandals",
      description: "Lightweight sports sandals perfect for outdoor adventures. Water-resistant and durable.",
      price: 1299,
      image: "placeholder.jpg",
      category: "Footwear",
    },
    // Glasses
    {
      name: "Aviator Sunglasses",
      description: "Classic aviator sunglasses with UV400 protection. Timeless style for any face shape.",
      price: 1199,
      image: "placeholder.jpg",
      category: "Glasses",
    },
    {
      name: "Wayfarer Style Frames",
      description: "Iconic wayfarer frames perfect for prescription or non-prescription lenses.",
      price: 999,
      image: "placeholder.jpg",
      category: "Glasses",
    },
    // Cosmetics
    {
      name: "Hydrating Face Serum",
      description: "Vitamin C enriched face serum that brightens and hydrates skin. Dermatologist tested.",
      price: 1599,
      image: "placeholder.jpg",
      category: "Cosmetics",
    },
    {
      name: "Matte Lipstick Collection",
      description: "Premium matte lipstick with long-lasting formula. Available in 12 stunning shades.",
      price: 499,
      image: "placeholder.jpg",
      category: "Cosmetics",
    },
    {
      name: "SPF 50 Sunscreen Lotion",
      description: "Broad spectrum SPF 50 sunscreen that protects from UVA/UVB rays. Lightweight formula.",
      price: 899,
      image: "placeholder.jpg",
      category: "Cosmetics",
    },
  ];

  await Product.insertMany(products);
  console.log(`✅ ${products.length} sample products created`);
};

const seedTestUser = async () => {
  const existing = await User.findOne({ email: 'harshmoradiya@gmail.com' });
  if (existing) {
    console.log('ℹ️  Test user already exists, skipping...');
    return;
  }

  const user = new User({
    username: 'harshmoradiya',
    email: 'harshmoradiya@gmail.com',
    password: 'test1234',
  });
  await user.save();
  console.log('✅ Test user created: harshmoradiya@gmail.com / test1234');
};

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Starting database seed...\n');

  await seedAdmin();
  await seedProducts();
  await seedTestUser();

  console.log('\n✅ Seeding complete!\n');
  console.log('🔑 Admin credentials:');
  console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log('\n👤 Test user credentials:');
  console.log('   Email: harshmoradiya@gmail.com');
  console.log('   Password: test1234\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
