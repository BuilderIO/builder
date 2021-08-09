import React, { AnchorHTMLAttributes } from 'react';
import { theme } from '../constants/theme';
import { RenderLink } from '../functions/render-link';

export function TextLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <RenderLink
      rel="noreferrer"
      css={{ color: theme.colors.primary, cursor: 'pointer' }}
      {...props}
    />
  );
}
