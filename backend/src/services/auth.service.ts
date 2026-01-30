import { supabaseAdmin, createSupabaseClient } from '../config/supabase';
import { AppError } from '../utils/response';
import {
  UserRole,
  AuthResponse,
  FeatureFlags,
  SubscriptionStatus,
} from '../types';

export class AuthService {
  async signUp(
    email: string,
    password: string,
    role: UserRole,
    companyName?: string,
    contactPhone?: string
  ) {
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new AppError(400, 'SIGNUP_FAILED', authError?.message || 'Failed to create user');
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      role,
      company_name: companyName,
      contact_phone: contactPhone,
      contact_email: email,
    });

    if (profileError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new AppError(500, 'PROFILE_CREATION_FAILED', profileError.message);
    }

    // If dealer, create default subscription (trial)
    if (role === UserRole.DEALER) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14); // 14-day trial

      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: authData.user.id,
          plan: 'basic',
          status: SubscriptionStatus.ACTIVE,
          listing_limit: 5,
          expires_at: expiresAt.toISOString(),
        });

      if (subscriptionError) {
        throw new AppError(500, 'SUBSCRIPTION_CREATION_FAILED', subscriptionError.message);
      }
    }

    return {
      user: authData.user,
      message: 'User created successfully',
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse & { accessToken: string }> {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new AppError(401, 'SIGNIN_FAILED', 'Invalid credentials');
    }

    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'User profile not found');
    }

    let subscriptionStatus: SubscriptionStatus | undefined;

    // Get subscription status for dealers
    if (profile.role === UserRole.DEALER) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      subscriptionStatus = subscription?.status;
    }

    return {
      isAuthenticated: true,
      role: profile.role,
      subscriptionStatus,
      userId: data.user.id,
      email: data.user.email,
      accessToken: data.session?.access_token || '',
    };
  }

  async getAuthStatus(userId: string): Promise<AuthResponse> {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'User profile not found');
    }

    let subscriptionStatus: SubscriptionStatus | undefined;

    if (profile.role === UserRole.DEALER) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      subscriptionStatus = subscription?.status;
    }

    return {
      isAuthenticated: true,
      role: profile.role,
      subscriptionStatus,
      userId,
    };
  }

  async getFeatureFlags(userId: string): Promise<FeatureFlags> {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || profile.role !== UserRole.DEALER) {
      return {
        canPostProperty: false,
        remainingListings: 0,
        canAccessAnalytics: false,
        canExportLeads: false,
      };
    }

    // Get subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      return {
        canPostProperty: false,
        remainingListings: 0,
        canAccessAnalytics: false,
        canExportLeads: false,
      };
    }

    // Count current listings
    const { count } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', userId)
      .neq('status', 'archived');

    const remainingListings = Math.max(0, subscription.listing_limit - (count || 0));

    return {
      canPostProperty: remainingListings > 0,
      remainingListings,
      canAccessAnalytics: subscription.plan !== 'basic',
      canExportLeads: subscription.plan === 'enterprise',
    };
  }
}

export default new AuthService();
