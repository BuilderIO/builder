import { fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

// TODO: enter your public API key
const YOUR_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

function App() {
  const [links, setLinks] = useState(null);

  useEffect(() => {
    const urlPath = '/' + (params?.page?.join('/') || '');

    fetchOneEntry({
      model: 'nav-link',
      apiKey: YOUR_API_KEY,
      userAttributes: { urlPath },
    }).then(links => setLinks(links));
  }, []);

  return (
    <>
      <header>
        <nav>
          {links?.map((link, index) => (
            <a key={index} href={link.data.url}>
              {link.data.label}
            </a>
          ))}
        </nav>
      </header>
      <RestOfYourPage />
    </>
  );
}

export default App;
