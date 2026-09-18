import { useState } from 'react'
import { submitComplaint } from '../api/client.js'

export default function CitizenSubmit() {
  const [text, setText] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await submitComplaint({
        complaint_text: text.trim(),
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
      })
      setResult(data)
      setText('')
      setLat('')
      setLng('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const priorityColor = (level) => {
    if (level === 'High') return '#ef4444'
    if (level === 'Medium') return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div>
      <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        Submit a Complaint
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 600 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the civic issue in detail..."
          rows={4}
          required
          style={{
            padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.95rem',
            resize: 'vertical', fontFamily: 'inherit', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude (optional)"
            style={{
              flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none'
            }}
          />
          <input
            type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude (optional)"
            style={{
              flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none'
            }}
          />
        </div>
        <button
          type="submit" disabled={loading}
          style={{
            padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: loading ? '#4b5563' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontWeight: 600, fontSize: '1rem', fontFamily: 'inherit',
            transition: 'all 0.2s', alignSelf: 'flex-start'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '1.5rem', padding: '1.5rem', borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0' }}>
            Complaint #{result.id}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{result.department}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Type</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{result.issue_type}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
              <div style={{ color: priorityColor(result.priority_level), fontWeight: 700 }}>
                {result.priority_level} — {result.priority_score}/100
              </div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{Math.round(result.department_confidence * 100)}%</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Locality</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{result.locality || '—'}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{result.status}</div>
            </div>
          </div>
          {result.priority_reasons && result.priority_reasons.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Reasons</div>
              {result.priority_reasons.map((r, i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', paddingLeft: '0.5rem', borderLeft: '2px solid #6366f1', marginBottom: '0.3rem' }}>
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
