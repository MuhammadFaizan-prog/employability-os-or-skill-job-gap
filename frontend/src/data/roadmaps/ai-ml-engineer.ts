import type { RoadmapTree } from './index'

export const aiMlEngineer: RoadmapTree = {
  id: 'ai-ml',
  title: 'AI/ML Engineer',
  description: 'Build and deploy machine learning systems.',
  children: [
    { id: 'python-ml', title: 'Python', description: 'Primary language for ML.', whyMatters: 'Ecosystem of ML libraries.', keyLearn: ['NumPy', 'Pandas', 'Scripting'] },
    { id: 'ml-fundamentals', title: 'ML Fundamentals', description: 'Supervised, unsupervised, evaluation.', whyMatters: 'Core concepts behind models.', keyLearn: ['Train/test split', 'Overfitting', 'Metrics'] },
    { id: 'deep-learning', title: 'Deep Learning', description: 'Neural networks and frameworks.', whyMatters: 'State-of-the-art models.', keyLearn: ['TensorFlow/PyTorch', 'CNNs', 'Training loops'] },
    { id: 'nlp', title: 'NLP', description: 'Text and language models.', whyMatters: 'Chatbots, search, summarization.', keyLearn: ['Tokenization', 'Embeddings', 'Transformers'] },
    { id: 'data-prep', title: 'Data Preprocessing', description: 'Cleaning and feature engineering.', whyMatters: 'Quality in, quality out.', keyLearn: ['Missing data', 'Scaling', 'Encoding'] },
    { id: 'mlops', title: 'MLOps', description: 'Deploy and monitor models.', whyMatters: 'Production reliability.', keyLearn: ['Model serving', 'Monitoring', 'Versioning'] },
    { id: 'git-ml', title: 'Git', description: 'Version control for code and data.', whyMatters: 'Reproducibility.', keyLearn: ['DVC', 'Repos', 'CI/CD'] },
  ],
}
