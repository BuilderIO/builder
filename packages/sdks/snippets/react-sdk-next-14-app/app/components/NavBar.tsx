import type { BuilderContent } from '@builder.io/sdk-react';

export function NavBar({ links }: { links: BuilderContent }) {
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
}
