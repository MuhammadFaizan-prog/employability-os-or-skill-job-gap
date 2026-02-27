import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoleData } from '../hooks/useRoleData'
import { getStoredRole } from '../hooks/useAuth'
import { getRoadmapForRole } from '../data/roadmaps/index'
import { RoadmapTree } from '../components/RoadmapTree'
import { RoadmapNodeDetail } from '../components/RoadmapNodeDetail'
import type { RoadmapNode } from '../data/roadmaps/index'

export function RoadmapPage() {
  const navigate = useNavigate()
  const role = getStoredRole()
  const { loading, error, roadmapProgress, setRoadmapNodeStatus } = useRoleData(role)
  const tree = getRoadmapForRole(role)
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)

  const handleStatusChange = async (nodeId: string, status: 'done' | 'in_progress' | 'pending') => {
    await setRoadmapNodeStatus(nodeId, status)
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)' }}>Loading roadmap...</p>
      </div>
    )
  }

  const roleBadge = role.toUpperCase()

  if (!tree) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)', marginBottom: '1rem' }}>No roadmap for this role.</p>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      <div className="container" style={{ paddingTop: '3rem' }}>
        {error && (
          <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
            Note: {error}. Showing local data.
          </div>
        )}

        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Career Roadmap</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span className="role-badge">{roleBadge}</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
              Follow your sequenced learning path. Click a node to see details and update your progress.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>

        <div className="roadmap-layout">
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--gray-dark)' }}>{tree.title}</h2>
            <RoadmapTree
              tree={tree}
              progress={roadmapProgress}
              selectedId={selectedNode?.id ?? null}
              onSelectNode={setSelectedNode}
            />
          </div>
          <div>
            {selectedNode ? (
              <RoadmapNodeDetail
                node={selectedNode}
                status={roadmapProgress[selectedNode.id] ?? 'pending'}
                onStatusChange={handleStatusChange}
                onClose={() => setSelectedNode(null)}
              />
            ) : (
              <div className="card roadmap-detail-card" style={{ padding: '2rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', textAlign: 'center', margin: 0 }}>
                  Click any topic to view details and set your progress (Done / In Progress / Pending).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
