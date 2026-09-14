import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Venue from "./models/Venue.js";
import Event from "./models/Event.js";
import Booking from "./models/Booking.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campus-events");
  console.log("🔗 Connected to MongoDB. Clearing previous dataset...");

  await Promise.all([
    User.deleteMany({}),
    Venue.deleteMany({}),
    Event.deleteMany({}),
    Booking.deleteMany({}),
  ]);

  // --- 1. Password Hash ---
  const password = await bcrypt.hash("password123", 10);

  // --- 2. Users (Organizers, Admin, Students) ---
  const organizer1 = await User.create({ name: "Aditi Sharma", email: "organizer@lpu.in", password, role: "organizer" });
  const organizer2 = await User.create({ name: "Vikramaditya Rao", email: "vikram.organizer@lpu.in", password, role: "organizer" });
  const organizer3 = await User.create({ name: "Prof. Meenakshi Sundaram", email: "meenakshi.organizer@lpu.in", password, role: "organizer" });

  const admin = await User.create({ name: "Campus Super Admin", email: "admin@lpu.in", password, role: "admin" });

  const studentData = [
    { name: "Rohan Verma", email: "student1@lpu.in" },
    { name: "Priya Nair", email: "student2@lpu.in" },
    { name: "Karan Mehta", email: "student3@lpu.in" },
    { name: "Sneha Iyer", email: "student4@lpu.in" },
    { name: "Arjun Singh", email: "student5@lpu.in" },
    { name: "Ananya Roy", email: "student6@lpu.in" },
    { name: "Rahul Kapoor", email: "student7@lpu.in" },
    { name: "Ishita Sharma", email: "student8@lpu.in" },
    { name: "Dev Patel", email: "student9@lpu.in" },
    { name: "Kavya Sen", email: "student10@lpu.in" },
  ];

  const students = await User.insertMany(
    studentData.map((s) => ({
      name: s.name,
      email: s.email,
      password,
      role: "student",
    }))
  );

  console.log(`✅ Seeded ${students.length + 4} users (3 Organizers, 1 Admin, 10 Students)`);

  // --- 3. Venues (Campus Locations near LPU) ---
  const venues = await Venue.insertMany([
    {
      name: "Main Auditorium",
      capacity: 500,
      address: "Block 34, Central Academic Zone, LPU",
      location: { type: "Point", coordinates: [75.7033, 31.2469] },
    },
    {
      name: "Sports Complex Dome",
      capacity: 300,
      address: "Block 60, Athletics Zone, LPU",
      location: { type: "Point", coordinates: [75.705, 31.248] },
    },
    {
      name: "Seminar Hall B",
      capacity: 120,
      address: "Block 12, Computer Science Wing, LPU",
      location: { type: "Point", coordinates: [75.701, 31.2455] },
    },
    {
      name: "Open Air Theatre",
      capacity: 800,
      address: "Block 1, Student Plaza, LPU",
      location: { type: "Point", coordinates: [75.7025, 31.244] },
    },
    {
      name: "Innovation & Robotics Lab",
      capacity: 60,
      address: "Block 38, Engineering Hub, LPU",
      location: { type: "Point", coordinates: [75.7042, 31.246] },
    },
    {
      name: "Central Amphitheatre Park",
      capacity: 1000,
      address: "Block 25, Green Campus Lawn, LPU",
      location: { type: "Point", coordinates: [75.7065, 31.2475] },
    },
  ]);

  console.log(`✅ Seeded ${venues.length} campus venues`);

  // --- 4. Events ---
  const now = new Date();

  const eventDefs = [
    {
      title: "CodeStorm 2026 24-Hour Hackathon",
      description: "Annual flag-ship 24-hour hackathon bringing together top coders, designers, and innovators to build AI and full-stack solutions.",
      category: "Tech",
      venue: venues[0]._id,
      organizer: organizer1._id,
      totalSeats: 200,
      seatsBooked: 195,
      date: new Date(now.getTime() + 2 * 3600 * 1000), // today
      status: "LIVE NOW",
      liveAnnouncement: "🔴 Final Round Presentation starts at 3:00 PM in Main Auditorium!",
    },
    {
      title: "AI & Generative Deep Learning Masterclass",
      description: "Comprehensive hands-on workshop covering Large Language Models, PyTorch, Transformers, and prompt engineering.",
      category: "Workshop",
      venue: venues[2]._id,
      organizer: organizer3._id,
      totalSeats: 80,
      seatsBooked: 80, // Sold Out!
      date: new Date(now.getTime() + 3 * 86400 * 1000),
      status: "UPCOMING",
      liveAnnouncement: "💻 Please install Python 3.11 and PyTorch before attending.",
      waitlistUsers: [students[4]._id, students[5]._id, students[6]._id, students[7]._id],
    },
    {
      title: "Inter-University Cricket Championship Final",
      description: "High-octane T20 final match between LPU Tigers and Punjab Lions.",
      category: "Sports",
      venue: venues[1]._id,
      organizer: organizer2._id,
      totalSeats: 300,
      seatsBooked: 240,
      date: new Date(now.getTime() + 1 * 3600 * 1000),
      status: "LIVE NOW",
      liveAnnouncement: "🏏 Innings Break: LPU Tigers leading by 34 runs!",
    },
    {
      title: "Rangmanch Annual Cultural Night & Battle of Bands",
      description: "A grand celebration of music, street play, classical dance, and live rock bands across campus.",
      category: "Cultural",
      venue: venues[3]._id,
      organizer: organizer1._id,
      totalSeats: 800,
      seatsBooked: 450,
      date: new Date(now.getTime() + 12 * 86400 * 1000),
      status: "UPCOMING",
      liveAnnouncement: "🎭 Special Celebrity Guest Performance announced!",
    },
    {
      title: "Full-Stack MERN & Cloud Architecture Bootcamp",
      description: "Learn Node.js, Express, React, MongoDB, Docker, and AWS deployment from industry engineers.",
      category: "Workshop",
      venue: venues[2]._id,
      organizer: organizer3._id,
      totalSeats: 100,
      seatsBooked: 60,
      date: new Date(now.getTime() + 7 * 86400 * 1000),
      status: "UPCOMING",
      liveAnnouncement: "",
    },
    {
      title: "Campus Esports Valorant & BGMI Showdown",
      description: "Inter-hostel gaming tournament with live streaming on campus big screens and prize pool.",
      category: "Tech",
      venue: venues[0]._id,
      organizer: organizer1._id,
      totalSeats: 150,
      seatsBooked: 150, // Sold Out!
      date: new Date(now.getTime() + 5 * 86400 * 1000),
      status: "POSTPONED",
      liveAnnouncement: "⏳ Server maintenance delayed tournament start by 1 hour.",
      waitlistUsers: [students[8]._id, students[9]._id],
    },
    {
      title: "Robotics Autonomous Drone Racing Challenge",
      description: "Watch custom-built FPV drones navigate high-speed obstacle courses designed by engineering students.",
      category: "Tech",
      venue: venues[4]._id,
      organizer: organizer3._id,
      totalSeats: 60,
      seatsBooked: 45,
      date: new Date(now.getTime() + 15 * 86400 * 1000),
      status: "UPCOMING",
      liveAnnouncement: "",
    },
    {
      title: "Inter-Hostel Badminton & Table Tennis League",
      description: "Fast-paced indoor racket sports tournament featuring singles and doubles matches.",
      category: "Sports",
      venue: venues[1]._id,
      organizer: organizer2._id,
      totalSeats: 120,
      seatsBooked: 90,
      date: new Date(now.getTime() + 9 * 86400 * 1000),
      status: "UPCOMING",
      liveAnnouncement: "",
    },
    {
      title: "Annual Campus Fashion Runway & Art Exhibition",
      description: "Showcasing student-designed apparel collections, digital art installations, and live painting sessions.",
      category: "Cultural",
      venue: venues[5]._id,
      organizer: organizer1._id,
      totalSeats: 500,
      seatsBooked: 310,
      date: new Date(now.getTime() + 20 * 86400 * 1000),
      status: "UPCOMING",
      liveAnnouncement: "",
    },
    {
      title: "Startup Pitch Deck & VC Funding Forum",
      description: "Student founders pitch innovative business ideas to angel investors and venture capitalists.",
      category: "Other",
      venue: venues[2]._id,
      organizer: organizer2._id,
      totalSeats: 100,
      seatsBooked: 10,
      date: new Date(now.getTime() + 18 * 86400 * 1000),
      status: "CANCELLED",
      liveAnnouncement: "🚫 Keynote speaker flight cancelled. Rescheduling for next month.",
    },
  ];

  const events = [];
  for (const def of eventDefs) {
    const ev = await Event.create({
      title: def.title,
      description: def.description,
      category: def.category,
      venue: def.venue,
      organizer: def.organizer,
      totalSeats: def.totalSeats,
      seatsBooked: def.seatsBooked,
      date: def.date,
      status: def.status,
      liveAnnouncement: def.liveAnnouncement,
      waitlist: (def.waitlistUsers || []).map((uId) => ({ user: uId })),
    });
    events.push(ev);
  }

  console.log(`✅ Seeded ${events.length} diverse events (covering Tech, Cultural, Sports, Workshop, Other)`);

  // --- 5. Bookings (Students reserving seats & check-in statuses) ---
  const bookingList = [
    // Event 0 (CodeStorm Hackathon - Live Now)
    { user: students[0]._id, event: events[0]._id, status: "ATTENDED" },
    { user: students[1]._id, event: events[0]._id, status: "ATTENDED" },
    { user: students[2]._id, event: events[0]._id, status: "CONFIRMED" },
    { user: students[3]._id, event: events[0]._id, status: "ATTENDED" },

    // Event 1 (AI Masterclass - Sold Out)
    { user: students[0]._id, event: events[1]._id, status: "CONFIRMED" },
    { user: students[1]._id, event: events[1]._id, status: "CONFIRMED" },
    { user: students[2]._id, event: events[1]._id, status: "CONFIRMED" },
    { user: students[3]._id, event: events[1]._id, status: "CONFIRMED" },

    // Event 2 (Cricket Championship - Live Now)
    { user: students[4]._id, event: events[2]._id, status: "ATTENDED" },
    { user: students[5]._id, event: events[2]._id, status: "ATTENDED" },
    { user: students[6]._id, event: events[2]._id, status: "CONFIRMED" },

    // Event 3 (Rangmanch Cultural Night)
    { user: students[0]._id, event: events[3]._id, status: "CONFIRMED" },
    { user: students[7]._id, event: events[3]._id, status: "CONFIRMED" },
    { user: students[8]._id, event: events[3]._id, status: "CONFIRMED" },

    // Event 4 (MERN Bootcamp)
    { user: students[2]._id, event: events[4]._id, status: "CONFIRMED" },
    { user: students[9]._id, event: events[4]._id, status: "CONFIRMED" },

    // Event 5 (Esports Valorant - Postponed)
    { user: students[0]._id, event: events[5]._id, status: "CONFIRMED" },
    { user: students[3]._id, event: events[5]._id, status: "CONFIRMED" },

    // Event 6 (Robotics Drone Racing)
    { user: students[1]._id, event: events[6]._id, status: "CONFIRMED" },
    { user: students[4]._id, event: events[6]._id, status: "CONFIRMED" },
  ];

  await Booking.insertMany(bookingList);
  console.log(`✅ Seeded ${bookingList.length} student bookings & check-in records`);

  // --- 6. Event Reviews ---
  events[0].reviews.push(
    { user: students[0]._id, rating: 5, comment: "Incredibly well organized! High speed Wi-Fi and snacks throughout the night." },
    { user: students[1]._id, rating: 5, comment: "Awesome mentor support during the AI track submission!" },
    { user: students[3]._id, rating: 4, comment: "Super fun hackathon, learned a lot about full-stack deployment." }
  );

  events[2].reviews.push(
    { user: students[4]._id, rating: 5, comment: "Electric atmosphere at the Sports Complex Dome!" },
    { user: students[5]._id, rating: 4, comment: "Great commentary and stadium lighting." }
  );

  events[4].reviews.push(
    { user: students[2]._id, rating: 5, comment: "Best hands-on MERN stack tutorial on campus." }
  );

  await events[0].save();
  await events[2].save();
  await events[4].save();

  console.log("✅ Seeded student reviews & star ratings");

  console.log("\n=========================================================");
  console.log("🎉 SUCCESS! Diverse Campus Events dataset fully seeded.");
  console.log("=========================================================");
  console.log("🔑 LOGIN ACCOUNTS (Password for all: password123)");
  console.log("   🎪 Organizers:");
  console.log("      - Aditi Sharma:              organizer@lpu.in");
  console.log("      - Vikramaditya Rao:          vikram.organizer@lpu.in");
  console.log("      - Prof. Meenakshi Sundaram: meenakshi.organizer@lpu.in");
  console.log("   👑 Super Admin:");
  console.log("      - Admin User:                admin@lpu.in");
  console.log("   🎓 Students:");
  console.log("      - Rohan Verma:               student1@lpu.in");
  console.log("      - Priya Nair:                student2@lpu.in");
  console.log("      - (through student10@lpu.in)");
  console.log("=========================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
