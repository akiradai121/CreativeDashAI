import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "your-stripe-secret-key", {
  apiVersion: "2023-10-16",
});

// Webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "your-webhook-secret";

// Define product IDs
export const STRIPE_PRODUCTS = {
  FREE: "free",
  CREATOR: "creator",
  PRO: "pro",
};

// Price IDs (get these from your Stripe dashboard)
export const STRIPE_PRICES = {
  CREATOR: process.env.STRIPE_CREATOR_PRICE_ID || "price_creator",
  PRO: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
};

// Create a Stripe customer
export async function createStripeCustomer(
  email: string,
  name: string
): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: "prompt2book",
      },
    });

    return customer.id;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new Error(`Failed to create Stripe customer: ${error}`);
  }
}

// Create a checkout session
export async function createCheckoutSession(
  customerId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  try {
    let priceId;
    switch (planId) {
      case STRIPE_PRODUCTS.CREATOR:
        priceId = STRIPE_PRICES.CREATOR;
        break;
      case STRIPE_PRODUCTS.PRO:
        priceId = STRIPE_PRICES.PRO;
        break;
      default:
        throw new Error("Invalid plan ID");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan: planId,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(`Failed to create checkout session: ${error}`);
  }
}

// Handle Stripe webhook
export async function handleStripeWebhook(
  payload: any,
  sigHeader: string
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    throw new Error(`Webhook Error: ${error}`);
  }
}

// Get customer subscription status
export async function getCustomerSubscriptionStatus(
  customerId: string
): Promise<{
  status: string;
  plan: string;
  currentPeriodEnd: number | null;
}> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return {
        status: "inactive",
        plan: "free",
        currentPeriodEnd: null,
      };
    }

    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);

    return {
      status: subscription.status,
      plan: product.metadata.plan || "free",
      currentPeriodEnd: subscription.current_period_end,
    };
  } catch (error) {
    console.error("Error getting customer subscription status:", error);
    return {
      status: "error",
      plan: "free",
      currentPeriodEnd: null,
    };
  }
}

// Cancel a subscription
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    return stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error(`Failed to cancel subscription: ${error}`);
  }
}
