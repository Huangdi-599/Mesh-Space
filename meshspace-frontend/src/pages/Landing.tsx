import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => (
  <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20'>
    <div className="w-full flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <span className="text-4xl mb-2">🕸️</span>
      <h1 className="text-5xl font-bold mb-4">Welcome to MeshSpace</h1>
      <p className="text-lg text-muted-foreground max-w-2xl mb-6">
        MeshSpace is a next-gen social media dashboard that lets you share thoughts, follow others, and stay updated in real-time.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link to="/login"><Button size="lg" className="shadow-lg">Login</Button></Link>
        <Link to="/register"><Button size="lg" variant="outline" className="shadow">Sign Up</Button></Link>
      </div>
    </div>
  </div>

);

export default LandingPage;
