const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { GraphQLError } = require('graphql');

// Helper to check authentication
const requireAuth = (user) => {
  if (!user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
};

// Helper to check admin role
const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'admin') {
    throw new GraphQLError('Admin access required', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
};

const resolvers = {
  Query: {
    users: async (_, __, { user }) => {
      requireAuth(user);
      return await User.find().sort({ createdAt: -1 });
    },
    user: async (_, { id }, { user }) => {
      requireAuth(user);
      const foundUser = await User.findById(id);
      if (!foundUser) {
        throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return foundUser;
    }
  },
  Mutation: {
    signup: async (_, { name, email, password }, { io }) => {
      const existing = await User.findOne({ email });
      if (existing) {
        throw new GraphQLError('Email is already registered', { extensions: { code: 'BAD_REQUEST' } });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userCount = await User.countDocuments();
      const role = userCount === 0 ? 'admin' : 'user';

      try {
        const newUser = await User.create({ name, email, password: hashedPassword, role });

        if (io) {
          io.emit('user_added', { 
            message: `New user ${newUser.name} just joined!`,
            user: newUser
          });
        }

        const token = jwt.sign(
          { id: newUser._id, email: newUser.email, role: newUser.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return { message: 'User created successfully', token, user: newUser };
      } catch (error) {
        if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          throw new GraphQLError(messages.join(', '), { extensions: { code: 'BAD_REQUEST' } });
        }
        throw new GraphQLError('Failed to register user');
      }
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('Invalid email or password', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new GraphQLError('Invalid email or password', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { message: 'Login successful', token, user };
    },
    createUser: async (_, { name, email, role }, { user, io }) => {
      requireAdmin(user);
      
      const existing = await User.findOne({ email });
      if (existing) {
        throw new GraphQLError('Email already exists', { extensions: { code: 'BAD_REQUEST' } });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('defaultpassword123', salt);

      try {
        const newUser = await User.create({ 
          name, 
          email, 
          password: hashedPassword,
          role: role || 'user'
        });

        if (io) {
          io.emit('user_added', { 
            message: `Admin ${user.name} created new user ${newUser.name}`,
            user: newUser
          });
        }

        return newUser;
      } catch (error) {
        if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          throw new GraphQLError(messages.join(', '), { extensions: { code: 'BAD_REQUEST' } });
        }
        throw new GraphQLError('Failed to create user');
      }
    },
    updateUser: async (_, { id, name, email, role }, { user, io }) => {
      requireAuth(user);

      if (!name && !email && !role) {
        throw new GraphQLError('Data is required for update', { extensions: { code: 'BAD_REQUEST' } });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;

      const updatedUser = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
      }

      if (io) {
        io.emit('user_updated', {
          message: `User ${updatedUser.name} was updated`,
          user: updatedUser
        });
      }

      return updatedUser;
    },
    deleteUser: async (_, { id }, { user, io }) => {
      requireAdmin(user);

      if (id === user.id) {
        throw new GraphQLError('You cannot delete your own account', { extensions: { code: 'FORBIDDEN' } });
      }

      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
      }

      if (io) {
        io.emit('user_deleted', {
          message: `Admin ${user.name} deleted user ${deletedUser.name}`,
          userId: id
        });
      }

      return deletedUser;
    }
  }
};

module.exports = resolvers;
