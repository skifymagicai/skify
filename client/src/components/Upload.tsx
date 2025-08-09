import React, {useState, useRef} from "react";

type Analysis = {
  overall?: number;
  effects?: Array<{name:string, confidence:number}>
  textOverlays?: string[]
}

export default function Upload() {
  const [file, setFile] = useState<File|null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  async function requestSignedUrl(filename:string, size:number, mime:string) {
    const res = await fetch("/api/upload/sign", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({filename, size, mime})
    });
    if(!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function uploadFile(chosen: File) {
    setUploading(true);
    const { url, key } = await requestSignedUrl(chosen.name, chosen.size, chosen.type);
    controllerRef.current = new AbortController();

    // Simple single PUT
    const putRes = await fetch(url, {
      method: "PUT",
      body: chosen,
      headers: {"Content-Type": chosen.type},
      signal: controllerRef.current.signal
    });

    if(!putRes.ok) {
      setUploading(false);
      throw new Error("Upload failed");
    }

    setProgress(100);

    // notify backend to run analysis
    const notify = await fetch("/api/upload/complete", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({key, filename: chosen.name, size: chosen.size, mime: chosen.type})
    });
    if(!notify.ok) {
      setUploading(false);
      throw new Error("Failed to notify backend");
    }
    const body = await notify.json();
    if(body.analysis) {
      setAnalysis(body.analysis);
    }
    if(body.jobId) {
      setJobId(body.jobId);
    }
    setUploading(false);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

  async function startUpload() {
    if(!file) return;
    try {
      await uploadFile(file);
    } catch(err:any) {
      alert("Upload error: " + err.message);
      setUploading(false);
    }
  }

  async function applyTemplate(templateId: string) {
    if(!file) return alert("Upload a video first");
    // NOTE: In production the backend should map filename -> s3 key. For demo, pass filename.
    const res = await fetch("/api/template/apply", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({templateId, sourceKey: (file && file.name)})
    });
    const j = await res.json();
    if(res.ok) {
      setJobId(j.jobId);
    } else {
      alert(j.message || "Failed to apply template");
    }
  }

  async function pollJobStatus() {
    if(!jobId) return;
    const r = await fetch(`/api/job/${jobId}`);
    const j = await r.json();
    if(j.status === "completed") {
      window.open(j.resultUrl, "_blank");
    } else if (j.status === "processing") {
      setTimeout(pollJobStatus, 2000);
    } else {
      console.warn("job state", j);
    }
  }

  return (
    <div className="p-6 bg-background rounded-lg border">
      <h2 className="text-lg font-bold text-foreground mb-4">Production Upload System</h2>

      <div className="mt-4">
        <input 
          type="file" 
          accept="video/*" 
          onChange={onFileChange} 
          className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
        />
      </div>

      <div className="mt-3">
        <button 
          disabled={!file || uploading} 
          onClick={startUpload} 
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {uploading ? `Uploading ${progress}%` : "Upload & Analyze"}
        </button>
      </div>

      {analysis && (
        <div className="mt-4">
          <h3 className="font-semibold">Analysis Results</h3>
          <div>Overall confidence: {analysis.overall ?? "—"}</div>
          <ul>
            {(analysis.effects || []).map((e, i) => (
              <li key={i}>{e.name} — {Math.round(e.confidence*100)}%</li>
            ))}
          </ul>
          <button 
            onClick={() => applyTemplate("temp_001")} 
            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Apply Template: temp_001
          </button>
        </div>
      )}

      {jobId && (
        <div className="mt-4">
          <div>Job started: {jobId}</div>
          <button 
            onClick={pollJobStatus} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium mt-2 transition-colors"
          >
            Check Job Status
          </button>
        </div>
      )}
    </div>
  );
}