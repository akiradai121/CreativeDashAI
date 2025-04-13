import Stripe from "stripe";

// Initialize Stripe client with fallback handling for missing keys
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn("STRIPE_SECRET_KEY is not set. Stripe functionality will be limited.");
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  });
};

const stripe = getStripeInstance();

// Webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Define product IDs
export const STRIPE_PRODUCTS = {
  FREE: "free",
  CREATOR: "creator",  // $9.99/month
  PRO: "pro",          // $19.98/month
};

// Define prices - these should match Stripe dashboard price IDs
export const STRIPE_PRICES = {
  CREATOR: process.env.STRIPE_CREATOR_PRICE_ID || "price_creator", // $9.99/month
  PRO: process.env.STRIPE_PRO_PRICE_ID || "price_pro",             // $19.98/month
};

// Define plan limits
export const PLAN_LIMITS = {
  FREE: {
    booksRemaining: 1,
    pagesRemaining: 10,
    imageCredits: 0,
  },
  CREATOR: {
    booksRemaining: 5,
    pagesRemaining: 200,
    imageCredits: 10,
  },
  PRO: {
    booksRemaining: 999, // Effectively unlimited
    pagesRemaining: 1000,
    imageCredits: 50,
  },
};

// Create a Stripe customer
export async function createStripeCustomer(
  email: string,
  name: string
): Promise<string> {
  if (!stripe) {
    console.warn("Stripe client not initialized - returning mock customer ID");
    return `mock_customer_${Date.now()}`;
  }
  
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
): Promise<Stripe.Checkout.Session | any> {
  if (!stripe) {
    console.warn("Stripe client not initialized - returning mock checkout session");
    return {
      id: `mock_session_${Date.now()}`,
      url: successUrl,
    };
  }
  
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
): Promise<Stripe.Event | any> {
  if (!stripe || !endpointSecret) {
    console.warn("Stripe client or webhook secret not initialized - returning mock event");
    return {
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "mock_customer",
          metadata: {
            plan: "creator"
          }
        }
      }
    };
  }
  
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
  if (!stripe) {
    console.warn("Stripe client not initialized - returning free plan status");
    return {
      status: "inactive",
      plan: "free",
      currentPeriodEnd: null,
    };
  }
  
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
      currentPeriodEnd: subscription.current_period_end || null,
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
): Promise<Stripe.Subscription | any> {
  if (!stripe) {
    console.warn("Stripe client not initialized - returning mock subscription cancellation");
    return {
      id: subscriptionId,
      status: "canceled"
    };
  }
  
  try {
    return stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error(`Failed to cancel subscription: ${error}`);
  }
}
