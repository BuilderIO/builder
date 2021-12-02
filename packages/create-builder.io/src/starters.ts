export interface Starter {
  name: string;
  template: string;
  repo?: string;
  script?: string;
  description?: string;
  docs?: string;
  hidden?: boolean;
  prefix?: string;
}

export const STARTERS: Starter[] = [
  {
    name: 'react',
    repo: 'BuilderIO/builder',
    template: 'starter',
    description: 'Simple create-react-app using builder',
    docs: 'https://www.builder.io/blog/drag-drop-react',
    prefix: 'starters/create-builder/create-react-app',
  },
  {
    name: 'nextjs (SSR)',
    repo: 'BuilderIO/builder',
    template: 'starter',
    description: 'Basic React app with nextjs server-side rendering',
    docs: 'https://www.builder.io/blog/visual-next-js',
    prefix: 'starters/create-builder/nextjs',
  },
];

export function getStarterRepo(starterName: string): Starter {
  const repo = STARTERS.find(starter => starter.name === starterName);
  if (!repo) {
    throw new Error(`Starter "${starterName}" does not exist.`);
  }
  return repo;
}
