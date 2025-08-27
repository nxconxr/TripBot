const express = require('express');
const { body, validationResult } = require('express-validator');
const gptService = require('../services/gpt');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Generate travel suggestion based on user prompt
router.post('/travel-suggestion', [
  body('prompt')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt must be between 10 and 500 characters'),
  body('userId').optional().isString(),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { prompt, userId } = req.body;
    
    console.log('Generating travel suggestion for prompt:', prompt);

    const result = await gptService.generateTravelSuggestion(prompt);
    
    if (result.success) {
      // Log the interaction if user is authenticated
      if (req.user) {
        console.log(`Travel suggestion generated for user ${req.user.uid}`);
      }

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
    console.error('Travel suggestion route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate travel suggestion',
    });
  }
});

// Generate travel hacks PDF
router.post('/travel-hacks', [
  body('bookingDetails').isObject().withMessage('Booking details are required'),
  body('bookingDetails.destination').isString().withMessage('Destination is required'),
  body('bookingDetails.departureDate').isString().withMessage('Departure date is required'),
  body('bookingDetails.returnDate').optional().isString(),
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

    const { bookingDetails } = req.body;
    
    console.log('Generating travel hacks for booking:', bookingDetails);

    const hacks = await gptService.generateTravelHacks(bookingDetails);
    
    res.json({
      success: true,
      data: {
        hacks,
        bookingDetails,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Travel hacks route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate travel hacks',
    });
  }
});

// Chat with TripBot AI
router.post('/chat', [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('conversationHistory').optional().isArray(),
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { message, conversationHistory = [] } = req.body;
    
    console.log('Chat message received:', message.substring(0, 100) + '...');

    const result = await gptService.chatWithUser(message, conversationHistory);
    
    if (result.success) {
      // Log the chat interaction
      if (req.user) {
        console.log(`Chat interaction for user ${req.user.uid}`);
      }

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
    console.error('Chat route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
    });
  }
});

// Analyze travel trends
router.post('/travel-trends', [
  body('destination').isString().withMessage('Destination is required'),
  body('dateRange').isString().withMessage('Date range is required'),
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

    const { destination, dateRange } = req.body;
    
    console.log('Analyzing travel trends for:', destination, dateRange);

    const result = await gptService.analyzeTravelTrends(destination, dateRange);
    
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
    console.error('Travel trends route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze travel trends',
    });
  }
});

// Get AI model information
router.get('/model-info', (req, res) => {
  res.json({
    success: true,
    data: {
      model: process.env.OPENROUTER_MODEL || 'gpt-4',
      provider: 'OpenRouter',
      capabilities: [
        'Travel planning and suggestions',
        'Flight and hotel recommendations',
        'Travel hacks and tips',
        'Conversational assistance',
        'Trend analysis',
      ],
      supportedLanguages: ['German', 'English'],
    },
  });
});

module.exports = router;