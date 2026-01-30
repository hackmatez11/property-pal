import { Link } from 'react-router-dom';
import { Property } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const formatPrice = (price: number, type: string) => {
    if (type === 'rental') {
      return `₹${price.toLocaleString('en-IN')}/month`;
    }
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const typeColors: Record<string, string> = {
    residential: 'bg-primary/10 text-primary',
    commercial: 'bg-accent/10 text-accent',
    land: 'bg-success/20 text-success',
    rental: 'bg-accent/10 text-accent',
  };

  return (
    <div
      className={cn(
        'group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={cn('font-medium capitalize border-0', typeColors[property.type])}>
            {property.type}
          </Badge>
          {property.featured && (
            <Badge className="bg-accent text-accent-foreground">Featured</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-sm">
            <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500" />
          </button>
        </div>

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <p className="text-2xl font-bold text-white">
            {formatPrice(property.price, property.type)}
          </p>
        </div>

        {/* Views */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-sm">
          <Eye className="w-4 h-4" />
          {property.views}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 mt-2 text-muted-foreground">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-sm">{property.location.area}, {property.location.city}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 mt-4 text-muted-foreground">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms} Baths</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span className="text-sm">{property.size} sq.ft</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/property/${property.id}`}>View Details</Link>
          </Button>
          <Button variant="accent" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
