import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import { NavBar } from '../../components/NavBar';

export function NavLinks() {
  const [links, setLinks] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: 'navigation-links',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    }).then((data) => {
      setLinks(data);
    });
  }, []);

  return (
    <nav>
      {/* Brand name */}
      <h1>Acme company</h1>

      {/* Navigation links Builder Component */}
      <NavBar links={links} />

      {/* Auth buttons */}
      <div className="auth-buttons">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  );
}
