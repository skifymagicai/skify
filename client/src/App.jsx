import React, { useState } from 'react'
import { Router, Route, Switch, Link, useLocation } from 'wouter'
import { Upload, FileText, Video, User, Settings } from 'lucide-react'
import UploadPage from './pages/UploadPage'
import TemplatesPage from './pages/TemplatesPage'
import RendersPage from './pages/RendersPage'
import AuthPage from './pages/AuthPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function Navigation() {
  const [location] = useLocation()
  const { user, logout } = useAuth()

  if (!user) return null

  const navItems = [
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/templates', icon: FileText, label: 'Templates' },
    { path: '/renders', icon: Video, label: 'My Renders' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '12px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000
    }}>
      {navItems.map(({ path, icon: Icon, label }) => (
        <Link key={path} href={path}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '12px',
            background: location === path ? 'rgba(100, 108, 255, 0.2)' : 'transparent',
            color: location === path ? '#646cff' : 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            <Icon size={20} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>{label}</span>
          </div>
        </Link>
      ))}
      
      <div onClick={logout} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: '12px',
        color: 'rgba(255, 255, 255, 0.7)',
        cursor: 'pointer',
        textDecoration: 'none'
      }}>
        <User size={20} />
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Logout</span>
      </div>
    </nav>
  )
}

function AppHeader() {
  const { user } = useAuth()
  
  if (!user) return null

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '16px 24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: 0
      }}>
        Skify
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
          {user.tier === 'pro' ? '✨ Pro' : '🆓 Free'}
        </span>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#00ff88'
        }} />
      </div>
    </header>
  )
}

function AppContent() {
  const { user } = useAuth()

  if (!user) {
    return <AuthPage />
  }

  return (
    <div style={{
      paddingTop: '80px',
      paddingBottom: '100px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      <Switch>
        <Route path="/" component={() => <UploadPage />} />
        <Route path="/upload" component={() => <UploadPage />} />
        <Route path="/templates" component={() => <TemplatesPage />} />
        <Route path="/renders" component={() => <RendersPage />} />
        <Route>
          <div style={{ padding: '24px', textAlign: 'center', color: 'white' }}>
            <h2>Page not found</h2>
            <Link href="/upload">
              <button className="btn btn-primary" style={{ marginTop: '16px' }}>
                Go to Upload
              </button>
            </Link>
          </div>
        </Route>
      </Switch>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        }}>
          <AppHeader />
          <AppContent />
          <Navigation />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App