'use client';
import { builder } from '@builder.io/sdk';
import { BuilderComponent } from '@builder.io/react';
import DefaultErrorPage from 'next/error';
import { getAPIKey } from '@sdk/tests';
import { useEffect } from 'react';

import '@builder.io/widgets/dist/lib/builder-widgets-async';
import { usePathname } from 'next/navigation';

builder.init(getAPIKey());

if (typeof window !== 'undefined') {
  if (
    window.location.pathname.includes('can-track-false') ||
    window.location.pathname.includes('symbol-tracking')
  ) {
    builder.canTrack = false;
  }
}

type BuilderPageProps = any;

export function RenderBuilderContent(props: BuilderPageProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.includes('get-query')) {
      builder
        .get('', {
          ...props,
          ...props['options'],
        })
        .promise()
        .then();
    } else if (pathname.includes('get-content')) {
      builder.apiEndpoint = props.apiEndpoint;
      delete props.apiEndpoint;
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
