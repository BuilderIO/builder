import { parse } from 'url';
import * as querystring from 'querystring';
import Link from 'next/link';
import { relative } from 'path';

export function renderLink(props: any) {
  if (typeof props.href !== 'string') {
    return <a {...props} />;
  }

  const parsed = parse(props.href);

  if (
    (parsed.hostname &&
      !(
        parsed.hostname.includes('builder.io') ||
        parsed.hostname.includes('localhost')
      )) ||
    parsed.hostname?.includes('forum.builder.io')
  ) {
    return <a {...props} />;
  }
  const relativePath = parsed.pathname || '';
  const useNextLink =
    relativePath.startsWith('/c/') ||
    relativePath === '/' ||
    relativePath.startsWith('/m/') ||
    relativePath.startsWith('/blog');
  const { children, ...rest } = props;
  const href = relativePath + (parsed.search || '');

  if (useNextLink) {
    return (
      <Link href={href}>
        <a {...rest}>{children}</a>
      </Link>
    );
  }

  return <a {...props} />;
}

export const RenderLink = renderLink;
