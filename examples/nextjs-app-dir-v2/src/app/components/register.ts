'use client';
import dynamic from 'next/dynamic';
import { type RegisteredComponent } from '@builder.io/sdk-react';

// With @builder.io/sdk-react, registered components must be client components
// (React Server Components aren't supported as custom components). They are still
// server-rendered to HTML and then hydrated. This file is marked 'use client' so
// the server page (`[[...slug]]/page.tsx`) can pass the component functions into <Content />.
export const customComponents: RegisteredComponent[] = [
  {
    component: dynamic(() => import('./MyFunComponent')),
    name: 'MyFunComponent',
    inputs: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'Hello world',
      },
    ],
  },
];
