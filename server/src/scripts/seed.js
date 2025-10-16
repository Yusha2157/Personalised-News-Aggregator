import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { User } from '../models/User.js';

// Load environment variables
config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/news-aggregator');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo user using updateOne to bypass pre-save hook
    const demoPassword = await bcrypt.hash('password123', 12);
    await User.updateOne(
      { email: 'demo@example.com' },
      {
        name: 'Demo User',
        email: 'demo@example.com',
        password: demoPassword,
        role: 'user'
      },
      { upsert: true }
    );
    console.log('Created demo user: demo@example.com / password123');

    // Create admin user using updateOne to bypass pre-save hook
    const adminPassword = await bcrypt.hash('admin123', 12);
    await User.updateOne(
      { email: 'admin@example.com' },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin'
      },
      { upsert: true }
    );
    console.log('Created admin user: admin@example.com / admin123');

    // Create regular user using updateOne to bypass pre-save hook
    const userPassword = await bcrypt.hash('user123', 12);
    await User.updateOne(
      { email: 'john@example.com' },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user'
      },
      { upsert: true }
    );
    console.log('Created regular user: john@example.com / user123');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Available login credentials:');
    console.log('┌─────────────────────┬──────────────┬──────────┐');
    console.log('│ Email               │ Password     │ Role     │');
    console.log('├─────────────────────┼──────────────┼──────────┤');
    console.log('│ demo@example.com    │ password123  │ user     │');
    console.log('│ admin@example.com   │ admin123     │ admin    │');
    console.log('│ john@example.com    │ user123      │ user     │');
    console.log('└─────────────────────┴──────────────┴──────────┘');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the seed function
seedUsers();
