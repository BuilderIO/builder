import type { BuilderContent } from '@builder.io/sdk-react';
import React from 'react';

export function NavBar({ links }: { links: BuilderContent | null }) {
  if (!links?.data?.links) return null;
  return (
    <ul>
      {links.data.links.map(
        (link: { url: string; text: string }, index: number) => (
          <li key={index}>
            <a href={link.url}>{link.text}</a>
          </li>
        )
      )}
    </ul>
  );
}
