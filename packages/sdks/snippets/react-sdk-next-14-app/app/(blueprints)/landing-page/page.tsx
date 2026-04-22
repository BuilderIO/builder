import { fetchOneEntry } from '@builder.io/sdk-react';
import { NavBar } from '../../components/NavBar';

export default async function NavLinksPage() {
  const links = await fetchOneEntry({
    model: 'navigation-links',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });

  return (
    <nav>
      <h1>Acme company</h1>
      {/* NavBar component with links from Builder.io */}
      {links && <NavBar links={links} />}
      {/* Auth buttons */}
      <div className="auth-buttons">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  );
}
