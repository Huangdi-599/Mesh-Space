import {Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import ProfilePage from './pages/profile'; // make sure this exists
import Layout from './components/layout/Layout';
import NotFoundPage from './pages/not-found';
import LandingPage from './pages/Landing';
import { useEffect, type JSX } from 'react';
import ProfileDisplay from './pages/ProfileDisplay';
import PostDetail from './pages/PostDetail';
import SearchPage from './pages/search';
import MinimalLayout from './components/layout/MinimalLayout';
import VerifyEmailPage from './pages/verify-email';
import { useAuth } from './hooks/useAuth';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/reset-password';

const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-solid border-opacity-30 mb-4" style={{ borderRightColor: 'transparent' }} />
    <span className="text-primary text-lg font-medium tracking-wide">Loading...</span>
  </div>
);

const VerifiedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, authReady, loading } = useAuth();
  const location = useLocation();
  if (loading || !authReady) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user && !user.isVerified) return <Navigate to="/verify-email" state={{ from: location }} replace />;
  return children;
};

function App() {
  const { user } = useAuth();
  useEffect(() => {
    const Environment = import.meta.env.VITE_ENV as string;
    console.log("Environment",Environment)
    if (Environment === "production") {
      console.log = () => {}; 
      console.error = () => {};
      console.warn = () => {};
      console.dir = () => {};
    }
  }, []);
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/landing" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={<MinimalLayout><LoginPage /></MinimalLayout>} />
      <Route path="/register" element={<MinimalLayout><RegisterPage /></MinimalLayout>} />
      <Route path="/verify-email" element={<MinimalLayout><VerifyEmailPage /></MinimalLayout>} />
      <Route path="/dashboard" element={
        <VerifiedRoute><Layout><Dashboard /></Layout></VerifiedRoute>
      } />
      <Route path="/profile" element={
        <VerifiedRoute><Layout><ProfilePage /></Layout></VerifiedRoute>
      } />
      <Route path="/profile/:id" element={<Layout><ProfileDisplay /></Layout>} />
      <Route path="/post/:postId" element={<Layout><PostDetail /></Layout>} />
      <Route path="/search" element={<Layout><SearchPage /></Layout>} />
      <Route path="/forgot-password" element={<MinimalLayout><ForgotPassword /></MinimalLayout>} />
      <Route path="/reset-password" element={<MinimalLayout><ResetPassword /></MinimalLayout>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
