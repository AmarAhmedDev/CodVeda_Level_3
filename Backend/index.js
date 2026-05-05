const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { initDatabase } = require('./database');
const authRoutes = require('./routes/authRoutes');
const { verifyToken, requireAdmin } = require('./middleware/auth');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;

// Security and Performance Middleware
app.use(helmet());
app.use(compression());

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Auth routes
app.use('/auth', authRoutes);

// READ: Get all users
app.get('/users', verifyToken, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users from database.' });
    }
});

// READ: Get a specific user by ID
app.get('/users/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// CREATE: Add a new user (admin only or via signup)
// Note: Normally, adding a user from dashboard would also require hashing password. 
// For this CRUD demo, we'll auto-generate a generic password if one isn't provided.
app.post('/users', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const bcrypt = require('bcryptjs');

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        // Check if email exists
        const existing = await User.findOne({ email });
        if (existing) {
             return res.status(400).json({ error: 'Email already exists' });
        }

        // Generate default password for manually created users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('defaultpassword123', salt);

        const newUser = await User.create({ 
            name, 
            email, 
            password: hashedPassword,
            role: role || 'user'
        });
        
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        // Handle Mongoose validation errors gracefully
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// UPDATE: Update an existing user by ID
app.put('/users/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, role } = req.body;

        // Validate inputs
        if (!name && !email && !role) {
            return res.status(400).json({ error: 'Data is required for update' });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        // Admin verification logic could go here to prevent users from changing their own roles

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE: Remove a user by ID
app.delete('/users/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(403).json({ error: 'You cannot delete your own account' });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (deletedUser) {
            res.status(200).json({ message: 'User deleted successfully', user: { id: userId } });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Delay starting the server until the database is completely ready
initDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error("Failed to start server because database initialization failed.", err);
    process.exit(1);
});
