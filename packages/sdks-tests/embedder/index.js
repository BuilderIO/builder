import http from 'http';

/**
 * Very simple HTTP server that returns SDK content in an iframe to mimic the visual editor.
 *
 * Requires the first url fragment to be a `port` value.
 * Forwards all remaining URL fragments (& query params) to the SDK.
 *
 * @type {import('http').RequestListener} server
 */
const server = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const [port, initialUrl] = req.url.split('/');
  const url = `http://localhost:${port}${initialUrl}`;

  /**
   * alternative #2: https://stackoverflow.com/a/5868263/1520787
   */
  res.end(`
<!DOCTYPE html>
<html>
  <body style="margin:0px;padding:0px;overflow:hidden">
    <iframe
      src="${url}"
      frameborder="0"
      style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px"
      height="100%"
      width="100%">
    </iframe>
  </body>
</html>
`);
};

const EMBEDDER_PORT = process.env.PORT || 9999;

const s = http.createServer(server);
s.listen(EMBEDDER_PORT, () => {
  console.log(`Embedder is running on http://localhost:${EMBEDDER_PORT}`);
});
