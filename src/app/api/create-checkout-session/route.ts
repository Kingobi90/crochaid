import { NextResponse } from 'next/server';
import { stripe, BASE_URL } from '@/lib/stripe/config';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { eventId, userId, eventTitle, price } = await request.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: eventTitle,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/payment/error`,
      metadata: {
        eventId,
        userId,
      },
    });

    // Update event attendee count
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      currentAttendees: increment(1),
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 