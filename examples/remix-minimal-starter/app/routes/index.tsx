export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix + Builder.io Starter</h1>
      <h4>
        This is index static route for remix pages, to visit your Builder.io pages, publish some and
        have fun!
      </h4>
      <ul>
        <li>
          <a target="_blank" href="https://builder.io/content" rel="noreferrer">
            Go to Builder.io
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            Remix 15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
