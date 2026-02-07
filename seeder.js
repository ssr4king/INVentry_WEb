const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const colors = require('colors'); // Removed dependency
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        console.log('Checking for Admin User...');
        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
            });
            console.log('✅ Admin User Created: admin@example.com / password123');
        } else {
            console.log('ℹ️ Admin User already exists');
        }

        console.log('Checking for Employee User...');
        // Check if employee exists
        const employeeExists = await User.findOne({ email: 'employee@example.com' });

        if (!employeeExists) {
            await User.create({
                name: 'Employee User',
                email: 'employee@example.com',
                password: 'password123',
                role: 'employee',
            });
            console.log('✅ Employee User Created: employee@example.com / password123');
        } else {
            console.log('ℹ️ Employee User already exists');
        }

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

importData();
