const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crackerwebsite');
    console.log('MongoDB Connected for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Seed Admin & Customer
    const adminUser = await User.create({
      name: 'Admin Showroom',
      email: 'admin@sparklersadmin.com',
      password: 'adminpassword', // Will be automatically hashed by User pre-save hook
      role: 'admin',
      isVerified: true,
      phone: '9999999999',
    });

    const testCustomer = await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'customerpassword',
      role: 'customer',
      isVerified: true,
      phone: '8888888888',
      addresses: [{
        street: '123 Festival Avenue',
        city: 'Sivakasi',
        state: 'Tamil Nadu',
        zipCode: '626123',
        isDefault: true
      }]
    });
    console.log('Seeded accounts (Admin & Customer).');

    // 2. Seed Categories
    const categoriesList = [
      { name: 'Sparklers', description: 'Sparkling colorful handheld firework sticks', image: 'https://images.unsplash.com/photo-1545624446-43a72929a033?w=500&q=80' },
      { name: 'Ground Wheels', description: 'Chakras spinning on ground emitting flashes', image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=500&q=80' },
      { name: 'Flower Pots', description: 'Fountains of stars shooting upwards', image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=500&q=80' },
      { name: 'Rockets', description: 'Flying projectiles exploding in the night sky', image: 'https://images.unsplash.com/photo-1531266752426-aad472b7bbf4?w=500&q=80' },
      { name: 'Aerial Shells', description: 'Professional sky bursts and multi-color cracklers', image: 'https://images.unsplash.com/photo-1507502707541-f369a3b18502?w=500&q=80' },
    ];

    const seededCategories = await Category.insertMany(categoriesList);
    console.log('Seeded Categories.');

    // Helper to find category ID
    const getCatId = (name) => seededCategories.find(c => c.name === name)._id;

    // 3. Seed Products
    const productsList = [
      {
        name: 'Golden Sparklers 10cm',
        category: getCatId('Sparklers'),
        brand: 'Sparklers Premium',
        description: 'Classic safe handheld golden sparklers, perfect for kids. Pack of 10.',
        images: ['https://images.unsplash.com/photo-1545624446-43a72929a033?w=800&q=80'],
        stock: 120,
        originalPrice: 150,
        discount: 10, // 10% off
        gst: 18,
        isFeatured: true,
        isTrending: true,
        isTopSelling: true,
        isNewArrival: false,
      },
      {
        name: 'Crimson Crackling Wheels',
        category: getCatId('Ground Wheels'),
        brand: 'Sivakasi Lights',
        description: 'Large size ground chakras with high-speed spinning sparks and crackling sound effects. Pack of 5.',
        images: ['https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&q=80'],
        stock: 80,
        originalPrice: 300,
        discount: 15,
        gst: 18,
        isFeatured: true,
        isTrending: true,
        isTopSelling: false,
        isNewArrival: true,
      },
      {
        name: 'Mega Fountain Flower Pots',
        category: getCatId('Flower Pots'),
        brand: 'Sparklers Premium',
        description: 'Giant size flower pots with multiple phases. Starts with golden fountains and changes to silver whistles. Pack of 3.',
        images: ['https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&q=80'],
        stock: 50,
        originalPrice: 450,
        discount: 20,
        gst: 18,
        isFeatured: true,
        isTrending: false,
        isTopSelling: true,
        isNewArrival: false,
      },
      {
        name: 'Space Whistling Rockets',
        category: getCatId('Rockets'),
        brand: 'Galaxy Fireworks',
        description: 'High-altitude rockets that emit a loud whistle on ascent followed by a golden palm tree canopy burst. Pack of 10.',
        images: ['https://images.unsplash.com/photo-1531266752426-aad472b7bbf4?w=800&q=80'],
        stock: 60,
        originalPrice: 600,
        discount: 30,
        gst: 18,
        isFeatured: false,
        isTrending: true,
        isTopSelling: true,
        isNewArrival: true,
      },
      {
        name: 'Multi-Color Sky Shells 120 Shots',
        category: getCatId('Aerial Shells'),
        brand: 'Galaxy Fireworks',
        description: 'Deluxe luxury sky show shell cake emitting 120 continuous dazzling colorful peony explosions. Ideal for festival finales.',
        images: ['https://images.unsplash.com/photo-1507502707541-f369a3b18502?w=800&q=80'],
        stock: 25,
        originalPrice: 2500,
        discount: 40,
        gst: 18,
        isFeatured: true,
        isTrending: true,
        isTopSelling: true,
        isNewArrival: true,
      },
      {
        name: 'Tricolor Sparkler Sticks 30cm',
        category: getCatId('Sparklers'),
        brand: 'Sparklers Premium',
        description: 'Longer burning sparkler sticks that emit three distinct colors in sequence: Red, Green, and Silver. Pack of 5.',
        images: ['https://images.unsplash.com/photo-1517263904008-797480e27f6e?w=800&q=80'],
        stock: 200,
        originalPrice: 200,
        discount: 5,
        gst: 18,
        isFeatured: false,
        isTrending: false,
        isTopSelling: false,
        isNewArrival: true,
      }
    ];

    await Product.insertMany(productsList);
    console.log('Seeded Products.');

    // 4. Seed Coupons
    const couponsList = [
      { code: 'FESTIVE50', discountPercentage: 15, maxDiscount: 500, expiryDate: new Date('2027-12-31'), isActive: true },
      { code: 'WELCOME10', discountPercentage: 10, maxDiscount: 200, expiryDate: new Date('2027-12-31'), isActive: true },
      { code: 'BUMPER25', discountPercentage: 25, maxDiscount: 1000, expiryDate: new Date('2027-12-31'), isActive: true },
    ];

    await Coupon.insertMany(couponsList);
    console.log('Seeded Coupons.');

    console.log('All seeding actions completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error during data seeding:', error);
    process.exit(1);
  }
};

seedData();
