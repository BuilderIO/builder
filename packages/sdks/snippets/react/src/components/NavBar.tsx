import { type BuilderContent } from '@builder.io/sdk-react';

type Link = { url: string; text: string };

export default function NavBar({ links }: { links: BuilderContent }) {
  return (
    <nav>
      <ul>
        {links.data?.links.map(({ url, text }: Link, index: number) => (
          <li key={index}>
            <a href={url}>{text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
