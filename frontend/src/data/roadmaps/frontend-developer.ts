import type { RoadmapTree } from './index'

export const frontendDeveloper: RoadmapTree = {
  id: 'frontend',
  title: 'Frontend Developer',
  description: 'Build user interfaces and web experiences.',
  children: [
    { id: 'internet', title: 'Internet Fundamentals', description: 'HTTP, DNS, hosting basics. How the web works.', whyMatters: 'Core knowledge for debugging and deploying.', keyLearn: ['HTTP methods', 'DNS resolution', 'Hosting & deployment'] },
    { id: 'html', title: 'HTML', description: 'Structure and markup language for web pages.', whyMatters: 'Foundation of every web page.', keyLearn: ['Semantic tags', 'Forms & inputs', 'Accessibility basics'] },
    { id: 'css', title: 'CSS', description: 'Styling, layout, responsive design.', whyMatters: 'Visual presentation and UX.', keyLearn: ['Grid & Flexbox', 'Responsive design', 'CSS variables'] },
    { id: 'javascript', title: 'JavaScript', description: 'Core programming language of the web.', whyMatters: 'Drives interactivity in the browser.', keyLearn: ['ES6+ syntax', 'Async/await', 'DOM manipulation'] },
    { id: 'react', title: 'React', description: 'Component-based UI library by Meta.', whyMatters: 'Industry standard for modern UIs.', keyLearn: ['Components & hooks', 'State management', 'React patterns'] },
    { id: 'typescript', title: 'TypeScript', description: 'Typed superset of JavaScript.', whyMatters: 'Better tooling and fewer runtime errors.', keyLearn: ['Types & interfaces', 'Generics', 'Strict mode'] },
    { id: 'tailwind', title: 'Tailwind CSS', description: 'Utility-first CSS framework.', whyMatters: 'Rapid UI development.', keyLearn: ['Utility classes', 'Responsive utilities', 'Custom config'] },
    { id: 'git', title: 'Git', description: 'Version control system.', whyMatters: 'Collaboration and code history.', keyLearn: ['Branching', 'Merge & rebase', 'Remote workflows'] },
    { id: 'testing', title: 'Testing', description: 'Jest, React Testing Library.', whyMatters: 'Confidence in refactoring and releases.', keyLearn: ['Unit tests', 'Component tests', 'Mocking'] },
    { id: 'build', title: 'Build Tools', description: 'Vite, Webpack, bundlers.', whyMatters: 'Optimized production builds.', keyLearn: ['Vite config', 'Code splitting', 'Environment variables'] },
    { id: 'nextjs', title: 'Next.js (optional)', description: 'React framework with SSR.', whyMatters: 'Full-stack React and SEO.', keyLearn: ['Pages vs App Router', 'SSR/SSG', 'API routes'] },
  ],
}
