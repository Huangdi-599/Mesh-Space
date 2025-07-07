import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import NotificationDropdown from '../NotificationDropdown';
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
  useEffect(() => {
    if (navRef.current) {
      navRef.current.classList.add('fade-in-navbar');
    }
  }, []);
  return (
    <header
      ref={navRef}
      className="sticky top-0 z-30 w-full px-6 py-4 border-b shadow-lg flex justify-between items-center opacity-0 transition-opacity duration-700 fade-in-navbar bg-white/70 dark:bg-black/60 backdrop-blur-md backdrop-saturate-150"
      style={{ WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
        <span className="text-2xl text-primary font-bold group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">🕸️</span>
        <h1 className="text-xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-300">MeshSpace</h1>
      </div>
      <div className="flex-1 flex justify-center">
        <form
          className="relative w-full max-w-xs"
          onSubmit={e => {
            e.preventDefault();
            if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
          }}
        >
          <input
            type="text"
            placeholder="Search MeshSpace..."
            className="w-full px-4 py-2 rounded-lg border border-border bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-sm shadow-sm placeholder:text-muted-foreground/70 pr-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            <Icon icon="mdi:magnify" className="w-5 h-5" />
          </button>
        </form>
      </div>
      <nav className="flex gap-4 items-center">
        <button
          aria-label="Toggle dark mode"
          className="rounded-full p-2 hover:bg-accent/40 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Icon icon="mdi:white-balance-sunny" className="w-5 h-5" /> : <Icon icon="mdi:moon-waning-crescent" className="w-5 h-5" />}
        </button>
        <NotificationDropdown />
        <Link to="/dashboard" className="text-sm font-medium hover:underline hover:text-primary transition-colors duration-200">Feeds</Link>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-8 cursor-pointer">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
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