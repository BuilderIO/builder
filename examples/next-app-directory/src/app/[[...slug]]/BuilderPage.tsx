'use client';
import { API_KEY } from '../../builderConfig.js';
import { RenderContent, RenderContentProps } from '@builder.io/sdk-react';

interface BuilderPageProps {
  builderContent: RenderContentProps;
}

export default function BuilderPage({ builderContent }: BuilderPageProps) {
  return <RenderContent apiKey={API_KEY} model="page" content={builderContent} />;
}
