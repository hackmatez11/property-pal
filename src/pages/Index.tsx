import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { BenefitsSection } from '@/components/BenefitsSection';
import { Footer } from '@/components/Footer';
import { AIAssistant } from '@/components/AIAssistant';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <BenefitsSection />
      <Footer />
      <AIAssistant />
    </div>
  );
};

export default Index;
