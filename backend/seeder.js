const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const dummyHotels = [
  {
    name: 'Taj Mahal Palace',
    description: 'Iconic luxury hotel in Mumbai overlooking the Gateway of India.',
    address: 'Apollo Bunder',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    location: { type: 'Point', coordinates: [72.8333, 18.9220] },
    landmark: 'Gateway of India',
    distanceFromLandmark: 0.1,
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'],
    amenities: ['AC', 'Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar'],
    hotelType: 'Luxury',
    couplesFriendly: true,
    rating: 4.9,
    totalReviews: 1205,
    startingPrice: 15000,
    status: 'Live',
    discount: 10
  },
  {
    name: 'Leela Palace',
    description: 'A luxurious property in the heart of Delhi with modern amenities.',
    address: 'Diplomatic Enclave, Chanakyapuri',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110023',
    location: { type: 'Point', coordinates: [77.1855, 28.5961] },
    landmark: 'India Gate',
    distanceFromLandmark: 5.2,
    images: ['https://images.unsplash.com/photo-1542314831-c53cd381612a', 'https://images.unsplash.com/photo-1551882547-ff40c0d12c56'],
    amenities: ['AC', 'Free WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'],
    hotelType: 'Luxury',
    couplesFriendly: true,
    rating: 4.8,
    totalReviews: 890,
    startingPrice: 12000,
    status: 'Live',
    discount: 15
  },
  {
    name: 'Goa Marriott Resort',
    description: 'Beachfront resort offering stunning views of the Arabian Sea.',
    address: 'Miramar Beach',
    city: 'Goa',
    state: 'Goa',
    pincode: '403001',
    location: { type: 'Point', coordinates: [73.8113, 15.4856] },
    landmark: 'Miramar Beach',
    distanceFromLandmark: 0.5,
    images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2', 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8'],
    amenities: ['AC', 'Free WiFi', 'Pool', 'Bar', 'Spa'],
    hotelType: 'Resort',
    couplesFriendly: true,
    rating: 4.6,
    totalReviews: 640,
    startingPrice: 8500,
    status: 'Live',
    discount: 20
  },
  {
    name: 'OYO Flagship 123 Bangalore',
    description: 'Affordable stay with great comfort and hygiene.',
    address: 'Koramangala 4th Block',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    location: { type: 'Point', coordinates: [77.6271, 12.9345] },
    landmark: 'Forum Mall',
    distanceFromLandmark: 1.2,
    images: ['https://images.unsplash.com/photo-1618773928120-2c709c135678', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511'],
    amenities: ['AC', 'Free WiFi', 'TV'],
    hotelType: 'Budget',
    couplesFriendly: true,
    rating: 3.8,
    totalReviews: 120,
    startingPrice: 1500,
    status: 'Live',
    discount: 5
  }
];

const importData = async () => {
  try {
    await Hotel.deleteMany();
    await Room.deleteMany();
    await User.deleteMany();

    // 1. Hash passwords
    const salt = await bcrypt.genSalt(10);
    const customerPassword = await bcrypt.hash('customerpassword', salt);
    const managerPassword = await bcrypt.hash('managerpassword', salt);
    const adminPassword = await bcrypt.hash('adminpassword', salt);

    // 2. Create users
    const users = await User.insertMany([
      {
        name: 'Default Customer',
        email: 'customer@stayluxe.com',
        password: customerPassword,
        phone: '9876543210',
        role: 'user',
        isEmailVerified: true,
        isPhoneVerified: true
      },
      {
        name: 'Default Hotel Manager',
        email: 'manager@stayluxe.com',
        password: managerPassword,
        phone: '8876543210',
        role: 'manager',
        isEmailVerified: true,
        isPhoneVerified: true
      },
      {
        name: 'Default Super Admin',
        email: 'admin@stayluxe.com',
        password: adminPassword,
        phone: '7876543210',
        role: 'super_admin',
        isEmailVerified: true,
        isPhoneVerified: true
      }
    ]);

    const seededManager = users[1];

    // 3. Insert hotels with manager linked
    const hotelsToInsert = dummyHotels.map(h => ({
      ...h,
      manager: seededManager._id
    }));

    const createdHotels = await Hotel.insertMany(hotelsToInsert);
    
    // Add rooms for each hotel
    const rooms = [];
    createdHotels.forEach(hotel => {
      rooms.push({
        hotel: hotel._id,
        roomType: 'Standard',
        price: hotel.startingPrice,
        roomSize: '120 sq.ft.',
        maxGuests: 2,
        isAC: false,
        availableRooms: 10,
        amenities: ['TV', 'Attached Bathroom']
      });
      rooms.push({
        hotel: hotel._id,
        roomType: 'Deluxe',
        price: hotel.startingPrice + 2000,
        roomSize: '200 sq.ft.',
        maxGuests: 3,
        isAC: true,
        availableRooms: 5,
        amenities: ['TV', 'AC', 'Attached Bathroom', 'Mini Fridge']
      });
    });

    await Room.insertMany(rooms);

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Hotel.deleteMany();
    await Room.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
