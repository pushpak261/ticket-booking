require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// ─── Seed Data ───────────────────────────────────────────────────────────────

const users = [
  {
    name: 'Pushpak Admin',
    email: 'pushpakadmin@gmail.com',
    password: 'Pushpak@123!',
    role: 'admin',
    phone: '9876543210',
  },
  {
    name: 'Pushpak User',
    email: 'pushpakuser@gmail.com',
    password: 'Pushpak@123!',
    role: 'user',
    phone: '9876543211',
  },
  {
    name: 'Kunal User',
    email: 'kunaluser@gmail.com',
    password: 'Kunal@123!',
    role: 'user',
    phone: '9876543212',
  },
];

const movies = [
  {
    title: 'Interstellar Odyssey',
    description:
      'A team of astronauts ventures through a wormhole near Saturn in search of a new home for humanity as Earth faces extinction. A visually stunning journey that explores love, time, and the cosmos.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 169,
    releaseDate: new Date('2024-01-15'),
    rating: 9.1,
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper' },
      { name: 'Anne Hathaway', role: 'Brand' },
      { name: 'Jessica Chastain', role: 'Murph' },
    ],
    director: 'Christopher Nolan',
    status: 'now_showing',
    certificate: 'UA',
  },
  {
    title: 'The Dark Knight Returns',
    description:
      'Eight years after the Joker\'s reign of anarchy, the caped crusader must return from his exile to face a new threat from a masked villain known as Bane who rises from the shadows of Gotham.',
    genre: ['Action', 'Drama', 'Thriller'],
    language: 'English',
    duration: 164,
    releaseDate: new Date('2024-02-01'),
    rating: 9.0,
    poster: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/g8evyE9TuYk',
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne' },
      { name: 'Tom Hardy', role: 'Bane' },
      { name: 'Anne Hathaway', role: 'Selina Kyle' },
    ],
    director: 'Christopher Nolan',
    status: 'now_showing',
    certificate: 'UA',
  },
  {
    title: 'Galactic Guardians Vol. 3',
    description:
      'The Guardians embark on a mission to protect one of their own, delving into Rocket\'s painful past while facing a powerful new adversary determined to reshape the universe according to his twisted vision.',
    genre: ['Action', 'Adventure', 'Comedy'],
    language: 'English',
    duration: 150,
    releaseDate: new Date('2024-02-15'),
    rating: 8.5,
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/jl2yFTAGFHM',
    cast: [
      { name: 'Chris Pratt', role: 'Star-Lord' },
      { name: 'Zoe Saldana', role: 'Gamora' },
      { name: 'Bradley Cooper', role: 'Rocket' },
    ],
    director: 'James Gunn',
    status: 'now_showing',
    certificate: 'UA',
  },
  {
    title: 'Dune: Part Three',
    description:
      'Paul Atreides continues his messianic journey on the desert planet Arrakis, leading the Fremen against the Galactic Emperor in an epic battle that will determine the fate of the universe.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 167,
    releaseDate: new Date('2024-03-01'),
    rating: 8.8,
    poster: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/U2Qp5pL3ovA',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides' },
      { name: 'Zendaya', role: 'Chani' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica' },
    ],
    director: 'Denis Villeneuve',
    status: 'now_showing',
    certificate: 'UA',
  },
  {
    title: 'The Haunting of Blackwood Manor',
    description:
      'A family moves into an old Victorian mansion only to discover dark secrets buried within its walls. As supernatural events escalate, they must unravel the mystery before it consumes them entirely.',
    genre: ['Horror', 'Thriller'],
    language: 'English',
    duration: 118,
    releaseDate: new Date('2024-03-10'),
    rating: 7.6,
    poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/WdHqiGjOqdk',
    cast: [
      { name: 'Florence Pugh', role: 'Emma Blackwood' },
      { name: 'Oscar Isaac', role: 'Dr. Harlan' },
    ],
    director: 'Mike Flanagan',
    status: 'now_showing',
    certificate: 'A',
  },
  {
    title: 'Finding Nemo: The Deep',
    description:
      'In this heartwarming sequel, Nemo and his father Marlin discover an uncharted area of the ocean filled with magical creatures, helping a young blue whale find its way back to family.',
    genre: ['Animation', 'Adventure', 'Comedy'],
    language: 'English',
    duration: 105,
    releaseDate: new Date('2024-04-01'),
    rating: 8.2,
    poster: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/SPHfeNgogVs',
    cast: [
      { name: 'Albert Brooks', role: 'Marlin' },
      { name: 'Ellen DeGeneres', role: 'Dory' },
    ],
    director: 'Andrew Stanton',
    status: 'now_showing',
    certificate: 'U',
  },
  {
    title: 'Avengers: Secret Wars',
    description:
      'The Avengers face their greatest threat yet as multiple realities collide. Heroes from across the multiverse must unite to prevent the collapse of all existence in this unprecedented event.',
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    language: 'English',
    duration: 180,
    releaseDate: new Date('2024-05-01'),
    rating: 0,
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/YKHxQnDM0EA',
    cast: [
      { name: 'Robert Downey Jr.', role: 'Iron Man' },
      { name: 'Chris Evans', role: 'Captain America' },
      { name: 'Scarlett Johansson', role: 'Black Widow' },
    ],
    director: 'The Russo Brothers',
    status: 'coming_soon',
    certificate: 'UA',
  },
  {
    title: 'Inception 2: The Dream Architect',
    description:
      'Dom Cobb returns for another mind-bending mission — this time, he must extract information buried in five layers of dreams from the world\'s most powerful corporate mind.',
    genre: ['Sci-Fi', 'Thriller', 'Action'],
    language: 'English',
    duration: 155,
    releaseDate: new Date('2024-06-15'),
    rating: 0,
    poster: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=500&q=80',
    trailer: 'https://www.youtube.com/embed/8hP9D6kZseM',
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Dom Cobb' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
    ],
    director: 'Christopher Nolan',
    status: 'coming_soon',
    certificate: 'UA',
  },
];

