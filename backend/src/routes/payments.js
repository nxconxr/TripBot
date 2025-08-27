const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Create payment intent
router.post('/create-intent', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('currency').optional().isString().withMessage('Currency must be string'),
  body('description').optional().isString().withMessage('Description must be string'),
  body('metadata').optional().isObject().withMessage('Metadata must be object'),
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
    const { amount, currency = 'eur', description, metadata = {} } = req.body;

    console.log('Creating payment intent:', { uid, amount, currency, description });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      description: description || 'TripBot AI Booking',
      metadata: {
        userId: uid,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
    });
  }
});

// Confirm payment
router.post('/confirm', [
  body('paymentIntentId').isString().withMessage('Payment intent ID is required'),
  body('paymentMethodId').optional().isString().withMessage('Payment method ID must be string'),
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
    const { paymentIntentId, paymentMethodId } = req.body;

    console.log('Confirming payment:', { uid, paymentIntentId });

    let paymentIntent;

    if (paymentMethodId) {
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
    } else {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    }

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        data: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
        },
        message: 'Payment confirmed successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not successful',
        data: {
          status: paymentIntent.status,
          lastPaymentError: paymentIntent.last_payment_error,
        },
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
    });
  }
});

// Get payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const { uid } = req.user;

    console.log('Getting payment methods for user:', uid);

    // In a real app, you'd store customer IDs in your database
    // For demo purposes, we'll create a customer ID based on the user ID
    const customerId = `customer_${uid}`;

    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      // Create customer if doesn't exist
      customer = await stripe.customers.create({
        id: customerId,
        email: req.user.email,
        name: req.user.displayName,
        metadata: {
          userId: uid,
        },
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    res.json({
      success: true,
      data: paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        },
      })),
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment methods',
    });
  }
});

// Add payment method
router.post('/payment-methods', [
  body('paymentMethodId').isString().withMessage('Payment method ID is required'),
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
    const { paymentMethodId } = req.body;

    console.log('Adding payment method:', { uid, paymentMethodId });

    const customerId = `customer_${uid}`;

    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      customer = await stripe.customers.create({
        id: customerId,
        email: req.user.email,
        name: req.user.displayName,
        metadata: {
          userId: uid,
        },
      });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    res.json({
      success: true,
      message: 'Payment method added successfully',
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add payment method',
    });
  }
});

// Remove payment method
router.delete('/payment-methods/:paymentMethodId', async (req, res) => {
  try {
    const { uid } = req.user;
    const { paymentMethodId } = req.params;

    console.log('Removing payment method:', { uid, paymentMethodId });

    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove payment method',
    });
  }
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const { uid } = req.user;
    const { limit = 10, startingAfter } = req.query;

    console.log('Getting payment history for user:', uid);

    const customerId = `customer_${uid}`;

    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      // Customer doesn't exist, return empty history
      return res.json({
        success: true,
        data: [],
      });
    }

    const payments = await stripe.paymentIntents.list({
      customer: customer.id,
      limit: parseInt(limit),
      starting_after: startingAfter,
    });

    res.json({
      success: true,
      data: payments.data.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        created: new Date(payment.created * 1000).toISOString(),
        receiptUrl: payment.charges.data[0]?.receipt_url,
      })),
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history',
    });
  }
});

// Create refund
router.post('/refund', [
  body('paymentIntentId').isString().withMessage('Payment intent ID is required'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('reason').optional().isString().withMessage('Reason must be string'),
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
    const { paymentIntentId, amount, reason } = req.body;

    console.log('Creating refund:', { uid, paymentIntentId, amount, reason });

    const refundData = {
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);

    res.json({
      success: true,
      data: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: new Date(refund.created * 1000).toISOString(),
      },
      message: 'Refund created successfully',
    });
  } catch (error) {
    console.error('Create refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create refund',
    });
  }
});

// Get available payment methods
router.get('/available-methods', (req, res) => {
  res.json({
    success: true,
    data: {
      card: {
        name: 'Credit/Debit Card',
        icon: '💳',
        supported: ['visa', 'mastercard', 'amex', 'discover'],
      },
      sepa: {
        name: 'SEPA Direct Debit',
        icon: '🏦',
        supported: ['de'],
      },
      klarna: {
        name: 'Klarna',
        icon: '🛒',
        supported: ['de', 'at', 'ch'],
      },
      paypal: {
        name: 'PayPal',
        icon: '📱',
        supported: ['de', 'at', 'ch'],
      },
      applePay: {
        name: 'Apple Pay',
        icon: '🍎',
        supported: ['de', 'at', 'ch'],
      },
    },
  });
});

module.exports = router;