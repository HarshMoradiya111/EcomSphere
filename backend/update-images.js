const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const images = ['f1.jpg', 'f2.jpg', 'f3.jpg', 'f4.jpg', 'f5.jpg', 'f6.jpg', 'f8.jpg', 'n2.jpg', 'n3.jpg', 'n4.jpg', 'n5.jpg', 'n7.jpg', 'n8.jpg'];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomsphere').then(async () => {
  const products = await Product.find({});
  for (let i = 0; i < products.length; i++) {
    products[i].image = images[i % images.length];
    await products[i].save();
  }
  console.log('✅ Re-mapped database product images to real files (f1.jpg, etc)');
  process.exit(0);
});
