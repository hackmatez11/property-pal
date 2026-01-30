import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../utils/response';
import { Lead, PaginationOptions } from '../types';

export class LeadService {
  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    // Verify property exists
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('dealer_id')
      .eq('id', leadData.property_id!)
      .single();

    if (propertyError || !property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }

    // Create lead
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert({
        ...leadData,
        dealer_id: property.dealer_id,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'LEAD_CREATION_FAILED', error.message);
    }

    // TODO: Send notification to dealer (email/SMS)

    return lead;
  }

  async getDealerLeads(
    dealerId: string,
    pagination: PaginationOptions,
    propertyId?: string
  ): Promise<{ leads: Lead[]; total: number }> {
    let query = supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('dealer_id', dealerId);

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const offset = (pagination.page - 1) * pagination.limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1);

    const { data: leads, error, count } = await query;

    if (error) {
      throw new AppError(500, 'LEAD_FETCH_FAILED', error.message);
    }

    return {
      leads: leads || [],
      total: count || 0,
    };
  }

  async updateLeadStatus(
    leadId: string,
    dealerId: string,
    status: string
  ): Promise<Lead> {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('dealer_id', dealerId)
      .single();

    if (fetchError || !existing) {
      throw new AppError(404, 'LEAD_NOT_FOUND', 'Lead not found or access denied');
    }

    // Update status
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'LEAD_UPDATE_FAILED', error.message);
    }

    return lead;
  }

  async getLeadAnalytics(dealerId: string): Promise<{
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    convertedLeads: number;
    leadsByProperty: Array<{ property_id: string; count: number }>;
  }> {
    // Get total leads count
    const { count: totalLeads } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId);

    // Get new leads count
    const { count: newLeads } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .eq('status', 'new');

    // Get contacted leads count
    const { count: contactedLeads } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .eq('status', 'contacted');

    // Get converted leads count
    const { count: convertedLeads } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .eq('status', 'converted');

    // Get leads by property
    const { data: leadsByProperty } = await supabaseAdmin
      .from('leads')
      .select('property_id')
      .eq('dealer_id', dealerId);

    // Count leads by property
    const propertyLeadCount: { [key: string]: number } = {};
    (leadsByProperty || []).forEach(lead => {
      propertyLeadCount[lead.property_id] = (propertyLeadCount[lead.property_id] || 0) + 1;
    });

    const leadsByPropertyArray = Object.entries(propertyLeadCount).map(([property_id, count]) => ({
      property_id,
      count,
    }));

    return {
      totalLeads: totalLeads || 0,
      newLeads: newLeads || 0,
      contactedLeads: contactedLeads || 0,
      convertedLeads: convertedLeads || 0,
      leadsByProperty: leadsByPropertyArray,
    };
  }
}

export default new LeadService();
