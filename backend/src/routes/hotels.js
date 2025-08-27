const express = require('express');
const { query, body, validationResult } = require('express-validator');
const hotelService = require('../services/hotels');

const router = express.Router();

// Search hotels
router.get('/search', [
  query('destination').isString().withMessage('Destination is required'),
  query('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  query('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  query('guests').optional().isInt({ min: 1, max: 10 }).withMessage('Guests must be between 1 and 10'),
  query('rooms').optional().isInt({ min: 1, max: 5 }).withMessage('Rooms must be between 1 and 5'),
  query('hotelStars').optional().isInt({ min: 1, max: 5 }).withMessage('Hotel stars must be between 1 and 5'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
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

    const searchParams = {
      destination: req.query.destination,
      checkIn: req.query.checkIn,
      checkOut: req.query.checkOut,
      guests: parseInt(req.query.guests) || 1,
      rooms: parseInt(req.query.rooms) || 1,
      hotelStars: req.query.hotelStars ? parseInt(req.query.hotelStars) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    };

    console.log('Hotel search request:', searchParams);

    const result = await hotelService.searchHotels(searchParams);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        searchParams,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Hotel search route error:', error);
    res.status(500).json({
      success: false,
      error: 'Hotel search failed',
    });
  }
});

// Get hotel details
router.get('/details/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;

    console.log('Hotel details request:', hotelId);

    const result = await hotelService.getHotelDetails(hotelId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Hotel details route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hotel details',
    });
  }
});

// Get popular destinations
router.get('/popular-destinations', async (req, res) => {
  try {
    console.log('Popular destinations request');

    const result = await hotelService.getPopularDestinations();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Popular destinations route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular destinations',
    });
  }
});

// Get hotel deals
router.get('/deals', [
  query('destination').optional().isString().withMessage('Destination must be string'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
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

    const filters = {
      destination: req.query.destination,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    };

    console.log('Hotel deals request:', filters);

    const result = await hotelService.getHotelDeals();
    
    if (result.success) {
      // Apply filters if provided
      let deals = result.data;
      
      if (filters.destination) {
        deals = deals.filter(deal => 
          deal.destination.toLowerCase().includes(filters.destination.toLowerCase())
        );
      }
      
      if (filters.maxPrice) {
        deals = deals.filter(deal => deal.price <= filters.maxPrice);
      }

      res.json({
        success: true,
        data: deals,
        filters,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Hotel deals route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hotel deals',
    });
  }
});

// Search hotels with POST (for complex queries)
router.post('/search', [
  body('destination').isString().withMessage('Destination is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  body('guests').optional().isInt({ min: 1, max: 10 }).withMessage('Guests must be between 1 and 10'),
  body('rooms').optional().isInt({ min: 1, max: 5 }).withMessage('Rooms must be between 1 and 5'),
  body('hotelStars').optional().isInt({ min: 1, max: 5 }).withMessage('Hotel stars must be between 1 and 5'),
  body('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  body('amenities').optional().isArray().withMessage('Amenities must be array'),
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

    const searchParams = {
      destination: req.body.destination,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      guests: req.body.guests || 1,
      rooms: req.body.rooms || 1,
      hotelStars: req.body.hotelStars,
      maxPrice: req.body.maxPrice,
      amenities: req.body.amenities || [],
    };

    console.log('Hotel search POST request:', searchParams);

    const result = await hotelService.searchHotels(searchParams);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        searchParams,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Hotel search POST route error:', error);
    res.status(500).json({
      success: false,
      error: 'Hotel search failed',
    });
  }
});

module.exports = router;