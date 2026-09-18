import React, { useState } from 'react'

export default function Map({ complaints = [], clusters = [], onSelectComplaint }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  // Filter complaints that have coordinates
  const geoComplaints = complaints.filter(
    (c) => c.latitude != null && c.longitude != null
  )

  // Map coordinate bounds
  const lats = geoComplaints.map((c) => c.latitude)
  const lngs = geoComplaints.map((c) => c.longitude)

  const minLat = lats.length > 0 ? Math.min(...lats) - 0.02 : 28.4
  const maxLat = lats.length > 0 ? Math.max(...lats) + 0.02 : 28.8
  const minLng = lngs.length > 0 ? Math.min(...lngs) - 0.02 : 77.0
  const maxLng = lngs.length > 0 ? Math.max(...lngs) + 0.02 : 77.4

  const toSvgX = (lng) => {
    return ((lng - minLng) / (maxLng - minLng || 1)) * 760 + 20
  }

  const toSvgY = (lat) => {
    // Invert Y because latitude grows northwards
    return 380 - ((lat - minLat) / (maxLat - minLat || 1)) * 340
  }

  const priorityColor = (level) => {
    if (level === 'High') return '#ef4444'
    if (level === 'Medium') return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #161928 0%, #0d0f1a 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
            Geospatial Incident Map
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            Showing {geoComplaints.length} geo-tagged complaints & {clusters.length} spatial clusters
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            High
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            Medium
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Low
          </div>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        background: '#090b12',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden'
      }}>
        {/* Subtle Map Grid lines */}
        <svg
          viewBox="0 0 800 400"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Render Cluster Buffers */}
          {clusters.map((cluster, idx) => {
            const cx = toSvgX(cluster.center_longitude)
            const cy = toSvgY(cluster.center_latitude)
            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="32"
                  fill="rgba(99, 102, 241, 0.15)"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text
                  x={cx}
                  y={cy - 38}
                  fill="#a5b4fc"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {cluster.dominant_department} ({cluster.complaint_count})
                </text>
              </g>
            )
          })}

          {/* Render Complaint Markers */}
          {geoComplaints.map((c) => {
            const x = toSvgX(c.longitude)
            const y = toSvgY(c.latitude)
            const col = priorityColor(c.priority_level)
            const isHovered = hoveredItem?.id === c.id

            return (
              <g
                key={c.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredItem(c)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => onSelectComplaint && onSelectComplaint(c)}
              >
                {/* Pulse ring for high priority */}
                {c.priority_level === 'High' && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 14 : 10}
                    fill="none"
                    stroke={col}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : 5}
                  fill={col}
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredItem && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(15, 17, 23, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            maxWidth: '320px',
            pointerEvents: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.8rem' }}>
                #{hoveredItem.id} · {hoveredItem.department}
              </span>
              <span style={{
                color: priorityColor(hoveredItem.priority_level),
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {hoveredItem.priority_level} ({hoveredItem.priority_score})
              </span>
            </div>
            <div style={{ color: '#fff', fontSize: '0.8rem', lineHeight: 1.3, marginBottom: '0.25rem' }}>
              {hoveredItem.complaint_text}
            </div>
            {hoveredItem.locality && (
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                📍 {hoveredItem.locality}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
