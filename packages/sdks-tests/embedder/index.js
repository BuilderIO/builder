import http from 'http';

/**
 * Very simple HTTP server that returns SDK content in an iframe to mimic the visual editor.
 *
 * Requires a `port` query param.
 * Forwards all remaining query param along with URL to the SDK.
 *
 * @type {import('http').RequestListener} server
 */
const server = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const fullUrl = new URL(req.url, `http://${req.headers.host}`);

  // enable visual editing
  fullUrl.searchParams.set('builder.frameEditing', 'true');

  const port = fullUrl.searchParams.get('port');
  fullUrl.searchParams.delete('port');

  const url = `http://localhost:${port}${fullUrl.pathname}${fullUrl.search}`;

  /**
   * alternative #2: https://stackoverflow.com/a/5868263/1520787
   */
  res.end(`
<!DOCTYPE html>
<html>
  <body style="margin:0px;padding:0px;overflow:hidden">
  <script>
    const handleEventData = (event) => {
      switch (event.data.type) {
        case 'builder.registerComponent':
          return 'Component name: ' + event.data.data.name;
        default:
          return '';
      }
    }
    window.addEventListener('message', (event) => {
      if (event.data.type.startsWith('builder.')) {
        console.log('BUILDER_EVENT:', event.data.type, handleEventData(event));
      }
    })
  </script>
  <iframe
    src="${url}"
    frameborder="0"
    style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px"
    height="100%"
    width="100%"
  ></iframe>
  </body>
</html>
`);
};

const EMBEDDER_PORT = process.env.PORT || 9999;

const s = http.createServer(server);
s.listen(EMBEDDER_PORT, () => {
  console.log(`Embedder is running on http://localhost:${EMBEDDER_PORT}`);
});
