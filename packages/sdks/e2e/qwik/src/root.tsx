import { Main } from './main';

import './global.css';

export default (props: { url: string }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <Main url={props.url} />
      </body>
    </html>
  );
};
