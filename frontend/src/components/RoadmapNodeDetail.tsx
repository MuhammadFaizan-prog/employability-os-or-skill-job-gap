import type { RoadmapNode } from '../data/roadmaps/index'
import type { RoadmapProgressStatus } from '../hooks/useRoleData'

interface RoadmapNodeDetailProps {
  node: RoadmapNode
  status: RoadmapProgressStatus
  onStatusChange: (nodeId: string, status: RoadmapProgressStatus) => void
  onClose: () => void
}

const STATUS_OPTIONS: { value: RoadmapProgressStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export function RoadmapNodeDetail({ node, status, onStatusChange, onClose }: RoadmapNodeDetailProps) {
  return (
    <div className="card" style={{ position: 'sticky', top: 80 }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="card-header-label" style={{ color: 'var(--gray-dark)' }}>Detail</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-dark)', fontSize: '1.1rem' }} aria-label="Close">✕</button>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{node.title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', lineHeight: 1.5, marginBottom: '1rem' }}>{node.description}</p>
        {node.whyMatters && (
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', fontStyle: 'italic', marginBottom: '1rem' }}>
            Why it matters: {node.whyMatters}
          </p>
        )}
        {node.keyLearn && node.keyLearn.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.5rem' }}>Key things to learn</p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--gray-dark)', lineHeight: 1.6 }}>
              {node.keyLearn.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.5rem' }}>Status</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange(node.id, opt.value)}
                className={status === opt.value ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
