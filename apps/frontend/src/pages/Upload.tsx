import React, { useRef } from 'react';

const Upload: React.FC = () => {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInput.current?.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', fileInput.current.files[0]);
    const res = await fetch('/api/upload/viral', { method: 'POST', body: formData });
    const data = await res.json();
    alert(`Upload status: ${data.status}, jobId: ${data.jobId}`);
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" ref={fileInput} data-testid="file-input" />
      <button type="submit" data-testid="upload-btn">Upload</button>
    </form>
  );
};

export default Upload;
