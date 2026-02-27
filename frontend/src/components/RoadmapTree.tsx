import type { RoadmapNode, RoadmapTree as RoadmapTreeType } from '../data/roadmaps/index'
import type { RoadmapProgressStatus } from '../hooks/useRoleData'

interface RoadmapTreeProps {
  tree: RoadmapTreeType
  progress: Record<string, RoadmapProgressStatus>
  selectedId: string | null
  onSelectNode: (node: RoadmapNode) => void
}

function getNodeStyle(status: RoadmapProgressStatus) {
  switch (status) {
    case 'done':
      return { background: 'var(--fg)', color: 'var(--bg)', border: '2px solid var(--fg)' }
    case 'in_progress':
      return { background: 'transparent', color: 'var(--fg)', border: '2px solid var(--accent, #0ea5e9)' }
    default:
      return { background: 'var(--gray-light)', color: 'var(--gray-dark)', border: '2px solid var(--gray-mid)' }
  }
}

export function RoadmapTree({ tree, progress, selectedId, onSelectNode }: RoadmapTreeProps) {
  const nodes = tree.children ?? []
  return (
    <div style={{ position: 'relative', paddingLeft: 0 }}>
      {nodes.length > 1 && (
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 28,
            bottom: 28,
            width: 2,
            background: 'var(--gray-mid)',
            zIndex: 0,
          }}
        />
      )}
      {nodes.map((node, i) => {
        const status = progress[node.id] ?? 'pending'
        const isSelected = selectedId === node.id
        const style = getNodeStyle(status)
        return (
          <div
            key={node.id}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: i < nodes.length - 1 ? 12 : 0,
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                flexShrink: 0,
                ...style,
              }}
            />
            <button
              type="button"
              onClick={() => onSelectNode(node)}
              style={{
                flex: 1,
                textAlign: 'left',
                padding: '0.75rem 1rem',
                border: '1px solid ' + (isSelected ? 'var(--fg)' : 'var(--border-color)'),
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'var(--gray-light)' : 'var(--bg)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--fg)',
              }}
            >
              {node.title}
            </button>
          </div>
        )
      })}
    </div>
  )
}
