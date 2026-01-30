import { Link } from 'react-router-dom';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { featuredProperties } from '@/data/mockProperties';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FeaturedProperties() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-accent mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Premium Properties
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Hand-picked properties from our top dealers. These listings offer exceptional value and quality.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start md:self-auto">
            <Link to="/properties">
              View All Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
