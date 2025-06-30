import {Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import ProfilePage from './pages/profile'; // make sure this exists
import Layout from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import NotFoundPage from './pages/not-found';
import LandingPage from './pages/Landing';
import type { JSX } from 'react';
import ProfileDisplay from './pages/ProfileDisplay';
import PostDetail from './pages/PostDetail';
import SearchPage from './pages/search';
import MinimalLayout from './components/layout/MinimalLayout';
import VerifyEmailPage from './pages/verify-email';

const VerifiedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user.isVerified) return <Navigate to="/verify-email" state={{ from: location }} replace />;
  return children;
};

function App() {
  const { user } = useAuth();
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
