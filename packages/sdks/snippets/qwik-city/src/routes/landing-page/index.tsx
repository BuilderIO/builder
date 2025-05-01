import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { fetchOneEntry } from '@builder.io/sdk-qwik';
import { NavBar } from '../../components/NavBar';

export const useNavLinks = routeLoader$(async () => {
  return await fetchOneEntry({
    model: 'navigation-links',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });
});

export default component$(() => {
  const links = useNavLinks();
  return (
    <nav>
      <h1>Acme company</h1>
      {/* NavBar component with links from Builder.io */}
      {links.value && <NavBar links={links.value} />}
      {/* Auth buttons */}
      <div class="auth-buttons">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  );
});
