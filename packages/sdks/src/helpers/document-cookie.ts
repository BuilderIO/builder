export const getDocumentCookie = async () => document.cookie;
export const setDocumentCookie = async (cookie: string) =>
  (document.cookie = cookie);
