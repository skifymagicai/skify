import React from 'react';

const Home: React.FC = () => (
  <main className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-4xl font-bold mb-4">SkifyMagicAI</h1>
    <button data-testid="button-get-started" className="btn btn-primary">Get Started</button>
  </main>
);

export default Home;
