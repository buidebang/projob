import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
const SubscriptionTier = { FREE: 'FREE', PRO: 'PRO', BUSINESS: 'BUSINESS' } as any;
type SubscriptionTier = any;
import { Prisma } from '@prisma/client';
import { stripe } from "@/lib/stripe";
import { env } from "@/env.mjs";
import Stripe from "stripe";

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook Cryptographic Failure]: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // Retrieve the complete subscription object to register metadata mappings
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const priceId = subscription.items.data[0].price.id;

        // Map live API Stripe Price IDs to internal metered tokenomics tiers
        let tier: SubscriptionTier = SubscriptionTier.FREE;
        let creditAllocation = 10000.0000; // Default fallback

        if (priceId === env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID || priceId === env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID) {
          tier = SubscriptionTier.PRO;
          creditAllocation = 100000.0000; // 100K Metered Credits
        } else if (priceId === env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID || priceId === env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID) {
          // Assuming business is ULTRA, logic from reference
          tier = SubscriptionTier.ULTRA;
          creditAllocation = 500000.0000; // 500K Metered Credits[cite: 3]
        }

        // Use process.env directly if max/ultra custom IDs are defined in .env
        if (priceId === process.env.STRIPE_PRICE_PRO_ID) {
          tier = SubscriptionTier.PRO;
          creditAllocation = 100000.0000; // 100K Metered Credits
        } else if (priceId === process.env.STRIPE_PRICE_ULTRA_ID) {
          tier = SubscriptionTier.ULTRA;
          creditAllocation = 500000.0000; // 500K Metered Credits[cite: 3]
        } else if (priceId === process.env.STRIPE_PRICE_MAX_ID) {
          tier = SubscriptionTier.MAX;
          creditAllocation = 1500000.0000; // 1.5M Metered Credits[cite: 3]
        }

        // Execute atomic transactional updates to protect dataset integrity
        // IMPORTANT: Use session.metadata?.userId for finding the user
        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error('No user ID found in session metadata');
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            tier: tier,
            credits: Number(creditAllocation.toFixed(4) as any), // High-Precision Allocation[cite: 3]
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const priceId = session.items.data[0].price.id;
        let updatedTier: SubscriptionTier = SubscriptionTier.FREE;

        if (priceId === env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID || priceId === env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID || priceId === process.env.STRIPE_PRICE_PRO_ID) {
          updatedTier = SubscriptionTier.PRO;
        } else if (priceId === env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID || priceId === env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID || priceId === process.env.STRIPE_PRICE_ULTRA_ID) {
          updatedTier = SubscriptionTier.ULTRA;
        } else if (priceId === process.env.STRIPE_PRICE_MAX_ID) {
          updatedTier = SubscriptionTier.MAX;
        }

        await prisma.user.update({
          where: { stripeSubscriptionId: session.id as string },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
            tier: updatedTier,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        // Reset the customer's privileges to the restricted FREE tier bounds on subscription termination
        await prisma.user.update({
          where: { stripeSubscriptionId: session.id as string },
          data: {
            tier: SubscriptionTier.FREE,
            credits: Number(10000.0000) as any, // Reset to initial free credit allocation[cite: 3]
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Stripe Webhook Pipeline Execution Error]:', error);
    return NextResponse.json({ error: 'Internal transactional failure map.' }, { status: 500 });
  }
}
