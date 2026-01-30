import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Building2, UserCircle, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/properties', label: 'Properties', icon: Building2 },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isHome ? 'bg-transparent' : 'bg-card/95 backdrop-blur-md shadow-sm border-b border-border'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent-foreground" />
            </div>
            <span
              className={cn(
                'text-xl font-bold transition-colors',
                isHome ? 'text-white' : 'text-foreground'
              )}
            >
              PropMarket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-accent',
                  isHome ? 'text-white/90 hover:text-white' : 'text-muted-foreground',
                  location.pathname === link.href && (isHome ? 'text-white' : 'text-accent')
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant={isHome ? 'glass' : 'ghost'} size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button variant={isHome ? 'hero' : 'accent'} size="sm">
              List Property
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              isHome ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
            )}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-2 bg-card rounded-xl p-4 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    location.pathname === link.href
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Button variant="ghost" className="justify-start">
                <UserCircle className="w-5 h-5 mr-3" />
                Sign In
              </Button>
              <Button variant="accent" className="justify-start">
                <Building2 className="w-5 h-5 mr-3" />
                List Property
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
