import type { RoadmapTree } from './index'

export const backendDeveloper: RoadmapTree = {
  id: 'backend',
  title: 'Backend Developer',
  description: 'Server-side logic, APIs, and data persistence.',
  children: [
    { id: 'http-apis', title: 'HTTP & REST', description: 'APIs, status codes, request/response.', whyMatters: 'Core of client-server communication.', keyLearn: ['REST conventions', 'Status codes', 'Headers & body'] },
    { id: 'node', title: 'Node.js', description: 'JavaScript runtime for servers.', whyMatters: 'Unified language for full-stack.', keyLearn: ['Event loop', 'Modules', 'File system'] },
    { id: 'databases', title: 'Databases', description: 'SQL and NoSQL fundamentals.', whyMatters: 'Persistent data storage.', keyLearn: ['SQL queries', 'Schema design', 'Indexes'] },
    { id: 'auth', title: 'Authentication', description: 'Sessions, JWT, OAuth.', whyMatters: 'Secure user identity.', keyLearn: ['JWT', 'Sessions', 'OAuth flows'] },
    { id: 'security', title: 'Security', description: 'Validation, sanitization, HTTPS.', whyMatters: 'Protect user data and services.', keyLearn: ['Input validation', 'SQL injection', 'XSS'] },
    { id: 'git', title: 'Git', description: 'Version control.', whyMatters: 'Collaboration and deployment.', keyLearn: ['Branching', 'Merge', 'CI/CD'] },
    { id: 'docker', title: 'Docker', description: 'Containers and deployment.', whyMatters: 'Consistent environments.', keyLearn: ['Dockerfile', 'Images', 'Compose'] },
    { id: 'testing-backend', title: 'Testing', description: 'Unit and integration tests.', whyMatters: 'Reliable backend changes.', keyLearn: ['Jest', 'Supertest', 'Mocks'] },
  ],
}
