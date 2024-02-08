export const validEnvList = [
  'production',
  'qa',
  'test',
  'development',
  'dev',
  'cdn-qa',
  'cloud',
  'fast',
  'cdn2',
  'cdn-prod',
];

export const getEnv = (): string => {
  const env = process.env.NODE_ENV || 'production';
  return validEnvList.includes(env) ? env : 'production';
};
