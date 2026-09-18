import React, { useState, useEffect } from 'react'
import { fetchDepartmentQueue, updateComplaintStatus } from '../api/client.js'
import ComplaintCard from './ComplaintCard.jsx'

const DEPARTMENTS = ['Roads', 'Water', 'Sanitation', 'Electrical', 'Sewage', 'Traffic', 'Parks']

export default function QueueView({ onSelectComplaint }) {
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0])
  const [queueData, setQueueData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadQueue = async (dept) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDepartmentQueue(dept)
      setQueueData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQueue(selectedDept)
  }, [selectedDept])

  const handleStatusChange = async (id, status) => {
    try {
      await updateComplaintStatus(id, status)
      loadQueue(selectedDept)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Department Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        background: 'rgba(255,255,255,0.03)',
        padding: '0.5rem',
        borderRadius: '10px'
      }}>
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: selectedDept === dept ? '#6366f1' : 'transparent',
              color: selectedDept === dept ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.15s'
            }}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Queue Header Metrics */}
      {queueData && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e2238 0%, #171a2b 100%)',
          padding: '1rem 1.5rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
              {selectedDept} Operational Queue
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              Ordered descending by priority score
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                Pending
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                {queueData.pending_count ?? 0}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                High Priority
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
                {queueData.high_priority_count ?? 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Items */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '3rem' }}>
          Loading queue for {selectedDept}...
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
          {error}
        </div>
      ) : queueData?.items?.length === 0 ? (
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px'
        }}>
          No pending complaints in {selectedDept} queue.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {queueData?.items?.map((item) => (
            <ComplaintCard
              key={item.id}
              complaint={item}
              onSelect={onSelectComplaint}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
