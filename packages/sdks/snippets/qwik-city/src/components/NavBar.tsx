import { component$ } from '@builder.io/qwik';
import type { BuilderContent } from '@builder.io/sdk-qwik';

export const NavBar = component$(({ links }: { links: BuilderContent }) => {
  return (
    <ul>
      {links.data?.links.map(
        (link: { url: string; text: string }, index: number) => (
          <li key={index}>
            <a href={link.url}>{link.text}</a>
          </li>
        )
      )}
    </ul>
  );
});
