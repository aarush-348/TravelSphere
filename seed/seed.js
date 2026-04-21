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
      },
      {
        name: 'Japan',
        description: 'Experience the perfect blend of ancient traditions and futuristic technology in the Land of the Rising Sun.',
        imageUrl: '/gallery/img/tokyo.png',
        festivals: ['Cherry Blossom Festival', 'Gion Matsuri'],
        foods: ['Sushi', 'Ramen', 'Tempura'],
        colorTheme: 'japan'
      },
      {
        name: 'France',
        description: 'Immerse yourself in romance, exquisite art, fashion, and world-class culinary delights.',
        imageUrl: '/gallery/img/paris.png',
        festivals: ['Bastille Day', 'Cannes Film Festival'],
        foods: ['Croissant', 'Coq au Vin', 'Macarons'],
        colorTheme: 'france'
      },
      {
        name: 'Italy',
        description: 'Discover ancient ruins, breathtaking architecture, and the incredible flavors of the Mediterranean.',
        imageUrl: '/gallery/img/rome.png',
        festivals: ['Carnival of Venice', 'Palio di Siena'],
        foods: ['Pizza', 'Pasta', 'Gelato'],
        colorTheme: 'italy'
      },
      {
        name: 'USA',
        description: 'Explore diverse landscapes, iconic cityscapes, and melting-pot cultures across the fifty states.',
        imageUrl: '/gallery/img/usa.png',
        festivals: ['Mardi Gras', 'Coachella'],
        foods: ['Burgers', 'BBQ', 'Apple Pie'],
        colorTheme: 'usa'
      },
      {
        name: 'Brazil',
        description: 'Experience vibrant festivals, lush rainforests, and stunning beaches in South America.',
        imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
        festivals: ['Carnival of Rio', 'Festa Junina'],
        foods: ['Feijoada', 'Pão de Queijo', 'Churrasco'],
        colorTheme: 'brazil'
      },
      {
        name: 'South Africa',
        description: 'Discover breathtaking wildlife safaris, stunning coastlines, and culturally rich cities.',
        imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
        festivals: ['Cape Town Jazz Festival', 'Klein Karoo'],
        foods: ['Biltong', 'Bobotie', 'Braai'],
        colorTheme: 'southafrica'
      },
      {
        name: 'Australia',
        description: 'Explore epic outback landscapes, vibrant coral reefs, and laid-back coastal cities.',
        imageUrl: '/gallery/img/australia.png',
        festivals: ['Sydney Festival', 'Vivid Sydney'],
        foods: ['Vegemite', 'Meat Pie', 'Tim Tam'],
        colorTheme: 'australia'
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
        totalReviews: 2,
        coordinates: { lat: 11.7401, lng: 92.6586 }
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
        totalReviews: 5,
        coordinates: { lat: 15.2993, lng: 74.124 }
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
        totalReviews: 8,
        coordinates: { lat: 32.2432, lng: 77.1892 }
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
        totalReviews: 3,
        coordinates: { lat: 31.1048, lng: 77.1734 }
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
        totalReviews: 12,
        coordinates: { lat: 27.1767, lng: 78.0081 }
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
        totalReviews: 6,
        coordinates: { lat: 9.9312, lng: 76.2673 }
      },
      {
        name: 'Tokyo Cherry Blossom Explorer',
        description: 'Walk through glowing neon streets of Tokyo and historic shrines in Kyoto during the stunning Sakura season.',
        imageUrl: '/gallery/img/tokyo.png',
        location: 'Tokyo, Japan',
        price: 85000,
        duration: 7,
        maxGroupSize: 15,
        availableDates: futureDates.slice(1, 4),
        averageRating: 4.9,
        totalReviews: 24,
        coordinates: { lat: 35.6762, lng: 139.6503 }
      },
      {
        name: 'Paris Landmarks & Cuisine',
        description: 'Experience the magic of the Eiffel Tower, the Louvre museum, and charming cafes along the Seine.',
        imageUrl: '/gallery/img/paris.png',
        location: 'Paris, France',
        price: 95000,
        duration: 5,
        maxGroupSize: 12,
        availableDates: futureDates.slice(2, 6),
        averageRating: 4.8,
        totalReviews: 31,
        coordinates: { lat: 48.8566, lng: 2.3522 }
      },
      {
        name: 'Ancient Rome Heritage',
        description: 'Step back in time at the Colosseum, wander the vibrant Piazzas, and toss a coin in the Trevi Fountain.',
        imageUrl: '/gallery/img/rome.png',
        location: 'Rome, Italy',
        price: 90000,
        duration: 6,
        maxGroupSize: 20,
        availableDates: futureDates.slice(0, 5),
        averageRating: 4.7,
        totalReviews: 18,
        coordinates: { lat: 41.9028, lng: 12.4964 }
      },
      {
        name: 'New York City Highlights',
        description: 'Feel the energy of Times Square, stroll through Central Park, and catch a Broadway show.',
        imageUrl: '/gallery/img/usa.png',
        location: 'New York, USA',
        price: 110000,
        duration: 5,
        maxGroupSize: 15,
        availableDates: futureDates.slice(1, 7),
        averageRating: 4.6,
        totalReviews: 42,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      {
        name: 'Rio Carnival & Beaches',
        description: 'Soak up the sun on Copacabana beach and visit the iconic Christ the Redeemer.',
        imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
        location: 'Rio de Janeiro, Brazil',
        price: 105000,
        duration: 7,
        maxGroupSize: 15,
        availableDates: futureDates.slice(2, 6),
        averageRating: 4.8,
        totalReviews: 28,
        coordinates: { lat: -22.9068, lng: -43.1729 }
      },
      {
        name: 'Cape Town Safari Wonders',
        description: 'Take a cable car up Table Mountain and embark on an unforgettable Big Five safari.',
        imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
        location: 'Cape Town, South Africa',
        price: 95000,
        duration: 8,
        maxGroupSize: 12,
        availableDates: futureDates.slice(1, 4),
        averageRating: 4.9,
        totalReviews: 15,
        coordinates: { lat: -33.9249, lng: 18.4241 }
      },
      {
        name: 'Sydney Harbor Adventure',
        description: 'Climb the iconic Sydney Harbour Bridge and cruise past the famous Opera House.',
        imageUrl: '/gallery/img/australia.png',
        location: 'Sydney, Australia',
        price: 120000,
        duration: 6,
        maxGroupSize: 20,
        availableDates: futureDates.slice(3, 9),
        averageRating: 4.7,
        totalReviews: 36,
        coordinates: { lat: -33.8688, lng: 151.2093 }
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
