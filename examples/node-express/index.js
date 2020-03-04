let axios = require('axios');
let express = require('express');

let builderApiKey = 'bb209db71e62412dbe0114bdae18fd15';
let app = express();

app.get('/', (req, res) => {
  res.send(
    template({ body: `<h2>Welcome to the home page!</h2><p>This page comes from our code.</p>` })
  );
});
app.get('/about', (req, res) => {
  res.send(
    template({
      body: `<h2>Welcome to the about page!</h2><p>This page comes from our code too.</p }>`,
    })
  );
});

// Put this route last, so you will catch anything not matched by your code
app.get('*', async (req, res) => {
  let page = await axios
    .get(
      `https://cdn.builder.io/api/v1/html/page?url=${encodeURI(req.url)}&apiKey=${builderApiKey}`
    )
    .catch(handleError);

  if (page && page.data) {
    res.send(template({ body: '<h2>This page is from Builder!</h2>' + page.data.data.html }));
  } else {
    res.send(
      template({
        body: `<h2>No content found :(</h2><p>Have you published a Builder page for this URL?</p }>`,
      })
    );
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000...');
});

let handleError = err => {
  if (err.response.status === 404) {
    // Catch 404s - no page was found for this URL, that's fine
  } else {
    console.warn(err);
  }
  return null;
};

// Basic function to render content within a standard header and footer
// You can use any templating system you choose
let template = ({ body, title }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>
        ${title || 'Your default title'}
      </title>
      <style>
        body { font-family: sans-serif; }
        header { display: flex; padding: 10px; }
        .links { margin: auto; }
        main { padding: 10px; }
        .logo { font-size: 18px; letter-spacing: 2px; }
        .link { margin-right: 15px; }
      </style>
    </head>
    <body>
      <header>
        <div class="logo">MY SITE</div>
        <div class="links">
          <a class="link" href="/">Home</a>
          <a class="link" href="/about">About</a>
          <a class="link" href="/page-1">Page 1</a>
          <a class="link" href="/page-2">Page 2</a>
        </div>
      </header>
      <main>${body}</main>
      <footer>
      </footer>
    </body>
  </html>
`;
