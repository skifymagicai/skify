import React, { useState } from 'react';

const Jobs: React.FC = () => {
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCheck = async () => {
    if (!jobId) return;
    const res = await fetch(`/api/status/${jobId}`);
    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <h2>Job Status</h2>
      <input
        type="text"
        placeholder="Enter Job ID"
        value={jobId}
        onChange={e => setJobId(e.target.value)}
        data-testid="job-id-input"
      />
      <button onClick={handleCheck} data-testid="check-job-btn">Check Job</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default Jobs;
