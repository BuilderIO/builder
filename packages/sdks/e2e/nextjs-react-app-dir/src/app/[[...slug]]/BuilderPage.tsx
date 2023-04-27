use client';
import type { RenderContentProps } from '@builder.io/sdk-react';
import { RenderContent } from '@builder.io/sdk-react';

interface BuilderPageProps {
  builderProps: RenderContentProps;
}

export default function BuilderPage({ builderProps }: BuilderPageProps) {
  return <RenderContent {...builderProps} />;
}
