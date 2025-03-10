import Stripe from 'stripe';

// Stripe API version that's compatible with our implementation
export const STRIPE_API_VERSION = '2025-02-24.acacia' as const;

// Initialize Stripe instance for server-side operations
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

// Stripe public key for client-side operations
export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// Stripe webhook secret for verifying webhook events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Base URL for success/error redirects
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!; 