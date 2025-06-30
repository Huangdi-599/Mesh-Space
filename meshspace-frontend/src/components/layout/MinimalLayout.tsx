import React from 'react';

const MinimalLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
    <div className="flex flex-col items-center mb-8 animate-fade-in">
      <span className="text-4xl mb-2">🕸️</span>
      <h1 className="text-2xl font-bold text-primary mb-1">MeshSpace</h1>
      <p className="text-muted-foreground text-sm mb-2">Connect. Share. Discover.</p>
    </div>
    {children}
  </div>
);

export default MinimalLayout; 