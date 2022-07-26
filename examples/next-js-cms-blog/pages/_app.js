import '@/styles/index.css';
import { builder } from '@builder.io/react';
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
