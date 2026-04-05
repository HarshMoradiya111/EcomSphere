const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecomsphere');
    const existing = await Admin.findOne({ username: 'admin' });
    if (!existing) {
        const admin = new Admin({
            username: 'admin',
            email: 'admin@ecomsphere.com',
            password: 'password123'
        });
        await admin.save();
        console.log('✅ Default Admin Created: admin / password123');
    } else {
        console.log('Admin already exists.');
    }
    process.exit();
};

seed();
