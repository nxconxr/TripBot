const express = require('express');
const axios = require('axios');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const healthChecks = {
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        env: process.env.NODE_ENV || 'development',
      },
      apis: {},
    };

    // Check external APIs
    const apiChecks = [
      {
        name: 'openrouter',
        url: process.env.OPENROUTER_BASE_URL,
        check: async () => {
          try {
            const response = await axios.get(`${process.env.OPENROUTER_BASE_URL}/models`, {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              },
              timeout: 5000,
            });
            return response.status === 200;
          } catch (error) {
            return false;
          }
        },
      },
      {
        name: 'stripe',
        url: 'https://api.stripe.com',
        check: async () => {
          try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            await stripe.paymentMethods.list({ limit: 1 });
            return true;
          } catch (error) {
            return false;
          }
        },
      },
    ];

    // Run API checks
    for (const apiCheck of apiChecks) {
      try {
        const isHealthy = await apiCheck.check();
        healthChecks.apis[apiCheck.name] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          url: apiCheck.url,
        };
      } catch (error) {
        healthChecks.apis[apiCheck.name] = {
          status: 'error',
          url: apiCheck.url,
          error: error.message,
        };
      }
    }

    // Determine overall health
    const allApisHealthy = Object.values(healthChecks.apis).every(
      api => api.status === 'healthy'
    );

    const overallStatus = allApisHealthy ? 'healthy' : 'degraded';

    res.json({
      success: true,
      data: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: healthChecks,
      },
    });
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    });
  }
});

// API status check
router.get('/api-status', async (req, res) => {
  try {
    const apiStatus = {
      gpt: {
        status: 'operational',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
      },
      flights: {
        status: 'operational',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
      },
      hotels: {
        status: 'operational',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
      },
      payments: {
        status: 'operational',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
      },
    };

    // Test GPT service
    try {
      const startTime = Date.now();
      const gptService = require('../services/gpt');
      await gptService.chatWithUser('Test message');
      apiStatus.gpt.responseTime = Date.now() - startTime;
    } catch (error) {
      apiStatus.gpt.status = 'degraded';
      apiStatus.gpt.error = error.message;
    }

    // Test flight service
    try {
      const startTime = Date.now();
      const flightService = require('../services/flights');
      await flightService.getPopularRoutes();
      apiStatus.flights.responseTime = Date.now() - startTime;
    } catch (error) {
      apiStatus.flights.status = 'degraded';
      apiStatus.flights.error = error.message;
    }

    // Test hotel service
    try {
      const startTime = Date.now();
      const hotelService = require('../services/hotels');
      await hotelService.getPopularDestinations();
      apiStatus.hotels.responseTime = Date.now() - startTime;
    } catch (error) {
      apiStatus.hotels.status = 'degraded';
      apiStatus.hotels.error = error.message;
    }

    // Test payment service
    try {
      const startTime = Date.now();
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.paymentMethods.list({ limit: 1 });
      apiStatus.payments.responseTime = Date.now() - startTime;
    } catch (error) {
      apiStatus.payments.status = 'degraded';
      apiStatus.payments.error = error.message;
    }

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        services: apiStatus,
      },
    });
  } catch (error) {
    console.error('API status check error:', error);
    res.status(500).json({
      success: false,
      error: 'API status check failed',
    });
  }
});

// System metrics
router.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
    process: {
      pid: process.pid,
      title: process.title,
      version: process.version,
      arch: process.arch,
    },
  };

  res.json({
    success: true,
    data: metrics,
  });
});

// Readiness check
router.get('/ready', (req, res) => {
  // Add any readiness checks here (database connections, etc.)
  const isReady = true; // Replace with actual readiness logic

  if (isReady) {
    res.json({
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Service not ready',
      data: {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;