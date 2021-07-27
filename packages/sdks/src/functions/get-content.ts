// TODO: targeting, a/b tests, limit
export function getContent(options: { model: string; apiKey: string }) {
  const { model, apiKey } = options;
  return fetch(`https://cdn.builder.io/api/v2/content/${model}?apiKey=${apiKey}`).then(res =>
    res.json()
  );
}
