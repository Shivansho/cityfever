import React from 'react'

export default function StatCards({ stats }) {
  if (!stats) return null

  const cards = [
    {
      label: 'Total Complaints',
      value: stats.total_complaints ?? 0,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)',
      icon: '📋'
    },
    {
      label: 'High Priority',
      value: stats.priority_distribution?.High ?? 0,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      icon: '🚨'
    },
    {
      label: 'In Progress',
      value: stats.status_counts?.['In Progress'] ?? 0,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
      icon: '⚙️'
    },
    {
      label: 'Resolved',
      value: stats.status_counts?.Resolved ?? 0,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)',
      icon: '✅'
    },
    {
      label: 'Duplicate Clusters',
      value: stats.duplicate_clusters_count ?? 0,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.12)',
      icon: '🔗'
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            background: 'linear-gradient(145deg, #1e2238 0%, #151828 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: card.color
          }} />

          <div>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.35rem'
            }}>
              {card.label}
            </div>
            <div style={{
              color: '#fff',
              fontSize: '1.8rem',
              fontWeight: 700,
              lineHeight: 1.1
            }}>
              {card.value}
            </div>
          </div>

          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: card.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  )
}
