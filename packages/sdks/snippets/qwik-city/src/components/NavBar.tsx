import { component$ } from '@builder.io/qwik';
import type { BuilderContent } from '@builder.io/sdk-qwik';

export const NavBar = component$((props: { links: BuilderContent | null }) => {
  if (!props.links?.data?.links?.length) return null;

  return (
    <ul>
      {props.links.data.links.map(
        (link: { url: string; text: string }, index: number) => (
          <li key={index}>
            <a href={link.url}>{link.text}</a>
          </li>
        )
      )}
    </ul>
  );
});
