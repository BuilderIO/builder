const Error = ({ status }: { status: number }) => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `
        /* Anything other than /, /m/*, /c/*, /blog* should redirect to naked domain */
        if (!(location.pathname === '/' || location.pathname.match(/^\\/(m\\/|c\\/|blog\\/|blog$)/i))) {
          location.href = 'https://builder.io' + location.pathname + location.search + location.hash
        }
      `,
      }}
    />

    <div style={{ textAlign: 'center', margin: 'auto' }}>
      <div style={{ fontFamily: 'Helvetica, sans-serif', color: '#888' }}>
        {/* TODO: use actual status code */}
        {status || 404} - this page could not be found :(
      </div>
      <a
        style={{
          color: 'steelblue',
          textDecoration: 'none',
          fontWeight: 600,
          display: 'block',
          marginTop: 20,
        }}
        href="/"
      >
        Back to Builder.io
      </a>
      <img
        alt="404"
        // I know I know this is janky, it's a quick copy paste from some plain HTML in
        // another area of our site hosting code until we make our own 404 page
        onLoad={(e) => ((e.target as HTMLElement).style.opacity = '1')}
        style={{
          transition: 'opacity 0.2s',
          marginTop: 30,
          opacity: 0,
          maxWidth: '90vw',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow:
            '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
        }}
        src="https://media.giphy.com/media/RHzqdZJztOu7S/giphy.gif"
      />
    </div>
  </div>
);

export default Error;
