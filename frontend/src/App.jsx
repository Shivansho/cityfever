import { useState } from 'react'
import CitizenSubmit from './pages/CitizenSubmit.jsx'
import OfficerDashboard from './pages/OfficerDashboard.jsx'

export default function App() {
  const [view, setView] = useState('citizen')

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif", minHeight: '100vh', background: '#0f1117' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', background: 'linear-gradient(135deg, #1a1d2e 0%, #0f1117 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#6366f1' }}>Civic</span>Flow
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setView('citizen')}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem',
              background: view === 'citizen' ? '#6366f1' : 'rgba(255,255,255,0.06)',
              color: view === 'citizen' ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s'
            }}
          >
            Citizen Portal
          </button>
          <button
            onClick={() => setView('officer')}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem',
              background: view === 'officer' ? '#6366f1' : 'rgba(255,255,255,0.06)',
              color: view === 'officer' ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s'
            }}
          >
            Officer Dashboard
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {view === 'citizen' ? <CitizenSubmit /> : <OfficerDashboard />}
      </main>
    </div>
  )
}
