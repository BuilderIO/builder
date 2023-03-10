'use client';
import { BuilderComponent, builder } from '@builder.io/react';
import builderConfig from '../../../builderConfig.json';

builder.init(builderConfig.apiKey);

export default function ClientComponent({ children, builderContent }: any) {
  return (
    <>
      {children}
      <br />
      <p>This section is rendered client side</p>
      <BuilderComponent model="page" content={builderContent} />
    </>
  );
}
