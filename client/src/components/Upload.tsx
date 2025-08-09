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
    setProgress(0);
    
    try {
      const { url, key } = await requestSignedUrl(chosen.name, chosen.size, chosen.type);
      controllerRef.current = new AbortController();

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Simple single PUT
      const putRes = await fetch(url, {
        method: "PUT",
        body: chosen,
        headers: {"Content-Type": chosen.type},
        signal: controllerRef.current.signal
      });

      clearInterval(progressInterval);

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
      
    } catch (error: any) {
      setUploading(false);
      throw error;
    }
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h3 className="text-lg font-bold text-foreground">Live Upload System</h3>
      </div>

      <div className="mt-4">
        <input 
          type="file" 
          accept="video/*" 
          onChange={onFileChange} 
          className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500/10 file:to-purple-500/10 file:text-blue-400 hover:file:from-blue-500/20 hover:file:to-purple-500/20 transition-all duration-200"
        />
        
        {file && (
          <div className="mt-2 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Upload Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <button 
          disabled={!file || uploading} 
          onClick={startUpload} 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-muted disabled:text-muted-foreground text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
        >
          {uploading ? `Uploading...` : "🚀 Upload & Analyze"}
        </button>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
          <h3 className="font-semibold text-foreground mb-3">🎯 AI Analysis Results</h3>
          <div className="mb-3 text-sm">
            <span className="font-medium">Overall Confidence:</span> 
            <span className="ml-2 text-green-400 font-bold">{Math.round((analysis.overall ?? 0) * 100)}%</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Detected Effects:</h4>
            {(analysis.effects || []).map((e, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-sm">{e.name}</span>
                <span className="text-xs font-medium text-blue-400">{Math.round(e.confidence*100)}%</span>
              </div>
            ))}
          </div>
          
          {analysis.textOverlays && (
            <div className="mt-3">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Text Overlays:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.textOverlays.map((text, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    "{text}"
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={() => applyTemplate("temp_001")} 
            className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            ✨ Apply Cinematic Template
          </button>
        </div>
      )}

      {jobId && (
        <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Processing Job</span>
          </div>
          <div className="text-xs text-muted-foreground mb-3 font-mono bg-background/50 p-2 rounded">
            {jobId}
          </div>
          <button 
            onClick={pollJobStatus} 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            📊 Check Status & Download
          </button>
        </div>
      )}
    </div>
  );
}