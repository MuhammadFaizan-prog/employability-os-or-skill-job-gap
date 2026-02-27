import type { RoadmapTree } from './index'

export const dataAnalyst: RoadmapTree = {
  id: 'data-analyst',
  title: 'Data Analyst',
  description: 'Turn data into insights and reports.',
  children: [
    { id: 'sql', title: 'SQL', description: 'Query and manipulate relational data.', whyMatters: 'Primary tool for data extraction.', keyLearn: ['SELECT, JOIN, GROUP BY', 'Window functions', 'Subqueries'] },
    { id: 'excel', title: 'Excel / Spreadsheets', description: 'Formulas, pivot tables, charts.', whyMatters: 'Universal reporting tool.', keyLearn: ['Pivot tables', 'VLOOKUP', 'Charts'] },
    { id: 'python-analytics', title: 'Python for Analytics', description: 'Pandas, NumPy, Jupyter.', whyMatters: 'Automation and advanced analysis.', keyLearn: ['Pandas basics', 'Data cleaning', 'Visualization'] },
    { id: 'viz', title: 'Data Visualization', description: 'Charts, dashboards, storytelling.', whyMatters: 'Communicate findings clearly.', keyLearn: ['Chart types', 'Dashboard design', 'Tableau/Power BI'] },
    { id: 'stats', title: 'Statistics', description: 'Descriptive and inferential stats.', whyMatters: 'Valid conclusions from data.', keyLearn: ['Distributions', 'Hypothesis testing', 'Correlation'] },
    { id: 'git-da', title: 'Git', description: 'Version control for scripts.', whyMatters: 'Reproducible analysis.', keyLearn: ['Repos', 'Branches', 'Collaboration'] },
  ],
}
