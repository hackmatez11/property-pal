import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistant } from '@/components/AIAssistant';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProperties } from '@/data/mockProperties';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Phone,
  Mail,
  ArrowLeft,
  Check,
  Calendar,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PropertyDetail() {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
          <Button asChild variant="accent">
            <Link to="/properties">Browse Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Back Button */}
      <div className="pt-20 bg-secondary/50">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={cn('font-medium capitalize border-0', typeColors[property.type])}>
                  {property.type}
                </Badge>
                {property.featured && (
                  <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-md">
                  <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-md">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              {property.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        idx === 0 ? 'bg-white' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span>{property.location.address}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {property.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Listed {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-3xl font-bold text-accent mt-4">
                {formatPrice(property.price, property.type)}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.bedrooms && (
                <div className="bg-card rounded-xl p-4 border border-border">
                  <Bed className="w-6 h-6 text-accent mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.bedrooms}</p>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-card rounded-xl p-4 border border-border">
                  <Bath className="w-6 h-6 text-accent mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.bathrooms}</p>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
              )}
              <div className="bg-card rounded-xl p-4 border border-border">
                <Square className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground">{property.size}</p>
                <p className="text-sm text-muted-foreground">Sq. Ft.</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <TrendingUp className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground">{property.leads}</p>
                <p className="text-sm text-muted-foreground">Inquiries</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg"
                  >
                    <Check className="w-5 h-5 text-success" />
                    <span className="text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Dealer Card */}
          <div>
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">
                    {property.dealer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{property.dealer.name}</h3>
                  {property.dealer.company && (
                    <p className="text-sm text-muted-foreground">{property.dealer.company}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Button variant="accent" className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  {property.dealer.phone}
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                {property.dealer.whatsapp && (
                  <Button variant="secondary" className="w-full" size="lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </Button>
                )}
              </div>

              <div className="p-4 bg-accent/10 rounded-xl">
                <p className="text-sm text-muted-foreground text-center">
                  💡 Tip: Mention PropMarket when contacting the dealer for better service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <AIAssistant />
    </div>
  );
}
