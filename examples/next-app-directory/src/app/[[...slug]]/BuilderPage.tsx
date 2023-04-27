'use client';
import { API_KEY } from '../../builderConfig';
import { RenderContent } from '@builder.io/sdk-react';
import { ComponentProps } from 'react';

interface BuilderPageProps {
  builderContent: ComponentProps<typeof RenderContent>;
}

export default function BuilderPage({ builderContent }: BuilderPageProps) {
  return <RenderContent apiKey={API_KEY} model="page" content={builderContent} />;
}
