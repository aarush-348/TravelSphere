const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Destination = require('../models/Destination');
const Tour = require('../models/Tour');
const User = require('../models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Destination.deleteMany({});
    await Tour.deleteMany({});
    console.log('Cleared existing destinations and tours.');

    // ========== SEED DESTINATIONS ==========
    const destinations = await Destination.insertMany([
      {
        name: 'Rajasthan',
        description: 'Known as the Land of Kings, Rajasthan is famous for its royal heritage, colorful attire, and desert festivals.',
        imageUrl: '/culture/img/desertfestival.jpeg',
        festivals: ['Desert Festival', 'Gangaur', 'Teej'],
        foods: ['Dal Baati Churma', 'Gatte ki Sabzi'],
        colorTheme: 'rajasthan'
      },
      {
        name: 'Kerala',
        description: "Known as God's Own Country, Kerala boasts lush greenery, backwaters, and rich traditions.",
        imageUrl: '/culture/img/moving-house-boat-river.jpg',
        festivals: ['Onam', 'Vishu', 'Thrissur Pooram'],
        foods: ['Sadya', 'Appam with Stew'],
        colorTheme: 'kerala'
      },
      {
        name: 'Punjab',
        description: 'The land of five rivers, Punjab is vibrant with its bhangra beats, lively fairs, and warm hospitality.',
        imageUrl: '/culture/img/baisakhi.webp',
        festivals: ['Baisakhi', 'Lohri', 'Gurpurab'],
        foods: ['Makki di Roti & Sarson da Saag', 'Lassi'],
        colorTheme: 'punjab'
      }
    ]);
    console.log(`✅ Seeded ${destinations.length} destinations`);

    // ========== SEED TOURS ==========
    // Generate future dates for available dates
    const futureDates = [];
    const now = new Date();
    for (let i = 1; i <= 12; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);
      d.setDate(15); // 15th of each upcoming month
      futureDates.push(d);
    }

    const tours = await Tour.insertMany([
      {
        name: 'Andaman & Nicobar Islands',
        description: 'Explore pristine beaches, crystal-clear waters, and vibrant coral reefs in this tropical paradise.',
        imageUrl: '/gallery/img/Andaman.jpg',
        location: 'Andaman and Nicobar',
        price: 25000,
        duration: 5,
        maxGroupSize: 15,
        availableDates: futureDates.slice(0, 6),
        averageRating: 4.5,
        totalReviews: 2
      },
      {
        name: 'Goa Beach Getaway',
        description: 'Sun, sand, and sea — enjoy the best beaches, nightlife, and Portuguese-influenced architecture.',
        imageUrl: '/gallery/img/Goa.jpg',
        location: 'Goa',
        price: 12000,
        duration: 4,
        maxGroupSize: 20,
        availableDates: futureDates.slice(0, 8),
        averageRating: 4.2,
        totalReviews: 5
      },
      {
        name: 'Manali Mountain Adventure',
        description: 'Trek through snow-capped mountains, lush valleys, and ancient temples in this Himalayan gem.',
        imageUrl: '/gallery/img/Manali.jpg',
        location: 'Manali',
        price: 15000,
        duration: 5,
        maxGroupSize: 12,
        availableDates: futureDates.slice(2, 8),
        averageRating: 4.7,
        totalReviews: 8
      },
      {
        name: 'Shimla Heritage Tour',
        description: 'Walk through colonial-era buildings, toy train rides, and panoramic mountain views in the Queen of Hills.',
        imageUrl: '/gallery/img/Shimla.jpg',
        location: 'Shimla',
        price: 10000,
        duration: 3,
        maxGroupSize: 20,
        availableDates: futureDates.slice(0, 10),
        averageRating: 4.0,
        totalReviews: 3
      },
      {
        name: 'Agra — Taj Mahal Experience',
        description: 'Witness the iconic Taj Mahal, explore Agra Fort, and discover Mughal-era craftsmanship.',
        imageUrl: '/gallery/img/Agra.jpg',
        location: 'Agra',
        price: 8000,
        duration: 2,
        maxGroupSize: 25,
        availableDates: futureDates,
        averageRating: 4.8,
        totalReviews: 12
      },
      {
        name: 'Kerala Backwaters Cruise',
        description: 'Drift through serene backwaters on a houseboat, surrounded by coconut palms and village life.',
        imageUrl: '/gallery/img/Kerela.jpg',
        location: 'Kerala',
        price: 18000,
        duration: 4,
        maxGroupSize: 10,
        availableDates: futureDates.slice(1, 9),
        averageRating: 4.6,
        totalReviews: 6
      }
    ]);
    console.log(`✅ Seeded ${tours.length} tours`);

    // ========== SEED ADMIN USER ==========
    const existingAdmin = await User.findOne({ email: 'admin@travelsphere.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@travelsphere.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Seeded admin user (admin@travelsphere.com / admin123)');
    } else {
      console.log('ℹ️  Admin user already exists, skipping.');
    }

    console.log('\n🎉 Database seeding complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
