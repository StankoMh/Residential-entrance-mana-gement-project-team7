import { loadStripe, Stripe } from '@stripe/stripe-js';

// ВАЖНО: Заменете с вашия Stripe Publishable Key
// Може да го намерите в Stripe Dashboard -> Developers -> API keys
const STRIPE_PUBLISHABLE_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) || 'pk_test_YOUR_KEY_HERE';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};