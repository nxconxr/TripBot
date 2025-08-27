const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  getUserFavorites, 
  addToFavorites, 
  removeFromFavorites,
  getUserData,
  updateUserData,
} = require('../services/firebase');

const router = express.Router();

// Get user favorites
router.get('/favorites', async (req, res) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Getting favorites for user:', uid);

    const favorites = await getUserFavorites(uid);

    res.json({
      success: true,
      data: favorites,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get favorites',
    });
  }
});

// Add to favorites
router.post('/favorites', [
  body('type').isIn(['flight', 'hotel', 'package']).withMessage('Type must be flight, hotel, or package'),
  body('itemId').isString().withMessage('Item ID is required'),
  body('itemData').isObject().withMessage('Item data is required'),
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

    const { uid } = req.user;
    const { type, itemId, itemData } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Adding to favorites:', { uid, type, itemId });

    const favoriteData = {
      type,
      itemId,
      itemData,
      addedAt: new Date().toISOString(),
    };

    const result = await addToFavorites(uid, favoriteData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Added to favorites successfully',
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to favorites',
    });
  }
});

// Remove from favorites
router.delete('/favorites/:favoriteId', async (req, res) => {
  try {
    const { uid } = req.user;
    const { favoriteId } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Removing from favorites:', { uid, favoriteId });

    await removeFromFavorites(uid, favoriteId);

    res.json({
      success: true,
      message: 'Removed from favorites successfully',
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from favorites',
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Getting profile for user:', uid);

    const userProfile = await getUserData(uid);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      });
    }

    res.json({
      success: true,
      data: userProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
});

// Update user preferences
router.put('/preferences', [
  body('preferences').isObject().withMessage('Preferences must be object'),
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

    const { uid } = req.user;
    const { preferences } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Updating preferences for user:', uid);

    await updateUserData(uid, { preferences });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
    });
  }
});

// Get user bookings
router.get('/bookings', async (req, res) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Getting bookings for user:', uid);

    const userProfile = await getUserData(uid);
    const bookings = userProfile?.bookings || [];

    res.json({
      success: true,
      data: bookings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookings',
    });
  }
});

// Add booking
router.post('/bookings', [
  body('type').isIn(['flight', 'hotel', 'package']).withMessage('Type must be flight, hotel, or package'),
  body('bookingData').isObject().withMessage('Booking data is required'),
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

    const { uid } = req.user;
    const { type, bookingData } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Adding booking for user:', uid);

    const userProfile = await getUserData(uid);
    const bookings = userProfile?.bookings || [];

    const newBooking = {
      id: `booking_${Date.now()}`,
      type,
      bookingData,
      bookedAt: new Date().toISOString(),
      status: 'confirmed',
    };

    bookings.push(newBooking);

    await updateUserData(uid, { bookings });

    res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Booking added successfully',
    });
  } catch (error) {
    console.error('Add booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add booking',
    });
  }
});

// Get user statistics
router.get('/statistics', async (req, res) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log('Getting statistics for user:', uid);

    const userProfile = await getUserData(uid);
    const favorites = await getUserFavorites(uid);
    const bookings = userProfile?.bookings || [];

    const statistics = {
      totalFavorites: favorites.length,
      totalBookings: bookings.length,
      favoriteFlights: favorites.filter(f => f.type === 'flight').length,
      favoriteHotels: favorites.filter(f => f.type === 'hotel').length,
      favoritePackages: favorites.filter(f => f.type === 'package').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      upcomingBookings: bookings.filter(b => b.status === 'confirmed').length,
      totalSpent: bookings.reduce((sum, booking) => sum + (booking.bookingData.price || 0), 0),
      memberSince: userProfile?.createdAt || new Date().toISOString(),
    };

    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

module.exports = router;