import React, { useState } from 'react';

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const fetchTemplates = async () => {
    const res = await fetch('/api/my-templates');
    const data = await res.json();
    setTemplates(data.templates);
  };
  return (
    <div>
      <button onClick={fetchTemplates} data-testid="fetch-templates">Fetch Templates</button>
      <ul>
        {templates.map((t, i) => <li key={i}>{JSON.stringify(t)}</li>)}
      </ul>
    </div>
  );
};

export default Templates;
