/**
 * Roadmap tree types and role-to-data map.
 * Tree depth: 2 levels (role root -> technology nodes).
 */
export interface RoadmapNode {
  id: string
  title: string
  description: string
  whyMatters?: string
  keyLearn?: string[]
  children?: RoadmapNode[]
}

export interface RoadmapTree {
  id: string
  title: string
  description: string
  children: RoadmapNode[]
}

export type ProgressStatus = 'done' | 'in_progress' | 'pending'

import { frontendDeveloper } from './frontend-developer'
import { backendDeveloper } from './backend-developer'
import { dataAnalyst } from './data-analyst'
import { aiMlEngineer } from './ai-ml-engineer'
import { mobileDeveloper } from './mobile-developer'

const roleToRoadmap: Record<string, RoadmapTree> = {
  'Frontend Developer': frontendDeveloper,
  'Backend Developer': backendDeveloper,
  'Data Analyst': dataAnalyst,
  'AI/ML Engineer': aiMlEngineer,
  'Mobile Developer': mobileDeveloper,
}

export function getRoadmapForRole(role: string): RoadmapTree | null {
  return roleToRoadmap[role] ?? null
}
