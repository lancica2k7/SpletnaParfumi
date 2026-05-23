const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️  WARNING: STRIPE_SECRET_KEY is not set in .env file');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

module.exports = stripe;

