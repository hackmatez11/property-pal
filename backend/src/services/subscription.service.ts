import { supabaseAdmin } from '../config/supabase';
import stripe from '../config/stripe';
import { AppError } from '../utils/response';
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../types';

const PLAN_LIMITS = {
  basic: { listingLimit: 5, price: 999 },
  premium: { listingLimit: 25, price: 2999 },
  enterprise: { listingLimit: 100, price: 9999 },
};

export class SubscriptionService {
  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethodId: string
  ): Promise<Subscription> {
    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', SubscriptionStatus.ACTIVE)
      .single();

    if (existingSubscription) {
      throw new AppError(400, 'SUBSCRIPTION_EXISTS', 'User already has an active subscription');
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('contact_email')
      .eq('id', userId)
      .single();

    if (!profile?.contact_email) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'User profile not found');
    }

    try {
      // Create or retrieve Stripe customer
      let customer;
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .not('stripe_customer_id', 'is', null)
        .limit(1)
        .single();

      if (existingSub?.stripe_customer_id) {
        customer = await stripe.customers.retrieve(existingSub.stripe_customer_id);
      } else {
        customer = await stripe.customers.create({
          email: profile.contact_email,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${plan.toUpperCase()} Plan`,
              },
              unit_amount: PLAN_LIMITS[plan].price * 100,
              recurring: {
                interval: 'month',
              },
            },
          },
        ],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Create subscription record
      const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan,
          status: SubscriptionStatus.ACTIVE,
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: customer.id,
          listing_limit: PLAN_LIMITS[plan].listingLimit,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new AppError(500, 'SUBSCRIPTION_CREATION_FAILED', error.message);
      }

      return subscription;
    } catch (error: any) {
      throw new AppError(500, 'STRIPE_ERROR', error.message);
    }
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError(500, 'DATABASE_ERROR', error.message);
    }

    return subscription;
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<void> {
    // Verify ownership
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscription) {
      throw new AppError(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new AppError(400, 'SUBSCRIPTION_NOT_ACTIVE', 'Subscription is not active');
    }

    try {
      // Cancel Stripe subscription
      if (subscription.stripe_subscription_id) {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      }

      // Update subscription status
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: SubscriptionStatus.CANCELLED })
        .eq('id', subscriptionId);

      if (updateError) {
        throw new AppError(500, 'SUBSCRIPTION_UPDATE_FAILED', updateError.message);
      }
    } catch (error: any) {
      throw new AppError(500, 'CANCELLATION_FAILED', error.message);
    }
  }

  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  private async handleSubscriptionUpdate(subscription: any): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscription.status === 'active' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.INACTIVE,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw new AppError(500, 'WEBHOOK_UPDATE_FAILED', error.message);
    }
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: SubscriptionStatus.CANCELLED })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw new AppError(500, 'WEBHOOK_UPDATE_FAILED', error.message);
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Extend subscription expiration
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: SubscriptionStatus.ACTIVE,
        expires_at: expiresAt.toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      throw new AppError(500, 'WEBHOOK_UPDATE_FAILED', error.message);
    }
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: SubscriptionStatus.INACTIVE })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      throw new AppError(500, 'WEBHOOK_UPDATE_FAILED', error.message);
    }
  }
}

export default new SubscriptionService();
