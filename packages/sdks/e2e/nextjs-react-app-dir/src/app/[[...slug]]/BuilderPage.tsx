'use client';
import { RenderContent } from '@builder.io/sdk-react';
import type { ComponentProps } from 'react';

interface BuilderPageProps {
  builderProps: ComponentProps<typeof RenderContent>;
}

export default function BuilderPage({ builderProps }: BuilderPageProps) {
  return <RenderContent {...builderProps} />;
}
