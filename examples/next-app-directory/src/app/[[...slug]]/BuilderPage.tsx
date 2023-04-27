'use client';

import { RenderContent } from '@builder.io/sdk-react';
import { API_KEY } from '../../builderConfig.js';

interface BuilderPageProps {
  builderContent: any;
}

export default function BuilderPage({ builderContent }: BuilderPageProps) {
  return <RenderContent apiKey={API_KEY} model="page" content={builderContent} />;
}
