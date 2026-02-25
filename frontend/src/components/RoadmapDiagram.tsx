import { useState } from 'react'
import type { RoadmapSteps, RoadmapSkillStep, RoadmapProjectStep } from '../lib/roadmap'
import './RoadmapDiagram.css'

type SelectedBlock =
  | { type: 'skill'; step: RoadmapSkillStep }
  | { type: 'project'; step: RoadmapProjectStep }
  | null

interface RoadmapDiagramProps {
  steps: RoadmapSteps
}

export function RoadmapDiagram({ steps }: RoadmapDiagramProps) {
  const [selected, setSelected] = useState<SelectedBlock>(null)

  const statusBadge = (status: string) => {
    const c = status === 'done' || status === 'suggested' ? 'done' : status === 'next' ? 'next' : 'upcoming'
    return <span className={`roadmap-badge roadmap-badge--${c}`}>{status}</span>
  }

  return (
    <section className="roadmap-diagram" aria-label={`Roadmap for ${steps.role}`}>
      <h2 className="roadmap-diagram__title">
        Roadmap: {steps.role}
      </h2>
      <p className="roadmap-diagram__hint">Click a block to see details.</p>

      <div className="roadmap-diagram__grid">
        {/* Skills row */}
        <div className="roadmap-diagram__section">
          <h3 className="roadmap-diagram__section-title">Skills</h3>
          <div className="roadmap-diagram__blocks">
            {steps.skillSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`roadmap-block roadmap-block--skill roadmap-block--${step.status} ${selected?.type === 'skill' && selected?.step.id === step.id ? 'roadmap-block--selected' : ''}`}
                onClick={() => setSelected(selected?.type === 'skill' && selected?.step.id === step.id ? null : { type: 'skill', step })}
              >
                <span className="roadmap-block__label">{step.name}</span>
                {statusBadge(step.status)}
              </button>
            ))}
          </div>
        </div>

        {/* Projects row */}
        <div className="roadmap-diagram__section">
          <h3 className="roadmap-diagram__section-title">Projects</h3>
          <div className="roadmap-diagram__blocks">
            {steps.projectSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`roadmap-block roadmap-block--project roadmap-block--${step.status} ${selected?.type === 'project' && selected?.step.id === step.id ? 'roadmap-block--selected' : ''}`}
                onClick={() => setSelected(selected?.type === 'project' && selected?.step.id === step.id ? null : { type: 'project', step })}
              >
                <span className="roadmap-block__label">{step.title}</span>
                {statusBadge(step.status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel (roadmap.sh style: info when you click a block) */}
      {selected && (
        <aside className="roadmap-detail" aria-live="polite">
          <div className="roadmap-detail__card">
            <button
              type="button"
              className="roadmap-detail__close"
              onClick={() => setSelected(null)}
              aria-label="Close detail"
            >
              ×
            </button>
            {selected.type === 'skill' ? (
              <>
                <h3 className="roadmap-detail__heading">{selected.step.name}</h3>
                <p className="roadmap-detail__meta">Skill · Difficulty {selected.step.difficulty}{selected.step.weight != null ? ` · Weight ${selected.step.weight}` : ''}</p>
                {selected.step.userProficiency != null && (
                  <p className="roadmap-detail__progress">Your proficiency: {selected.step.userProficiency}/5</p>
                )}
                <p className="roadmap-detail__tip">Focus on this skill to progress. Use docs, courses, and practice projects.</p>
              </>
            ) : (
              <>
                <h3 className="roadmap-detail__heading">{selected.step.title}</h3>
                <p className="roadmap-detail__meta">Project · Difficulty {selected.step.difficulty}</p>
                {selected.step.required_skills && selected.step.required_skills.length > 0 && (
                  <p className="roadmap-detail__meta">Required skills: {selected.step.required_skills.length} skill(s)</p>
                )}
                {selected.step.evaluation_criteria && (
                  <div className="roadmap-detail__criteria">
                    <strong>Evaluation criteria</strong>
                    <p>{selected.step.evaluation_criteria}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      )}
    </section>
  )
}
