const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  createUser, 
  getUserByEmail, 
  getUserByUid, 
  updateUser, 
  deleteUser,
  getUserData,
  setUserData,
  updateUserData,
} = require('../services/firebase');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').optional().isString().withMessage('Display name must be string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password, displayName } = req.body;

    // Check if user already exists
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists',
        });
      }
    } catch (error) {
      // User doesn't exist, continue with registration
    }

    // Create user in Firebase Auth
    const userData = {
      email,
      password,
      displayName: displayName || email.split('@')[0],
    };

    const userRecord = await createUser(userData);

    // Create user profile in Firestore
    const profileData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: new Date().toISOString(),
      preferences: {
        language: 'de',
        currency: 'EUR',
        notifications: true,
      },
      favorites: [],
      bookings: [],
    };

    await setUserData(userRecord.uid, profileData);

    // Generate JWT token
    const token = jwt.sign(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        token,
        profile: profileData,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Get user from Firebase
    const userRecord = await getUserByEmail(email);

    // For demo purposes, we'll use a simple password check
    // In production, you'd want to implement proper Firebase Auth sign-in
    const isValidPassword = password.length >= 6; // Simple validation for demo

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Get user profile from Firestore
    const userProfile = await getUserData(userRecord.uid);

    // Generate JWT token
    const token = jwt.sign(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        token,
        profile: userProfile,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // This route should be protected by auth middleware
    // For now, we'll get user from query param for demo
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    const userRecord = await getUserByUid(uid);
    const userProfile = await getUserData(uid);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        profile: userProfile,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
});

// Update user profile
router.put('/profile', [
  body('displayName').optional().isString().withMessage('Display name must be string'),
  body('preferences').optional().isObject().withMessage('Preferences must be object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { uid } = req.query;
    const { displayName, preferences } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Update Firebase Auth user
    const updateData = {};
    if (displayName) updateData.displayName = displayName;

    if (Object.keys(updateData).length > 0) {
      await updateUser(uid, updateData);
    }

    // Update Firestore profile
    const profileUpdates = {};
    if (displayName) profileUpdates.displayName = displayName;
    if (preferences) profileUpdates.preferences = preferences;

    if (Object.keys(profileUpdates).length > 0) {
      await updateUserData(uid, profileUpdates);
    }

    // Get updated profile
    const userRecord = await getUserByUid(uid);
    const userProfile = await getUserData(uid);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        profile: userProfile,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Delete user from Firebase Auth
    await deleteUser(uid);

    // Delete user data from Firestore
    // Note: In production, you might want to keep some data for legal reasons

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
    });
  }
});

// Verify token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRecord = await getUserByUid(decoded.uid);
    const userProfile = await getUserData(decoded.uid);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        profile: userProfile,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRecord = await getUserByUid(decoded.uid);

    // Generate new token
    const newToken = jwt.sign(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

module.exports = router;