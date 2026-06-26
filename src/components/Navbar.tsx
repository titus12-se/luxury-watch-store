import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const cartTotal = useCart((s) => s.getTotalItems());
  const wishlistItems = useWishlist((s) => s.items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-pearl/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="section-padding flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo/WhatsApp_Image_2026-06-23_at_10.06.58_PM.jpeg"
              alt="Aura & Anchor"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <span
                className={cn(
                  'font-serif text-xl font-semibold tracking-wide transition-colors',
                  scrolled ? 'text-navy' : 'text-white'
                )}
              >
                Aura & Anchor
              </span>
              <span
                className={cn(
                  'block text-[10px] uppercase tracking-[0.25em] transition-colors',
                  scrolled ? 'text-gold' : 'text-gold/80'
                )}
              >
                Collections
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium tracking-wide uppercase transition-colors relative group',
                  location.pathname === link.href
                    ? scrolled
                      ? 'text-gold'
                      : 'text-gold'
                    : scrolled
                    ? 'text-navy hover:text-gold'
                    : 'text-white/90 hover:text-white'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[1px] bg-gold transition-all duration-300',
                    location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                'p-2 transition-colors',
                scrolled ? 'text-navy hover:text-gold' : 'text-white hover:text-gold'
              )}
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/wishlist"
              className={cn(
                'relative p-2 transition-colors hidden sm:block',
                scrolled ? 'text-navy hover:text-gold' : 'text-white hover:text-gold'
              )}
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className={cn(
                'relative p-2 transition-colors',
                scrolled ? 'text-navy hover:text-gold' : 'text-white hover:text-gold'
              )}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center">
                  {cartTotal}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  to="/account"
                  className={cn(
                    'p-2 transition-colors',
                    scrolled ? 'text-navy hover:text-gold' : 'text-white hover:text-gold'
                  )}
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className={cn(
                    'text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors',
                    scrolled
                      ? 'border-navy text-navy hover:bg-navy hover:text-white'
                      : 'border-white/40 text-white hover:bg-white hover:text-navy'
                  )}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={cn(
                  'hidden sm:flex items-center gap-1 text-xs uppercase tracking-wider px-4 py-2 transition-colors',
                  scrolled
                    ? 'bg-navy text-white hover:bg-gold'
                    : 'bg-white/10 text-white hover:bg-gold hover:text-white backdrop-blur-sm'
                )}
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'lg:hidden p-2 transition-colors',
                scrolled ? 'text-navy' : 'text-white'
              )}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-pearl border-b border-gray-200 shadow-lg animate-fade-in">
            <form onSubmit={handleSearch} className="section-padding py-4 flex gap-3">
              <input
                autoFocus
                type="text"
                placeholder="Search for watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white border border-gray-200 px-4 py-3 text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="bg-navy text-white px-6 py-3 hover:bg-gold transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-navy/95 backdrop-blur-lg lg:hidden animate-fade-in">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-2xl font-serif text-white hover:text-gold transition-colors',
                  location.pathname === link.href && 'text-gold'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-6 mt-4">
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="text-white hover:text-gold">
                <Heart className="w-6 h-6" />
              </Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="text-white hover:text-gold">
                <ShoppingBag className="w-6 h-6" />
              </Link>
              {user ? (
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-white hover:text-gold">
                  <User className="w-6 h-6" />
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-white hover:text-gold">
                  <User className="w-6 h-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
