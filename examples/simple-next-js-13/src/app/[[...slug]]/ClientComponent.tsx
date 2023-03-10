'use client';
import { BuilderComponent, builder } from '@builder.io/react';
import { BuilderContent } from '@builder.io/sdk';
import builderConfig from '../../../builderConfig.json';

builder.init(builderConfig.apiKey);

interface BuilderPageProps {
  builderContent: BuilderContent;
}

export default function BuilderPage({ builderContent }: BuilderPageProps) {
  return <BuilderComponent model="page" content={builderContent} />;
}
