import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import NotificationDropdown from '../NotificationDropdown';
import SearchSuggestions from '../SearchSuggestions';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const { user, logout} = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchPosition, setSearchPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (navRef.current) {
      navRef.current.classList.add('fade-in-navbar');
    }
  }, []);

  // Handle search position and close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    const updateSearchPosition = () => {
      if (searchRef.current) {
        const rect = searchRef.current.getBoundingClientRect();
        setSearchPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    if (showSuggestions) {
      updateSearchPosition();
      window.addEventListener('scroll', updateSearchPosition);
      window.addEventListener('resize', updateSearchPosition);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateSearchPosition);
      window.removeEventListener('resize', updateSearchPosition);
    };
  }, [showSuggestions]);
  return (
    <header
      ref={navRef}
      className="sticky top-0 z-30 w-full px-4 sm:px-6 py-4 border-b shadow-lg flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center opacity-0 transition-opacity duration-700 fade-in-navbar bg-white/70 dark:bg-black/60 backdrop-blur-md backdrop-saturate-150"
      style={{ WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* Logo and Search Row */}
      <div className="flex items-center justify-between w-full sm:w-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="text-2xl text-primary font-bold group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">🕸️</span>
          <h1 className="text-xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-300">MeshSpace</h1>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <button
            aria-label="Toggle dark mode"
            className="rounded-full p-2 hover:bg-accent/40 transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Icon icon="mdi:white-balance-sunny" className="w-5 h-5" /> : <Icon icon="mdi:moon-waning-crescent" className="w-5 h-5" />}
          </button>
          <NotificationDropdown />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="size-8 cursor-pointer">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                  <Icon icon="mdi:view-dashboard" className="w-4 h-4" />
                  Feeds
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/saved')} className="flex items-center gap-2">
                  <Icon icon="mdi:bookmark" className="w-4 h-4" />
                  Saved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/mentions')} className="flex items-center gap-2">
                  <Icon icon="mdi:at" className="w-4 h-4" />
                  Mentions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center gap-2">
                  <Icon icon="mdi:account" className="w-4 h-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                  <Icon icon="mdi:logout" className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="w-full sm:flex-1 sm:flex sm:justify-center sm:max-w-md relative">
        <form
          className="relative w-full"
          onSubmit={e => {
            e.preventDefault();
            if (search.trim()) {
              navigate(`/search?q=${encodeURIComponent(search.trim())}`);
              setShowSuggestions(false);
            }
          }}
        >
          <input
            type="text"
            placeholder="Search MeshSpace..."
            className="w-full px-4 py-2 rounded-lg border border-border bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-sm shadow-sm placeholder:text-muted-foreground/70 pr-10"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setShowSuggestions(e.target.value.length > 1);
            }}
            onFocus={() => {
              if (search.length > 1) setShowSuggestions(true);
            }}
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted/50"
            onClick={(e) => {
              e.preventDefault();
              if (search.trim()) {
                navigate(`/search?q=${encodeURIComponent(search.trim())}`);
                setShowSuggestions(false);
              }
            }}
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
          </button>
        </form>
        
        {/* Search Suggestions */}
        <SearchSuggestions
          query={search}
          isOpen={showSuggestions}
          onClose={() => setShowSuggestions(false)}
          position={searchPosition}
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex gap-4 items-center">
        <button
          aria-label="Toggle dark mode"
          className="rounded-full p-2 hover:bg-accent/40 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Icon icon="mdi:white-balance-sunny" className="w-5 h-5" /> : <Icon icon="mdi:moon-waning-crescent" className="w-5 h-5" />}
        </button>
        <NotificationDropdown />
        <Link to="/dashboard" className="text-sm font-medium hover:underline hover:text-primary transition-colors duration-200 flex items-center gap-1">
          <Icon icon="mdi:view-dashboard" className="w-4 h-4" />
          <span className="hidden lg:inline">Feeds</span>
        </Link>
        <Link to="/saved" className="text-sm font-medium hover:underline hover:text-primary transition-colors duration-200 flex items-center gap-1">
          <Icon icon="mdi:bookmark" className="w-4 h-4" />
          <span className="hidden lg:inline">Saved</span>
        </Link>
        <Link to="/mentions" className="text-sm font-medium hover:underline hover:text-primary transition-colors duration-200 flex items-center gap-1">
          <Icon icon="mdi:at" className="w-4 h-4" />
          <span className="hidden lg:inline">Mentions</span>
        </Link>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-8 cursor-pointer">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                <Icon icon="mdi:view-dashboard" className="w-4 h-4" />
                Feeds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/saved')} className="flex items-center gap-2">
                <Icon icon="mdi:bookmark" className="w-4 h-4" />
                Saved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/mentions')} className="flex items-center gap-2">
                <Icon icon="mdi:at" className="w-4 h-4" />
                Mentions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center gap-2">
                <Icon icon="mdi:account" className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                <Icon icon="mdi:logout" className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

/* Add to global CSS (App.css or index.css):
.fade-in-navbar {
  opacity: 1 !important;
}
*/