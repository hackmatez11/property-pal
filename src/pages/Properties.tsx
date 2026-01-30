import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyFilters } from '@/components/PropertyFilters';
import { AIAssistant } from '@/components/AIAssistant';
import { Button } from '@/components/ui/button';
import { mockProperties } from '@/data/mockProperties';
import { PropertyFilter } from '@/types/property';
import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Properties() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<PropertyFilter>({
    search: searchParams.get('search') || undefined,
    location: searchParams.get('location') || undefined,
    type: searchParams.get('type') && searchParams.get('type') !== 'all' 
      ? [searchParams.get('type') as PropertyFilter['type'][0]] 
      : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<PropertyFilter['sortBy']>('newest');

  const filteredProperties = useMemo(() => {
    let result = [...mockProperties];

    // Apply filters
    if (filters.type?.length) {
      result = result.filter((p) => filters.type?.includes(p.type));
    }
    if (filters.location) {
      result = result.filter((p) => p.location.city === filters.location);
    }
    if (filters.priceMin) {
      result = result.filter((p) => p.price >= (filters.priceMin || 0));
    }
    if (filters.priceMax) {
      result = result.filter((p) => p.price <= (filters.priceMax || Infinity));
    }
    if (filters.bedrooms) {
      result = result.filter((p) => (p.bedrooms || 0) >= (filters.bedrooms || 0));
    }
    if (filters.amenities?.length) {
      result = result.filter((p) =>
        filters.amenities?.every((a) => p.amenities.includes(a))
      );
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.location.city.toLowerCase().includes(search) ||
          p.location.area.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page Header */}
      <div className="pt-24 pb-8 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse Properties
          </h1>
          <p className="text-muted-foreground">
            Discover {filteredProperties.length} properties matching your criteria
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              className="sticky top-24"
            />
          </aside>

          {/* Property Listing */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                  placeholder="Search properties..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: undefined })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as PropertyFilter['sortBy'])}
                  className="px-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground focus:ring-2 focus:ring-accent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center bg-card rounded-lg border border-border p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {filteredProperties.length > 0 ? (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button variant="accent" onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background overflow-y-auto animate-slide-in-right">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              className="border-0 rounded-none"
            />
          </div>
        </div>
      )}

      <Footer />
      <AIAssistant />
    </div>
  );
}