const theaters = [
  {
    name: 'PVR Cinemas - Select City Walk',
    city: 'Delhi',
    address: 'A-3, District Centre, Saket, New Delhi - 110017',
    amenities: ['Dolby Atmos', '4K Projection', 'Food Court', 'Valet Parking'],
    screens: [
      { screenNumber: 1, screenName: 'Audi 1 - IMAX', totalSeats: 60, rows: 10, columns: 6, screenType: 'IMAX' },
      { screenNumber: 2, screenName: 'Audi 2 - Standard', totalSeats: 80, rows: 10, columns: 8, screenType: 'Standard' },
      { screenNumber: 3, screenName: 'Audi 3 - Dolby', totalSeats: 72, rows: 9, columns: 8, screenType: 'Dolby' },
    ],
  },
  {
    name: 'INOX - Phoenix MarketCity',
    city: 'Mumbai',
    address: 'Phoenix MarketCity, LBS Road, Kurla West, Mumbai - 400070',
    amenities: ['4DX', 'Recliner Seats', 'Premium Lounge', 'Online Booking'],
    screens: [
      { screenNumber: 1, screenName: 'Screen 1 - 4DX', totalSeats: 64, rows: 8, columns: 8, screenType: '4DX' },
      { screenNumber: 2, screenName: 'Screen 2 - Standard', totalSeats: 80, rows: 10, columns: 8, screenType: 'Standard' },
    ],
  },
  {
    name: 'Cinepolis - Forum Mall',
    city: 'Bangalore',
    address: 'Forum Mall, Hosur Road, Koramangala, Bangalore - 560095',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Court'],
    screens: [
      { screenNumber: 1, screenName: 'Screen 1 - IMAX', totalSeats: 60, rows: 10, columns: 6, screenType: 'IMAX' },
      { screenNumber: 2, screenName: 'Screen 2 - Standard', totalSeats: 80, rows: 10, columns: 8, screenType: 'Standard' },
      { screenNumber: 3, screenName: 'Screen 3 - Dolby', totalSeats: 56, rows: 7, columns: 8, screenType: 'Dolby' },
    ],
  },
  {
    name: 'PVR - Orion Mall',
    city: 'Hyderabad',
    address: 'Orion Mall, Dr. Rajkumar Road, Rajajinagar, Hyderabad - 560086',
    amenities: ['4K Projection', 'Recliner Seats', 'Parking'],
    screens: [
      { screenNumber: 1, screenName: 'Screen 1 - Standard', totalSeats: 80, rows: 10, columns: 8, screenType: 'Standard' },
      { screenNumber: 2, screenName: 'Screen 2 - Standard', totalSeats: 80, rows: 10, columns: 8, screenType: 'Standard' },
    ],
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Movie.deleteMany(),
      Theater.deleteMany(),
      Showtime.deleteMany(),
      Booking.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users (passwords auto-hashed via pre-save hook)
    const createdUsers = await User.insertMany(
      await Promise.all(
        users.map(async (u) => {
          const salt = await bcrypt.genSalt(12);
          return { ...u, password: await bcrypt.hash(u.password, salt) };
        })
      )
    );
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create movies
    const createdMovies = await Movie.insertMany(movies);
    console.log(`🎬 Created ${createdMovies.length} movies`);

    // Create theaters
    const createdTheaters = await Theater.insertMany(theaters);
    console.log(`🎭 Created ${createdTheaters.length} theaters`);

    // Create showtimes (next 7 days for now-showing movies)
    const nowShowingMovies = createdMovies.filter((m) => m.status === 'now_showing');
    const showtimeData = [];
    const today = new Date();

    for (let day = 0; day < 7; day++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + day);

      for (const movie of nowShowingMovies.slice(0, 4)) {
        for (const theater of createdTheaters.slice(0, 2)) {
          const screen = theater.screens[0];
          const times = ['10:00 AM', '01:30 PM', '05:00 PM', '09:00 PM'];

          for (const time of times) {
            showtimeData.push({
              movie: movie._id,
              theater: theater._id,
              screenNumber: screen.screenNumber,
              date: showDate,
              startTime: time,
              price: {
                regular: 200,
                premium: 350,
                recliner: 500,
              },
              bookedSeats: [],
              totalSeats: screen.totalSeats,
              isActive: true,
            });
          }
        }
      }
    }

    const createdShowtimes = await Showtime.insertMany(showtimeData);
    console.log(`🕐 Created ${createdShowtimes.length} showtimes`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📋 Login credentials:');
    console.log('   Admin: admin@cinebook.com / admin123');
    console.log('   User:  john@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
