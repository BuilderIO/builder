import { Main } from './main';

export default (props: { url: string }) => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <Main url={props.url} />
      </body>
    </>
  );
};
