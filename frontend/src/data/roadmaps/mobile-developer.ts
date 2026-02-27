import type { RoadmapTree } from './index'

export const mobileDeveloper: RoadmapTree = {
  id: 'mobile',
  title: 'Mobile Developer',
  description: 'Build native and cross-platform mobile apps.',
  children: [
    { id: 'react-native', title: 'React Native / Flutter', description: 'Cross-platform mobile frameworks.', whyMatters: 'One codebase, multiple platforms.', keyLearn: ['Components', 'Navigation', 'Platform APIs'] },
    { id: 'mobile-ui', title: 'Mobile UI/UX', description: 'Patterns and platform guidelines.', whyMatters: 'Native-feeling apps.', keyLearn: ['iOS/Android guidelines', 'Responsive layouts', 'Gestures'] },
    { id: 'state-mobile', title: 'State Management', description: 'Provider, Riverpod, Redux.', whyMatters: 'Scalable app state.', keyLearn: ['Global state', 'Persistence', 'Async state'] },
    { id: 'apis-mobile', title: 'API Integration', description: 'REST, auth, error handling.', whyMatters: 'Connect to backend services.', keyLearn: ['Fetch/axios', 'Auth tokens', 'Offline handling'] },
    { id: 'push', title: 'Push Notifications', description: 'FCM, APNs, local notifications.', whyMatters: 'User engagement.', keyLearn: ['Setup', 'Payloads', 'Handling'] },
    { id: 'deploy-app', title: 'App Store Deployment', description: 'Store listings and releases.', whyMatters: 'Distribution to users.', keyLearn: ['Store Connect', 'Screenshots', 'Review process'] },
    { id: 'testing-mobile', title: 'Mobile Testing', description: 'Unit and widget tests.', whyMatters: 'Quality and regressions.', keyLearn: ['Widget tests', 'Integration tests', 'CI'] },
    { id: 'git-mobile', title: 'Git', description: 'Version control.', whyMatters: 'Team collaboration.', keyLearn: ['Branching', 'Merge', 'Releases'] },
  ],
}
