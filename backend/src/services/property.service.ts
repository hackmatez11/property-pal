import { supabaseAdmin } from '../config/supabase';
import redisClient from '../config/redis';
import { AppError } from '../utils/response';
import {
  Property,
  PropertyStatus,
  PropertyFilters,
  PaginationOptions,
  UserRole,
} from '../types';

export class PropertyService {
  async createProperty(dealerId: string, propertyData: Partial<Property>): Promise<Property> {
    // Check subscription limits
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('listing_limit, status')
      .eq('user_id', dealerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription || subscription.status !== 'active') {
      throw new AppError(403, 'SUBSCRIPTION_INACTIVE', 'Active subscription required');
    }

    // Count current listings
    const { count } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .neq('status', PropertyStatus.ARCHIVED);

    if ((count || 0) >= subscription.listing_limit) {
      throw new AppError(403, 'LISTING_LIMIT_REACHED', 'Listing limit reached for current plan');
    }

    // Create property
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .insert({
        dealer_id: dealerId,
        ...propertyData,
        status: PropertyStatus.DRAFT,
        views_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'PROPERTY_CREATION_FAILED', error.message);
    }

    // Invalidate cache
    await this.invalidatePropertyCache();

    return property;
  }

  async updateProperty(
    propertyId: string,
    dealerId: string,
    updates: Partial<Property>
  ): Promise<Property> {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('dealer_id', dealerId)
      .single();

    if (fetchError || !existing) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found or access denied');
    }

    // Update property
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'PROPERTY_UPDATE_FAILED', error.message);
    }

    // Invalidate cache
    await this.invalidatePropertyCache(propertyId);

    return property;
  }

  async getProperty(propertyId: string, userId?: string): Promise<Property> {
    // Try cache first
    const cacheKey = `property:${propertyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const property = JSON.parse(cached);
        // Increment view count asynchronously
        this.incrementViewCount(propertyId);
        return property;
      }
    } catch (error) {
      // Cache miss or error, continue
    }

    // Fetch from database
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }

    // Check access permissions
    if (property.status === PropertyStatus.DRAFT && property.dealer_id !== userId) {
      throw new AppError(403, 'ACCESS_DENIED', 'Cannot access draft property');
    }

    // Cache for 5 minutes
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(property));
    } catch (error) {
      // Cache error, continue
    }

    // Increment view count
    this.incrementViewCount(propertyId);

    return property;
  }

  async listProperties(
    filters: PropertyFilters,
    pagination: PaginationOptions,
    userId?: string,
    userRole?: UserRole
  ): Promise<{ properties: Property[]; total: number }> {
    // Build query
    let query = supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.state) {
      query = query.ilike('state', `%${filters.state}%`);
    }
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.min_price !== undefined) {
      query = query.gte('price', filters.min_price);
    }
    if (filters.max_price !== undefined) {
      query = query.lte('price', filters.max_price);
    }
    if (filters.min_size !== undefined) {
      query = query.gte('size', filters.min_size);
    }
    if (filters.max_size !== undefined) {
      query = query.lte('size', filters.max_size);
    }
    if (filters.bedrooms !== undefined) {
      query = query.eq('bedrooms', filters.bedrooms);
    }
    if (filters.bathrooms !== undefined) {
      query = query.eq('bathrooms', filters.bathrooms);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }

    // Status filter - only dealers can see their own drafts
    if (userRole === UserRole.DEALER && userId) {
      query = query.or(`status.eq.published,and(status.eq.draft,dealer_id.eq.${userId})`);
    } else {
      query = query.eq('status', PropertyStatus.PUBLISHED);
    }

    // Sorting
    const sortBy = pagination.sortBy || 'created_at';
    const sortOrder = pagination.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.range(offset, offset + pagination.limit - 1);

    const { data: properties, error, count } = await query;

    if (error) {
      throw new AppError(500, 'PROPERTY_FETCH_FAILED', error.message);
    }

    return {
      properties: properties || [],
      total: count || 0,
    };
  }

  async deleteProperty(propertyId: string, dealerId: string): Promise<void> {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('dealer_id', dealerId)
      .single();

    if (fetchError || !existing) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found or access denied');
    }

    // Soft delete (archive)
    const { error } = await supabaseAdmin
      .from('properties')
      .update({ status: PropertyStatus.ARCHIVED })
      .eq('id', propertyId);

    if (error) {
      throw new AppError(500, 'PROPERTY_DELETE_FAILED', error.message);
    }

    // Invalidate cache
    await this.invalidatePropertyCache(propertyId);
  }

  async getDealerProperties(
    dealerId: string,
    pagination: PaginationOptions
  ): Promise<{ properties: Property[]; total: number }> {
    const offset = (pagination.page - 1) * pagination.limit;

    const { data: properties, error, count } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('dealer_id', dealerId)
      .neq('status', PropertyStatus.ARCHIVED)
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1);

    if (error) {
      throw new AppError(500, 'PROPERTY_FETCH_FAILED', error.message);
    }

    return {
      properties: properties || [],
      total: count || 0,
    };
  }

  private async incrementViewCount(propertyId: string): Promise<void> {
    // Increment asynchronously without blocking
    supabaseAdmin
      .rpc('increment_property_views', { property_id: propertyId })
      .then(() => {
        // Invalidate cache after view count update
        this.invalidatePropertyCache(propertyId);
      })
      .catch(() => {
        // Silently fail
      });
  }

  private async invalidatePropertyCache(propertyId?: string): Promise<void> {
    try {
      if (propertyId) {
        await redisClient.del(`property:${propertyId}`);
      }
      // Invalidate list caches (using pattern matching)
      const keys = await redisClient.keys('properties:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      // Cache error, continue
    }
  }
}

export default new PropertyService();
