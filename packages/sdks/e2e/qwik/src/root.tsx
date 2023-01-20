import { Main } from './main';

export default (props: { url: string }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <Main url={props.url} />
      </body>
    </html>
  );
};
