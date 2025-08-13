import React, { useState } from 'react';

const Analyze: React.FC = () => {
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoUrl: 'mock.mp4' }) });
    const data = await res.json();
    setJobId(data.jobId);
  };

  const checkStatus = async () => {
    if (!jobId) return;
    const res = await fetch(`/api/status/${jobId}`);
    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <button onClick={handleAnalyze} data-testid="analyze-btn">Analyze</button>
      {jobId && <button onClick={checkStatus} data-testid="status-btn">Check Status</button>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default Analyze;
