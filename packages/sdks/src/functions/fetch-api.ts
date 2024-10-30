export const fetchApi = (
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  if (String(process.env.DEBUG) == 'true') {
    console.log(url);
  }
  return fetch(url, init);
};
