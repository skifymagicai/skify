import React from 'react';

const Dashboard: React.FC = () => (
  <div>
    <h1>SkifyMagicAI</h1>
    <nav>
      <button data-testid="tab-upload">Upload</button>
      <button data-testid="tab-templates">Templates</button>
      <button data-testid="tab-jobs">Jobs</button>
      <button data-testid="tab-settings">Settings</button>
    </nav>
    {/* ...dashboard content... */}
  </div>
);

export default Dashboard;
