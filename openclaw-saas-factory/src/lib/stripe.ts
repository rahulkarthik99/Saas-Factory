import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey ? new Stripe(secretKey, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'OpenClaw SaaS Factory',
    version: '0.1.0'
  }
}) : null;
