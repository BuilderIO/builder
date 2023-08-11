const getTopLevelDomain = host => {
  if (host === "localhost" || host === "127.0.0.1") {
    return host;
  }
  const parts = host.split(".");
  if (parts.length > 2) {
    return parts.slice(1).join(".");
  }
  return host;
};
export { getTopLevelDomain }