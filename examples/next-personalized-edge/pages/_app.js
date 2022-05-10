import '../assets/index.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen">
      <Component {...pageProps} />
    </div>
  );
}
