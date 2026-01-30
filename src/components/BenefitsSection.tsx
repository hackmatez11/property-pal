import { 
  Search, 
  Shield, 
  Sparkles, 
  Building2, 
  BarChart3, 
  Headphones,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const userBenefits = [
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find properties using natural language queries powered by AI.',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'All properties are verified by our team for authenticity.',
  },
  {
    icon: Sparkles,
    title: 'AI Recommendations',
    description: 'Get personalized property suggestions based on your preferences.',
  },
];

const dealerBenefits = [
  {
    icon: Building2,
    title: 'Easy Listings',
    description: 'List properties in minutes with our intuitive dashboard.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Track views, leads, and engagement on your listings.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: '24/7 support to help you maximize your listings.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* For Users */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">For Buyers</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Find Your Dream Property
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Whether you're looking for a home, office, or investment property, we make property search effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userBenefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="group bg-card p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Dealers */}
        <div className="bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">For Dealers</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-2">
                Grow Your Real Estate Business
              </h2>
              <p className="text-primary-foreground/70 mt-3 max-w-2xl mx-auto">
                Join thousands of successful property dealers and reach millions of potential buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dealerBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-foreground mb-2">{benefit.title}</h3>
                  <p className="text-primary-foreground/70">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="hero" size="xl">
                Start Listing Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
