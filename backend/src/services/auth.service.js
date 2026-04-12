const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (userData) => {
    const { username, email, password } = userData;
    const existingUser = await User.findOne({ 
        $or: [{ email: email.toLowerCase() }, { username: username.trim() }] 
    });
    
    if (existingUser) {
        throw new Error('User already exists');
    }

    const user = new User({
        username: username.trim(),
        email: email.toLowerCase(),
        password
    });

    return await user.save();
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid email or password');
    }
    return user;
};

module.exports = {
    registerUser,
    loginUser
};
