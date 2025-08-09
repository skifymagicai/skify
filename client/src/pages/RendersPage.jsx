import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Video, Download, Play, Clock, CheckCircle, XCircle, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

function RendersPage() {
  const { user } = useAuth()
  const [selectedRender, setSelectedRender] = useState(null)

  // Mock data for renders since we need job tracking
  const mockRenders = [
    {
      id: '1',
      name: 'Viral Dance Template Applied',
      status: 'completed',
      progress: 100,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      completedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      resolution: user?.tier === 'pro' ? '4K' : '720p',
      watermark: user?.tier !== 'pro',
      resultUrl: '/api/files/result_1.mp4',
      templateName: 'Viral Dance Effect'
    },
    {
      id: '2',
      name: 'Text Animation Style Applied',
      status: 'processing',
      progress: 65,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
      resolution: user?.tier === 'pro' ? '4K' : '720p',
      watermark: user?.tier !== 'pro',
      templateName: 'Text Animation Style'
    },
    {
      id: '3',
      name: 'Color Pop Effect Applied',
      status: 'failed',
      progress: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      error: 'Video format not supported',
      templateName: 'Color Pop Effect'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} style={{ color: '#00ff88' }} />
      case 'processing':
        return <div className="spinner" />
      case 'failed':
        return <XCircle size={20} style={{ color: '#ff6b6b' }} />
      default:
        return <Clock size={20} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#00ff88'
      case 'processing':
        return '#646cff'
      case 'failed':
        return '#ff6b6b'
      default:
        return 'rgba(255, 255, 255, 0.5)'
    }
  }

  const formatDuration = (start, end) => {
    if (!end) return 'In progress...'
    const duration = new Date(end) - new Date(start)
    const minutes = Math.floor(duration / (1000 * 60))
    const seconds = Math.floor((duration % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleUpgrade = () => {
    // In a real app, this would open Razorpay checkout
    alert('Upgrade feature coming soon! This would open Razorpay payment.')
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '28px' }}>
          My Renders
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Track your video processing jobs and download results
        </p>
      </div>

      {/* User tier info */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user?.tier === 'pro' ? (
              <Crown size={24} style={{ color: '#ffd700' }} />
            ) : (
              <Video size={24} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            )}
            <div>
              <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>
                {user?.tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '14px' }}>
                {user?.tier === 'pro' 
                  ? '4K exports • No watermark • Priority processing' 
                  : '720p exports • Watermark included • Standard processing'}
              </p>
            </div>
          </div>
          
          {user?.tier !== 'pro' && (
            <button
              className="btn btn-primary"
              onClick={handleUpgrade}
              data-testid="button-upgrade"
            >
              <Crown size={16} style={{ marginRight: '6px' }} />
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* Renders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mockRenders.map((render) => (
          <div key={render.id} className="card" data-testid={`render-card-${render.id}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                background: 'rgba(100, 108, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Video size={32} style={{ color: '#646cff' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '16px' }}>
                    {render.name}
                  </h3>
                  {getStatusIcon(render.status)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <span style={{ 
                    color: getStatusColor(render.status), 
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {render.status}
                  </span>
                  
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                    Template: {render.templateName}
                  </span>
                  
                  {render.resolution && (
                    <span style={{ 
                      background: render.resolution === '4K' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: render.resolution === '4K' ? '#ffd700' : 'rgba(255, 255, 255, 0.7)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px'
                    }}>
                      {render.resolution}
                    </span>
                  )}
                  
                  {render.watermark && (
                    <span style={{ 
                      background: 'rgba(255, 107, 107, 0.2)',
                      color: '#ff6b6b',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px'
                    }}>
                      Watermark
                    </span>
                  )}
                </div>

                {render.status === 'processing' && (
                  <div style={{ marginBottom: '8px' }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${render.progress}%` }} />
                    </div>
                    <span style={{ 
                      color: 'rgba(255, 255, 255, 0.6)', 
                      fontSize: '11px',
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      {render.progress}% complete
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                    Started: {new Date(render.createdAt).toLocaleString()}
                  </span>
                  
                  {render.completedAt && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                      Duration: {formatDuration(render.createdAt, render.completedAt)}
                    </span>
                  )}
                </div>

                {render.error && (
                  <div style={{ 
                    color: '#ff6b6b', 
                    fontSize: '12px',
                    marginTop: '8px',
                    padding: '8px',
                    background: 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '6px'
                  }}>
                    Error: {render.error}
                  </div>
                )}
              </div>

              {render.status === 'completed' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedRender(render)}
                    data-testid={`button-preview-${render.id}`}
                  >
                    <Play size={16} />
                  </button>
                  
                  <button
                    className="btn btn-primary"
                    onClick={() => window.open(render.resultUrl, '_blank')}
                    data-testid={`button-download-${render.id}`}
                  >
                    <Download size={16} style={{ marginRight: '6px' }} />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {mockRenders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Video size={64} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
          <h3 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
            No renders yet
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Apply templates to your videos to see renders here
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {selectedRender && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedRender(null)}>
          <div className="card" style={{ 
            maxWidth: '600px', 
            width: '100%',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>
              {selectedRender.name}
            </h3>
            
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
              padding: '40px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Play size={64} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
              Video preview would be displayed here in a real implementation
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => window.open(selectedRender.resultUrl, '_blank')}
                data-testid="button-download-preview"
              >
                <Download size={16} style={{ marginRight: '6px' }} />
                Download
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedRender(null)}
                data-testid="button-close-preview"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RendersPage