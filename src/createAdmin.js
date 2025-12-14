const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config({ path: './.env' });

const DB = process.env.MONGO_URI || 'mongodb://localhost:27017/learning-platform';

mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful!'))
    .catch((err) => {
        console.error('DB Connection Failed:', err.message);
        process.exit(1);
    });

const createAdmin = async () => {
    try {
        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
            // Update password just in case
            existingAdmin.password = 'password123';
            existingAdmin.passwordConfirm = 'password123';
            await existingAdmin.save();
            console.log('Admin password reset to: password123');
        } else {
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'password123',
                passwordConfirm: 'password123',
                role: 'admin',
            });
            console.log('Admin user created successfully!');
            console.log('Email: admin@example.com');
            console.log('Password: password123');
        }
    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        process.exit();
    }
};

createAdmin();
