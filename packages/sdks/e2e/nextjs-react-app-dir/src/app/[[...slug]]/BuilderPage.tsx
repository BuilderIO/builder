'use client';
import { RenderContent } from '@builder.io/sdk-react';

interface BuilderPageProps {
  builderProps: any;
}

export default function BuilderPage({ builderProps }: BuilderPageProps) {
  return <RenderContent {...builderProps} />;
}
