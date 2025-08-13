import React, { useState } from 'react';

const Export: React.FC = () => {
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleExport = async () => {
    const res = await fetch('/api/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 'temp_001' }) });
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
      <button onClick={handleExport} data-testid="export-btn">Export</button>
      {jobId && <button onClick={checkStatus} data-testid="export-status-btn">Check Status</button>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default Export;
