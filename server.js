const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const app = express();

// Load environment variables from .env file
dotenv.config();

// Use environment variable for MongoDB URI
const mongoURI = process.env.MONGO_URI;
const port = 5000; // Change port to something available

// Middleware
app.use(express.json());
app.use(cors());

// Database class to handle connection to MongoDB Atlas
class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect(mongoURI)
      .then(() => {
        console.log('Database connection successful');
      })
      .catch(err => {
        console.error('Database connection error', err);
      });
  }

  // Graceful shutdown
  disconnect() {
    mongoose.connection.close()
      .then(() => {
        console.log('Database connection closed');
      })
      .catch(err => {
        console.error('Error closing database connection', err);
      });
  }
}

// Initialize database connection
const databaseCon = new Database();

// User Schema (model)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// POST /api/register - Handle user registration
app.post('/api/register', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').not().isEmpty().withMessage('Name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown for app
process.on('SIGINT', () => {
  databaseCon.disconnect();
  process.exit(0);
});
