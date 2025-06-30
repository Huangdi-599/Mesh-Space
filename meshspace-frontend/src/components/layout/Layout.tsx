import Navbar from './Navbar';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-4 max-w-7xl mx-auto w-full opacity-0 transition-opacity duration-700 fade-in-main flex-1">
        {children}
      </main>
      {showTop && (
        <button
          className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all hidden sm:block animate-fade-in"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <Icon icon="mdi:arrow-up" className="w-6 h-6" />
        </button>
      )}
      <footer className="w-full border-t bg-white/70 dark:bg-black/60 backdrop-blur-md backdrop-saturate-150 py-4 px-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground mt-8 sticky bottom-0 z-20" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <span className="text-lg text-primary font-bold">🕸️</span>
          <span>&copy; {new Date().getFullYear()} MeshSpace. All rights reserved.</span>
        </div>
        <div className="flex gap-4 items-center">
          <a href="/dashboard" className="hover:underline hover:text-primary transition-colors font-medium">Home</a>
          <a href="/profile" className="hover:underline hover:text-primary transition-colors font-medium">Profile</a>
          <button
            aria-label="Toggle dark mode"
            className="rounded-full p-2 hover:bg-accent/40 transition-colors ml-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Icon icon="mdi:white-balance-sunny" className="w-4 h-4" /> : <Icon icon="mdi:moon-waning-crescent" className="w-4 h-4" />}
          </button>
        </div>
      </footer>
    </div>
  );
};
export default Layout;

/* Add to global CSS (App.css or index.css):
.fade-in-main {
  opacity: 1 !important;
}
*/