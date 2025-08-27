const express = require('express');
const { query, body, validationResult } = require('express-validator');
const flightService = require('../services/flights');

const router = express.Router();

// Search flights
router.get('/search', [
  query('origin').isString().withMessage('Origin is required'),
  query('destination').isString().withMessage('Destination is required'),
  query('departureDate').isISO8601().withMessage('Valid departure date is required'),
  query('returnDate').optional().isISO8601().withMessage('Return date must be valid'),
  query('travelers').optional().isInt({ min: 1, max: 9 }).withMessage('Travelers must be between 1 and 9'),
  query('cabinClass').optional().isIn(['economy', 'premium_economy', 'business', 'first']).withMessage('Invalid cabin class'),
  query('directFlights').optional().isBoolean().withMessage('Direct flights must be boolean'),
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
      origin: req.query.origin.toUpperCase(),
      destination: req.query.destination.toUpperCase(),
      departureDate: req.query.departureDate,
      returnDate: req.query.returnDate,
      travelers: parseInt(req.query.travelers) || 1,
      cabinClass: req.query.cabinClass || 'economy',
      directFlights: req.query.directFlights === 'true',
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    };

    console.log('Flight search request:', searchParams);

    const result = await flightService.searchFlights(searchParams);
    
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
    console.error('Flight search route error:', error);
    res.status(500).json({
      success: false,
      error: 'Flight search failed',
    });
  }
});

// Get flight status
router.get('/status/:flightNumber', [
  query('date').optional().isISO8601().withMessage('Date must be valid'),
], async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const { date } = req.query;

    console.log('Flight status request:', { flightNumber, date });

    const result = await flightService.getFlightStatus(flightNumber);
    
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
    console.error('Flight status route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get flight status',
    });
  }
});

// Get popular routes
router.get('/popular-routes', async (req, res) => {
  try {
    console.log('Popular routes request');

    const result = await flightService.getPopularRoutes();
    
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
    console.error('Popular routes route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular routes',
    });
  }
});

// Get flight deals
router.get('/deals', [
  query('origin').optional().isString().withMessage('Origin must be string'),
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
      origin: req.query.origin?.toUpperCase(),
      destination: req.query.destination?.toUpperCase(),
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    };

    console.log('Flight deals request:', filters);

    const result = await flightService.getFlightDeals();
    
    if (result.success) {
      // Apply filters if provided
      let deals = result.data;
      
      if (filters.origin) {
        deals = deals.filter(deal => deal.origin === filters.origin);
      }
      
      if (filters.destination) {
        deals = deals.filter(deal => deal.destination === filters.destination);
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
    console.error('Flight deals route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get flight deals',
    });
  }
});

// Get flight details
router.get('/details/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;

    console.log('Flight details request:', flightId);

    // Mock flight details for now
    const flightDetails = {
      id: flightId,
      airline: 'Lufthansa',
      flightNumber: 'LH1234',
      origin: 'BER',
      destination: 'MUC',
      departureTime: '2024-02-15 10:30:00',
      arrivalTime: '2024-02-15 11:45:00',
      duration: '1h 15m',
      aircraft: 'Airbus A320',
      terminal: '1',
      gate: 'A15',
      status: 'On Time',
      price: 189.99,
      currency: 'EUR',
      cabinClass: 'economy',
      amenities: ['WiFi', 'Entertainment', 'Refreshments'],
      baggage: {
        carryOn: '1 piece (8kg)',
        checked: '1 piece (23kg)',
      },
      seatMap: 'https://example.com/seatmap',
      bookingLink: 'https://booking.example.com/flight/1234',
    };

    res.json({
      success: true,
      data: flightDetails,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Flight details route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get flight details',
    });
  }
});

// Search flights with POST (for complex queries)
router.post('/search', [
  body('origin').isString().withMessage('Origin is required'),
  body('destination').isString().withMessage('Destination is required'),
  body('departureDate').isISO8601().withMessage('Valid departure date is required'),
  body('returnDate').optional().isISO8601().withMessage('Return date must be valid'),
  body('travelers').optional().isInt({ min: 1, max: 9 }).withMessage('Travelers must be between 1 and 9'),
  body('cabinClass').optional().isIn(['economy', 'premium_economy', 'business', 'first']).withMessage('Invalid cabin class'),
  body('directFlights').optional().isBoolean().withMessage('Direct flights must be boolean'),
  body('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
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

    const searchParams = {
      origin: req.body.origin.toUpperCase(),
      destination: req.body.destination.toUpperCase(),
      departureDate: req.body.departureDate,
      returnDate: req.body.returnDate,
      travelers: req.body.travelers || 1,
      cabinClass: req.body.cabinClass || 'economy',
      directFlights: req.body.directFlights || false,
      maxPrice: req.body.maxPrice,
      preferences: req.body.preferences,
    };

    console.log('Flight search POST request:', searchParams);

    const result = await flightService.searchFlights(searchParams);
    
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
    console.error('Flight search POST route error:', error);
    res.status(500).json({
      success: false,
      error: 'Flight search failed',
    });
  }
});

module.exports = router;