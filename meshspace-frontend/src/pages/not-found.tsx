import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center">
    <h2 className="text-4xl font-bold mb-2">404 - Page Not Found</h2>
    <p className="text-muted-foreground mb-4">Oops! The page you're looking for doesn't exist.</p>
    <Link to="/" className="text-blue-500 hover:underline">Return Home</Link>
  </div>
);

export default NotFoundPage;
