import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Sparkles, Building2, Home, Landmark, Key } from 'lucide-react';

const propertyTypes = [
  { value: 'all', label: 'All', icon: Building2 },
  { value: 'residential', label: 'Buy', icon: Home },
  { value: 'rental', label: 'Rent', icon: Key },
  { value: 'commercial', label: 'Commercial', icon: Landmark },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}&type=${activeType}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center hero-gradient overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white/90">AI-Powered Property Search</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in [animation-delay:0.1s]">
            Find Your{' '}
            <span className="text-gradient">Perfect Property</span>
            <br />
            Faster Than Ever
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in [animation-delay:0.2s]">
            Discover thousands of properties from verified dealers. Use our AI assistant for personalized recommendations.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-3xl mx-auto animate-fade-in [animation-delay:0.3s]">
            {/* Property Type Tabs */}
            <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-3">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setActiveType(type.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeType === type.value
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city or area..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties or ask AI..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" variant="accent" size="xl" className="sm:w-auto">
                <Search className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in [animation-delay:0.4s]">
            {[
              { value: '10,000+', label: 'Properties Listed' },
              { value: '500+', label: 'Verified Dealers' },
              { value: '15,000+', label: 'Happy Customers' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
