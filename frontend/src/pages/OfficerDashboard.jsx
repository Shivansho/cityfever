import { useState, useEffect } from 'react'
import {
  fetchComplaints,
  fetchDashboardStats,
  updateComplaintStatus,
  reassignComplaint,
  fetchIncidentClusters
} from '../api/client.js'
import StatCards from '../components/StatCards.jsx'
import Map from '../components/Map.jsx'
import QueueView from '../components/QueueView.jsx'

const DEPARTMENTS = ['All', 'Roads', 'Water', 'Sanitation', 'Electrical', 'Sewage', 'Traffic', 'Parks', 'Other']
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Manual Review']
const PRIORITIES = ['All', 'High', 'Medium', 'Low']

export default function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState('triage') // 'triage' | 'map' | 'queues'
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [clusters, setClusters] = useState([])
  const [total, setTotal] = useState(0)
  const [filterDept, setFilterDept] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [selected, setSelected] = useState(null)
  const [reassignDept, setReassignDept] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterDept !== 'All') params.department = filterDept
      if (filterStatus !== 'All') params.status = filterStatus
      if (filterPriority !== 'All') params.priority_level = filterPriority
      params.limit = 100

      const [statsData, complaintsData, clustersData] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        fetchComplaints(params).catch(() => ({ items: [], total: 0 })),
        fetchIncidentClusters().catch(() => ({ clusters: [] }))
      ])
      setStats(statsData)
      setComplaints(complaintsData.items || [])
      setTotal(complaintsData.total || 0)
      setClusters(clustersData?.clusters || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterDept, filterStatus, filterPriority])

  const handleStatusUpdate = async (id, newStatus) => {
    await updateComplaintStatus(id, newStatus)
    loadData()
  }

  const handleReassign = async (id) => {
    if (!reassignDept) return
    await reassignComplaint(id, reassignDept, 'Officer manual reassignment')
    setReassignDept('')
    setSelected(null)
    loadData()
  }

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
            City Operations Command Center
          </h2>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Multi-department civic triage, spatial clusters & real-time resolution
          </span>
        </div>

        {/* Dashboard Sub-navigation */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('triage')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'triage' ? '#6366f1' : 'transparent',
              color: activeTab === 'triage' ? '#fff' : 'rgba(255,255,255,0.6)'
            }}
          >
            📋 Triage Table
          </button>
          <button
            onClick={() => setActiveTab('map')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'map' ? '#6366f1' : 'transparent',
              color: activeTab === 'map' ? '#fff' : 'rgba(255,255,255,0.6)'
            }}
          >
            🗺️ Spatial Map
          </button>
          <button
            onClick={() => setActiveTab('queues')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'queues' ? '#6366f1' : 'transparent',
              color: activeTab === 'queues' ? '#fff' : 'rgba(255,255,255,0.6)'
            }}
          >
            🏢 Dept Queues
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <StatCards stats={stats} />

      {/* Tab: Geospatial Map */}
      {activeTab === 'map' && (
        <div style={{ marginBottom: '2rem' }}>
          <Map
            complaints={complaints}
            clusters={clusters}
            onSelectComplaint={(c) => setSelected(c)}
          />
        </div>
      )}

      {/* Tab: Department Queues */}
      {activeTab === 'queues' && (
        <div style={{ marginBottom: '2rem' }}>
          <QueueView onSelectComplaint={(c) => setSelected(c)} />
        </div>
      )}

      {/* Tab: Triage Table */}
      {activeTab === 'triage' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <FilterSelect label="Department" value={filterDept} options={DEPARTMENTS} onChange={setFilterDept} />
            <FilterSelect label="Status" value={filterStatus} options={STATUSES} onChange={setFilterStatus} />
            <FilterSelect label="Priority" value={filterPriority} options={PRIORITIES} onChange={setFilterPriority} />
            <button
              onClick={loadData}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: '0.85rem', alignSelf: 'flex-end'
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Showing {complaints.length} of {total} complaints
          </div>

          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem', textAlign: 'center' }}>Loading complaints...</div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['ID', 'Department', 'Issue', 'Priority', 'Locality', 'Status', 'Cluster'].map(h => (
                      <th key={h} style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left', padding: '0.75rem 0.8rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ color: '#fff', padding: '0.75rem 0.8rem', fontWeight: 600 }}>#{c.id}</td>
                      <td style={{ color: 'rgba(255,255,255,0.85)', padding: '0.75rem 0.8rem' }}>{c.department}</td>
                      <td style={{ color: 'rgba(255,255,255,0.85)', padding: '0.75rem 0.8rem' }}>{c.issue_type}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>
                        <span style={{ color: priorityColor(c.priority_level), fontWeight: 700 }}>{c.priority_level}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '0.35rem' }}>({c.priority_score})</span>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.7)', padding: '0.75rem 0.8rem' }}>{c.locality || '—'}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>
                        <span style={{
                          color: statusColor(c.status),
                          background: `${statusColor(c.status)}15`,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', padding: '0.75rem 0.8rem' }}>
                        {c.duplicate_cluster_id ? (
                          <span style={{ color: '#c084fc', background: 'rgba(168,85,247,0.12)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                            {c.duplicate_cluster_id}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1d2e', borderRadius: '16px', padding: '2rem',
              maxWidth: 620, width: '90%', maxHeight: '85vh', overflow: 'auto',
              border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>Complaint #{selected.id}</h3>
                <span style={{
                  color: priorityColor(selected.priority_level),
                  background: `${priorityColor(selected.priority_level)}20`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  {selected.priority_level} ({selected.priority_score})
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontSize: '1.1rem', borderRadius: '50%', width: '32px', height: '32px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
              lineHeight: 1.5
            }}>
              {selected.complaint_text}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <InfoField label="Department" value={selected.department} />
              <InfoField label="Issue Type" value={selected.issue_type} />
              <InfoField label="Dept Confidence" value={`${Math.round((selected.department_confidence || 0) * 100)}%`} />
              <InfoField label="Issue Confidence" value={`${Math.round((selected.issue_confidence || 0) * 100)}%`} />
              <InfoField label="Locality" value={selected.locality || '—'} />
              <InfoField label="Duration" value={selected.duration_text || '—'} />
              <InfoField label="Status" value={selected.status} color={statusColor(selected.status)} />
              <InfoField label="Cluster ID" value={selected.duplicate_cluster_id || 'None (Standalone)'} />
            </div>

            {selected.priority_reasons?.length > 0 && (
              <div style={{ marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '8px' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                  Priority Reason Breakdown
                </div>
                {selected.priority_reasons.map((r, i) => (
                  <div key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', paddingLeft: '0.5rem', borderLeft: '2px solid #6366f1', marginBottom: '0.25rem' }}>
                    {r}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Update Workflow Status
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {['Pending', 'In Progress', 'Resolved', 'Manual Review'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(selected.id, s)}
                    style={{
                      padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                      background: selected.status === s ? '#6366f1' : 'rgba(255,255,255,0.04)',
                      color: '#fff', cursor: 'pointer', fontSize: '0.8rem'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Manual Reassignment
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={reassignDept}
                  onChange={(e) => setReassignDept(e.target.value)}
                  style={{
                    padding: '0.45rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'
                  }}
                >
                  <option value="">Select target department...</option>
                  {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button
                  onClick={() => handleReassign(selected.id)}
                  disabled={!reassignDept}
                  style={{
                    padding: '0.45rem 0.9rem', borderRadius: '6px', border: 'none',
                    cursor: reassignDept ? 'pointer' : 'not-allowed',
                    background: reassignDept ? '#f59e0b' : '#374151', color: '#fff', fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  Reassign Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '0.45rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function InfoField({ label, value, color }) {
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ color: color || '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{value}</div>
    </div>
  )
}
