const mongoose = require('mongoose');
const { hashSync } = require('bcryptjs');
require('dotenv').config();

// Import the admin model
const { adminModel } = require('./models/admin.model');

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingUser = await adminModel.findOne({ userName: 'admin' });
        if (existingUser) {
            console.log('Admin user already exists!');
            console.log('Username: admin');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Create test admin user
        const hashedPassword = hashSync('admin123', 10);
        
        const testAdmin = new adminModel({
            userName: 'admin',
            email: 'admin@gym.com',
            role: 'admin',
            mobile: 1234567890,
            hash: hashedPassword,
        });

        await testAdmin.save();
        
        console.log('✅ Test admin user created successfully!');
        console.log('🔐 Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Role: admin');
        console.log('');
        console.log('🌐 You can now sign in at: http://localhost:3002/signin');
        
    } catch (error) {
        console.error('❌ Error creating test user:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

createTestUser();
