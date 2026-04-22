import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { NavBar } from '../../components/NavBar';

export const getServerSideProps = (async () => {
  const links = await fetchOneEntry({
    model: 'navigation-links',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });
  return { props: { links } };
}) satisfies GetServerSideProps<{
  links: BuilderContent | null;
}>;

function NavLinksPage({
  links,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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

export default NavLinksPage;
