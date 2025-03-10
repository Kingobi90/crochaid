import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { eventId, userId } = session.metadata!;

    // Create booking record
    const bookingRef = doc(db, 'bookings', session.id);
    await setDoc(bookingRef, {
      eventId,
      userId,
      status: 'confirmed',
      paymentId: session.payment_intent,
      amount: session.amount_total! / 100, // Convert from cents to dollars
      createdAt: serverTimestamp(),
    });
  }

  return NextResponse.json({ received: true });
} 