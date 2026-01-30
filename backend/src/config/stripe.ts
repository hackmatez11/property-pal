import Stripe from 'stripe';
import { config } from './index';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export default stripe;
