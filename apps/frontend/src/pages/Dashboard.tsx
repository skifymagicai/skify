
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>SkifyMagicAI</h1>
      <nav>
        <button data-testid="tab-upload" onClick={() => navigate('/upload')}>Upload</button>
        <button data-testid="tab-templates" onClick={() => navigate('/templates')}>Templates</button>
  <button data-testid="tab-jobs" onClick={() => navigate('/jobs')}>Jobs</button>
        <button data-testid="tab-settings" onClick={() => navigate('/settings')}>Settings</button>
      </nav>
      {/* ...dashboard content... */}
    </div>
  );
};

export default Dashboard;
