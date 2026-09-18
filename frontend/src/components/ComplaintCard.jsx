import React from 'react'

export default function ComplaintCard({ complaint, onSelect, onStatusChange }) {
  if (!complaint) return null

  const priorityColor = (level) => {
    if (level === 'High') return '#ef4444'
    if (level === 'Medium') return '#f59e0b'
    return '#22c55e'
  }

  const statusColor = (status) => {
    if (status === 'Resolved') return '#22c55e'
    if (status === 'In Progress') return '#3b82f6'
    if (status === 'Manual Review') return '#f59e0b'
    return '#94a3b8'
  }

  return (
    <div
      onClick={() => onSelect && onSelect(complaint)}
      style={{
        background: 'linear-gradient(145deg, #1e2238 0%, #151828 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.85rem' }}>
            #{complaint.id}
          </span>
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {complaint.department}
          </span>
          {complaint.issue_type && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#cbd5e1',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem'
            }}>
              {complaint.issue_type}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: `${priorityColor(complaint.priority_level)}20`,
            color: priorityColor(complaint.priority_level),
            border: `1px solid ${priorityColor(complaint.priority_level)}40`,
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {complaint.priority_level} ({complaint.priority_score})
          </span>
          <span style={{
            background: `${statusColor(complaint.status)}20`,
            color: statusColor(complaint.status),
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {complaint.status}
          </span>
        </div>
      </div>

      <p style={{
        color: '#f1f5f9',
        fontSize: '0.9rem',
        lineHeight: 1.5,
        margin: '0 0 0.75rem 0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {complaint.complaint_text}
      </p>

      {/* Entity Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {complaint.locality && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            📍 <strong>{complaint.locality}</strong>
          </span>
        )}
        {complaint.duration_text && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            ⏳ {complaint.duration_text}
          </span>
        )}
        {complaint.duplicate_cluster_id && (
          <span style={{
            fontSize: '0.72rem',
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            fontWeight: 600
          }}>
            🔗 Cluster {complaint.duplicate_cluster_id}
          </span>
        )}
      </div>

      {/* Priority Reasons */}
      {complaint.priority_reasons && complaint.priority_reasons.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {complaint.priority_reasons.map((reason, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.7rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#94a3b8',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem'
              }}
            >
              • {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
