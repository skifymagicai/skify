
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const handleStart = () => {
    navigate('/dashboard');
  };
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">SkifyMagicAI</h1>
      <button
        data-testid="button-get-started"
        className="btn btn-primary"
        onClick={handleStart}
      >
        Get Started
      </button>
    </main>
  );
};

export default Home;
