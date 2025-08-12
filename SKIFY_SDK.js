// Skify JavaScript SDK (minimal example)
export async function uploadViralVideo(file, title, token) {
  const form = new FormData();
  form.append('viralVideo', file);
  form.append('title', title);
  return fetch('/api/upload/viral', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  }).then(r => r.json());
}

export async function analyzeVideo(videoId, token) {
  return fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ videoId })
  }).then(r => r.json());
}

export async function exportVideo(videoId, quality, watermark, token) {
  return fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ videoId, quality, watermark })
  }).then(r => r.json());
}

export async function getDownloadUrl(videoId, token) {
  return fetch(`/api/download/${videoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
}

export async function getJobStatus(jobId, token) {
  return fetch(`/api/status/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
}
