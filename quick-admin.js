// Simple one-time script to create an admin user
// Run this once: node quick-admin.js

const { MongoClient } = require('mongodb');
const { hashSync } = require('bcryptjs');

async function createQuickAdmin() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        const db = client.db('gym-crm');
        const admins = db.collection('admin');
        
        // Check if admin exists
        const existingAdmin = await admins.findOne({ userName: 'admin' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists!');
            console.log('Username: admin');
            console.log('Password: admin123');
            return;
        }
        
        // Create admin
        const hashedPassword = hashSync('admin123', 10);
        await admins.insertOne({
            userName: 'admin',
            email: 'admin@gym.com',
            role: 'admin',
            mobile: 1234567890,
            hash: hashedPassword,
            createdAt: new Date()
        });
        
        console.log('✅ Admin user created!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('🌐 Sign in at: http://localhost:3002/signin');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

createQuickAdmin();
