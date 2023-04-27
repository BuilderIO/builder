'use client';
import { RenderContent } from '@builder.io/sdk-react';
import { BuilderContent } from '@builder.io/sdk';
import builderConfig from '../../../builderConfig.json';

interface BuilderPageProps {
  builderContent: BuilderContent;
}

export default function BuilderPage({ builderContent }: BuilderPageProps) {
  return <RenderContent apiKey={builderConfig.apiKey} model="page" content={builderContent} />;
}
