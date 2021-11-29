export interface Starter {
  name: string;
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
    repo: 'manucorporat/test-builder-starter',
    description: 'Simple create-react-app using builder',
    docs: 'https://github.com/BuilderIO/builder-react-example-starter',
    prefix: 'create-react-app',
  },
  {
    name: 'nextjs (SSR)',
    repo: 'manucorporat/test-builder-starter',
    description: 'Basic React app with nextjs server-side rendering',
    docs: 'https://github.com/BuilderIO/nextjs-shopify#readme',
    prefix: 'nextjs',
  },
];

export function getStarterRepo(starterName: string): Starter {
  if (starterName.includes('/')) {
    return {
      name: starterName,
      repo: starterName,
    };
  }
  const repo = STARTERS.find(starter => starter.name === starterName);
  if (!repo) {
    throw new Error(`Starter "${starterName}" does not exist.`);
  }
  return repo;
}
