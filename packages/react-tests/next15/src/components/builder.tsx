'use client';
import { builder } from '@builder.io/sdk';
import { BuilderComponent } from '@builder.io/react';
import DefaultErrorPage from 'next/error';
import { getAPIKey } from '@sdk/tests';
import { ComponentProps, useEffect } from 'react';

import '@builder.io/widgets/dist/lib/builder-widgets-async';
import { usePathname } from 'next/navigation';

builder.init(getAPIKey());

type BuilderPageProps = ComponentProps<typeof BuilderComponent>;

export function RenderBuilderContent(props: BuilderPageProps) {
  const pathname = usePathname();
  useEffect(() => {
    // only enable tracking if we're not in the `/can-track-false` and `symbol-tracking` test route
    if (!pathname.includes('can-track-false') && !pathname.includes('symbol-tracking')) {
      builder.canTrack = true;
    }
    if (pathname.includes('get-query') || pathname.includes('get-content')) {
      builder
        .get('', {
          ...props,
          ...props['options'],
        })
        .promise()
        .then();
    } else if (pathname.includes('with-fetch-options')) {
      builder
        .get('', {
          ...props,
          fetchOptions: {
            method: 'POST',
            body: JSON.stringify({
              test: 'test',
            }),
          },
        })
        .promise()
        .then();
    }
  }, []);
  return props.content ? <BuilderComponent {...props} /> : <DefaultErrorPage statusCode={404} />;
}
