import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Heart, Download, Play, Star } from 'lucide-react'
import axios from 'axios'

function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const queryClient = useQueryClient()

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => axios.get('/api/templates').then(res => res.data.templates)
  })

  // Apply template mutation
  const applyMutation = useMutation({
    mutationFn: ({ templateId, videoUrl }) => 
      axios.post('/api/template/apply', { templateId, videoUrl }),
    onSuccess: () => {
      alert('Template application started! Check the Renders page for progress.')
    }
  })

  const handleApplyTemplate = (template) => {
    const videoUrl = prompt('Enter your video URL or leave empty to use uploaded video:')
    if (videoUrl !== null) { // User didn't cancel
      applyMutation.mutate({ 
        templateId: template.id, 
        videoUrl: videoUrl || 'uploaded-video-placeholder' 
      })
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '40px auto' }} />
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading templates...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '28px' }}>
          Template Library
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Browse and apply viral video templates to your content
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {templates?.map((template) => (
          <div key={template.id} className="card" data-testid={`template-card-${template.id}`}>
            <div style={{ 
              background: 'rgba(100, 108, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px'
            }}>
              <FileText size={48} style={{ color: '#646cff' }} />
            </div>

            <h3 style={{ 
              color: 'white', 
              marginBottom: '8px', 
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              {template.name}
            </h3>

            {/* Template metadata */}
            <div style={{ marginBottom: '16px' }}>
              {template.metadata?.effects && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '12px',
                    marginRight: '8px'
                  }}>
                    Effects:
                  </span>
                  {template.metadata.effects.slice(0, 2).map((effect) => (
                    <span key={effect} style={{
                      background: 'rgba(100, 108, 255, 0.2)',
                      color: '#646cff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      marginRight: '4px'
                    }}>
                      {effect}
                    </span>
                  ))}
                  {template.metadata.effects.length > 2 && (
                    <span style={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: '10px' 
                    }}>
                      +{template.metadata.effects.length - 2} more
                    </span>
                  )}
                </div>
              )}
              
              {template.metadata?.transitions && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '12px',
                    marginRight: '8px'
                  }}>
                    Transitions:
                  </span>
                  {template.metadata.transitions.slice(0, 2).map((transition) => (
                    <span key={transition} style={{
                      background: 'rgba(118, 75, 162, 0.2)',
                      color: '#764ba2',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      marginRight: '4px'
                    }}>
                      {transition}
                    </span>
                  ))}
                </div>
              )}

              {template.metadata?.textOverlays && (
                <div>
                  <span style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '12px'
                  }}>
                    Text overlays: {template.metadata.textOverlays.length}
                  </span>
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} style={{ color: '#ffd700' }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                    4.{Math.floor(Math.random() * 5 + 1)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Download size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                    {Math.floor(Math.random() * 1000 + 100)}
                  </span>
                </div>
              </div>
              
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: '11px' 
              }}>
                {new Date(template.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleApplyTemplate(template)}
                disabled={applyMutation.isPending}
                data-testid={`button-apply-${template.id}`}
                style={{ flex: 1 }}
              >
                {applyMutation.isPending ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Play size={14} style={{ marginRight: '6px' }} />
                    Apply
                  </>
                )}
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTemplate(template)}
                data-testid={`button-preview-${template.id}`}
                style={{ padding: '0.6em' }}
              >
                <FileText size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FileText size={64} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
          <h3 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
            No templates found
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Upload and analyze some viral videos to create templates
          </p>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
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
        }} onClick={() => setSelectedTemplate(null)}>
          <div className="card" style={{ 
            maxWidth: '500px', 
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>
              {selectedTemplate.name}
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px', fontSize: '14px' }}>
                Effects ({selectedTemplate.metadata?.effects?.length || 0})
              </h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {selectedTemplate.metadata?.effects?.map((effect) => (
                  <span key={effect} style={{
                    background: 'rgba(100, 108, 255, 0.2)',
                    color: '#646cff',
                    padding: '4px 10px',
                    borderRadius: '14px',
                    fontSize: '12px'
                  }}>
                    {effect}
                  </span>
                ))}
              </div>

              <h4 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px', fontSize: '14px' }}>
                Transitions ({selectedTemplate.metadata?.transitions?.length || 0})
              </h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {selectedTemplate.metadata?.transitions?.map((transition) => (
                  <span key={transition} style={{
                    background: 'rgba(118, 75, 162, 0.2)',
                    color: '#764ba2',
                    padding: '4px 10px',
                    borderRadius: '14px',
                    fontSize: '12px'
                  }}>
                    {transition}
                  </span>
                ))}
              </div>

              {selectedTemplate.metadata?.textOverlays?.length > 0 && (
                <>
                  <h4 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px', fontSize: '14px' }}>
                    Text Overlays
                  </h4>
                  {selectedTemplate.metadata.textOverlays.map((overlay, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: 'white' }}>"{overlay.text}"</span>
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        fontSize: '11px', 
                        marginTop: '2px' 
                      }}>
                        Position: {overlay.position} • Duration: {overlay.duration}s
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleApplyTemplate(selectedTemplate)
                  setSelectedTemplate(null)
                }}
                style={{ flex: 1 }}
                data-testid="button-apply-preview"
              >
                Apply Template
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTemplate(null)}
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

export default TemplatesPage