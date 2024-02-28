import { Content, fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

// TODO: enter your public API key
const YOUR_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

function App() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    const urlPath = '/' + (params?.page?.join('/') || '');

    fetchOneEntry({
      model: 'announcement-bar',
      apiKey: YOUR_API_KEY,
      userAttributes: { urlPath },
    }).then(announcementBar => setAnnouncement(announcementBar));
  }, []);

  return (
    <>
      {/* Put your header here. */}
      <YourHeader />
      {announcement && <Content content={content} model="announcement-bar" apiKey={YOUR_API_KEY} />}
      {/* Put the rest of your page here. */}
      <TheRestOfYourPage />
    </>
  );
}

export default App;
