import axios from 'axios';
import { config } from '../config';
import { AppError } from '../utils/response';
import { PropertyFilters, AISearchResponse, Property } from '../types';
import PropertyService from './property.service';

export class AIService {
  async searchProperties(query: string, context?: any): Promise<AISearchResponse> {
    try {
      // Call external AI service to parse natural language query
      const response = await axios.post(
        `${config.ai.serviceUrl}/parse-query`,
        {
          query,
          context,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.ai.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const parsedFilters: PropertyFilters = response.data.filters || {};
      const intent = response.data.intent || '';

      // Execute search using PropertyService
      const { properties, total } = await PropertyService.listProperties(
        parsedFilters,
        { page: 1, limit: 20 },
        undefined,
        undefined
      );

      // Generate summary
      const summary = this.generateSearchSummary(query, properties, total, intent);

      return {
        summary,
        properties: properties.slice(0, 10), // Return top 10
        suggestedFilters: parsedFilters,
        totalResults: total,
      };
    } catch (error: any) {
      // Fallback: Parse query locally using simple keyword matching
      return this.fallbackSearch(query);
    }
  }

  private async fallbackSearch(query: string): Promise<AISearchResponse> {
    const filters: PropertyFilters = this.parseQueryLocally(query);

    const { properties, total } = await PropertyService.listProperties(
      filters,
      { page: 1, limit: 20 },
      undefined,
      undefined
    );

    const summary = `Found ${total} properties matching "${query}"`;

    return {
      summary,
      properties: properties.slice(0, 10),
      suggestedFilters: filters,
      totalResults: total,
    };
  }

  private parseQueryLocally(query: string): PropertyFilters {
    const filters: PropertyFilters = {};
    const lowerQuery = query.toLowerCase();

    // Extract property type
    if (lowerQuery.includes('apartment') || lowerQuery.includes('flat')) {
      filters.property_type = 'apartment';
    } else if (lowerQuery.includes('house')) {
      filters.property_type = 'house';
    } else if (lowerQuery.includes('villa')) {
      filters.property_type = 'villa';
    } else if (lowerQuery.includes('plot') || lowerQuery.includes('land')) {
      filters.property_type = 'plot';
    } else if (lowerQuery.includes('commercial') || lowerQuery.includes('office')) {
      filters.property_type = 'commercial';
    }

    // Extract bedrooms
    const bedroomMatch = lowerQuery.match(/(\d+)\s*(bhk|bedroom|bed)/i);
    if (bedroomMatch) {
      filters.bedrooms = parseInt(bedroomMatch[1], 10);
    }

    // Extract price range
    const priceMatch = lowerQuery.match(/(\d+)\s*(lakh|cr|crore|lakhs|crores)/i);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1], 10);
      const unit = priceMatch[2].toLowerCase();
      
      if (unit.includes('cr')) {
        filters.max_price = amount * 10000000; // Convert crores to rupees
      } else if (unit.includes('lakh')) {
        filters.max_price = amount * 100000; // Convert lakhs to rupees
      }

      // Set min price as 50% of max
      if (filters.max_price) {
        filters.min_price = Math.floor(filters.max_price * 0.5);
      }
    }

    // Extract cities (common Indian cities)
    const cities = [
      'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
      'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur',
      'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri',
      'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
    ];

    for (const city of cities) {
      if (lowerQuery.includes(city)) {
        filters.city = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // Extract amenities
    const amenities: string[] = [];
    if (lowerQuery.includes('parking')) amenities.push('Parking');
    if (lowerQuery.includes('gym') || lowerQuery.includes('fitness')) amenities.push('Gym');
    if (lowerQuery.includes('pool') || lowerQuery.includes('swimming')) amenities.push('Swimming Pool');
    if (lowerQuery.includes('garden')) amenities.push('Garden');
    if (lowerQuery.includes('security')) amenities.push('24/7 Security');
    if (lowerQuery.includes('lift') || lowerQuery.includes('elevator')) amenities.push('Elevator');
    if (lowerQuery.includes('power backup')) amenities.push('Power Backup');
    
    if (amenities.length > 0) {
      filters.amenities = amenities;
    }

    return filters;
  }

  private generateSearchSummary(
    query: string,
    properties: Property[],
    total: number,
    intent: string
  ): string {
    if (total === 0) {
      return `No properties found matching "${query}". Try adjusting your search criteria.`;
    }

    let summary = `Found ${total} properties`;

    if (properties.length > 0) {
      const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
      const priceInLakhs = Math.round(avgPrice / 100000);

      summary += ` with an average price of ₹${priceInLakhs} lakhs`;

      // Add location info if consistent
      const cities = [...new Set(properties.map(p => p.city))];
      if (cities.length === 1) {
        summary += ` in ${cities[0]}`;
      } else if (cities.length <= 3) {
        summary += ` across ${cities.join(', ')}`;
      }
    }

    summary += `. Showing top ${Math.min(10, total)} results.`;

    return summary;
  }

  async getSuggestions(partialQuery: string): Promise<string[]> {
    // Return common search suggestions
    const suggestions = [
      '2 BHK apartment in Mumbai',
      '3 BHK house with parking',
      'Villa under 1 crore',
      'Commercial property in Bangalore',
      'Plot near highway',
      'Luxury apartment with gym',
      '4 BHK penthouse',
      'Budget apartment under 50 lakhs',
    ];

    return suggestions.filter(s => 
      s.toLowerCase().includes(partialQuery.toLowerCase())
    ).slice(0, 5);
  }
}

export default new AIService();
