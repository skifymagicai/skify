import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Upload, Link as LinkIcon, Play, Download } from 'lucide-react'
import axios from 'axios'

function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [currentJob, setCurrentJob] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)

  // Poll job status
  const { data: jobStatus } = useQuery({
    queryKey: ['job', currentJob?.id],
    queryFn: () => currentJob ? axios.get(`/api/job/${currentJob.id}`).then(res => res.data.job) : null,
    enabled: !!currentJob && currentJob.status !== 'completed' && currentJob.status !== 'failed',
    refetchInterval: 1000
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      
      // Get signed URL
      const signResponse = await axios.post('/api/upload/sign', {
        filename: file.name,
        contentType: file.type
      })
      
      // Upload file
      const uploadResponse = await axios.put(signResponse.data.signedUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Complete upload
      const completeResponse = await axios.post('/api/upload/complete', {
        uploadId: signResponse.data.uploadId,
        videoUrl: uploadResponse.data.url
      })
      
      return completeResponse.data
    },
    onSuccess: (data) => {
      setCurrentJob({ id: data.jobId, status: data.status })
    }
  })

  // URL analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: (url) => axios.post('/api/analyze', { videoUrl: url }),
    onSuccess: (response) => {
      setAnalysisResult(response.data.analysis)
    }
  })

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = [...e.dataTransfer.files]
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('video/')) {
        uploadMutation.mutate(file)
        setUploadedFile(file)
      } else {
        alert('Please select a video file')
      }
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('video/')) {
      uploadMutation.mutate(file)
      setUploadedFile(file)
    }
  }

  const handleUrlSubmit = (e) => {
    e.preventDefault()
    if (videoUrl.trim()) {
      analyzeMutation.mutate(videoUrl.trim())
    }
  }

  const currentJobStatus = jobStatus || currentJob

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '28px' }}>
          Upload Your Video
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Upload a video file or paste a URL to analyze and apply viral templates
        </p>
      </div>

      {/* URL Input */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LinkIcon size={20} />
          Video URL
        </h3>
        <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="url"
            placeholder="https://tiktok.com/@user/video/123 or YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="input"
            style={{ flex: 1 }}
            data-testid="input-video-url"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={analyzeMutation.isPending || !videoUrl.trim()}
            data-testid="button-analyze-url"
          >
            {analyzeMutation.isPending ? (
              <div className="spinner" />
            ) : (
              'Analyze'
            )}
          </button>
        </form>
      </div>

      {/* File Upload */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={20} />
          File Upload
        </h3>
        
        <div
          style={{
            border: `2px dashed ${dragActive ? '#646cff' : 'rgba(255, 255, 255, 0.3)'}`,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            background: dragActive ? 'rgba(100, 108, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
          data-testid="drop-zone"
        >
          <Upload size={48} style={{ color: dragActive ? '#646cff' : 'rgba(255, 255, 255, 0.5)', marginBottom: '16px' }} />
          <p style={{ color: 'white', marginBottom: '8px', fontSize: '18px' }}>
            Drop your video here or click to browse
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
            Supports MP4, MOV, AVI (max 100MB)
          </p>
          
          <input
            id="file-input"
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            data-testid="input-file"
          />
        </div>
      </div>

      {/* Upload Progress */}
      {uploadMutation.isPending && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="spinner" />
            <span style={{ color: 'white' }}>Uploading {uploadedFile?.name}...</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Job Progress */}
      {currentJobStatus && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>
            {currentJobStatus.type === 'analyze' ? 'Analyzing Video...' : 'Processing...'}
          </h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {currentJobStatus.status === 'processing' && <div className="spinner" />}
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Status: {currentJobStatus.status}
            </span>
          </div>
          
          {currentJobStatus.progress > 0 && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${currentJobStatus.progress}%` }} />
            </div>
          )}
          
          {currentJobStatus.status === 'completed' && (
            <div style={{ marginTop: '16px' }}>
              <button className="btn btn-primary" data-testid="button-view-results">
                <Play size={16} style={{ marginRight: '8px' }} />
                View Results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="card">
          <h4 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={20} />
            Analysis Results
          </h4>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <h5 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>Effects Detected</h5>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {analysisResult.style.effects.map((effect) => (
                  <span key={effect} style={{
                    background: 'rgba(100, 108, 255, 0.2)',
                    color: '#646cff',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }}>
                    {effect}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>Transitions</h5>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {analysisResult.style.transitions.map((transition) => (
                  <span key={transition} style={{
                    background: 'rgba(118, 75, 162, 0.2)',
                    color: '#764ba2',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }}>
                    {transition}
                  </span>
                ))}
              </div>
            </div>
            
            {analysisResult.style.textOverlays?.length > 0 && (
              <div>
                <h5 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>Text Overlays</h5>
                {analysisResult.style.textOverlays.map((overlay, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: 'white' }}>"{overlay.text}"</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', marginLeft: '8px', fontSize: '12px' }}>
                      {overlay.position} • {overlay.duration}s
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-primary" data-testid="button-save-template">
                Save as Template
              </button>
              <button className="btn btn-secondary" data-testid="button-apply-now">
                Apply to My Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadPage