import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { propertyTypes, cities, amenitiesList } from '@/data/mockProperties';
import { PropertyFilter, PropertyType } from '@/types/property';
import { Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyFiltersProps {
  filters: PropertyFilter;
  onFiltersChange: (filters: PropertyFilter) => void;
  className?: string;
}

export function PropertyFilters({ filters, onFiltersChange, className }: PropertyFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['type', 'price', 'location']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleTypeChange = (type: PropertyType, checked: boolean) => {
    const currentTypes = filters.type || [];
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter((t) => t !== type);
    onFiltersChange({ ...filters, type: newTypes.length ? newTypes : undefined });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceMin: value[0] * 100000,
      priceMax: value[1] * 100000,
    });
  };

  const handleLocationChange = (city: string) => {
    onFiltersChange({
      ...filters,
      location: filters.location === city ? undefined : city,
    });
  };

  const handleBedroomsChange = (bedrooms: number) => {
    onFiltersChange({
      ...filters,
      bedrooms: filters.bedrooms === bedrooms ? undefined : bedrooms,
    });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = checked
      ? [...currentAmenities, amenity]
      : currentAmenities.filter((a) => a !== amenity);
    onFiltersChange({ ...filters, amenities: newAmenities.length ? newAmenities : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className={cn('bg-card rounded-xl border border-border p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-accent flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Property Type */}
      <FilterSection
        title="Property Type"
        isExpanded={expandedSections.includes('type')}
        onToggle={() => toggleSection('type')}
      >
        <div className="space-y-3">
          {propertyTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.type?.includes(type.value as PropertyType) || false}
                onCheckedChange={(checked) =>
                  handleTypeChange(type.value as PropertyType, checked as boolean)
                }
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        isExpanded={expandedSections.includes('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <Slider
            defaultValue={[0, 300]}
            max={300}
            step={10}
            onValueChange={handlePriceChange}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{((filters.priceMin || 0) / 100000).toFixed(0)}L</span>
            <span>₹{((filters.priceMax || 30000000) / 100000).toFixed(0)}L+</span>
          </div>
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection
        title="Location"
        isExpanded={expandedSections.includes('location')}
        onToggle={() => toggleSection('location')}
      >
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleLocationChange(city)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm transition-colors',
                filters.location === city
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection
        title="Bedrooms"
        isExpanded={expandedSections.includes('bedrooms')}
        onToggle={() => toggleSection('bedrooms')}
      >
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleBedroomsChange(num)}
              className={cn(
                'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                filters.bedrooms === num
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {num}+
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection
        title="Amenities"
        isExpanded={expandedSections.includes('amenities')}
        onToggle={() => toggleSection('amenities')}
      >
        <div className="space-y-3">
          {amenitiesList.slice(0, 6).map((amenity) => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.amenities?.includes(amenity) || false}
                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {amenity}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Apply Button (Mobile) */}
      <Button variant="accent" className="w-full mt-6 lg:hidden">
        Apply Filters
      </Button>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-border last:border-0 py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  );
}
