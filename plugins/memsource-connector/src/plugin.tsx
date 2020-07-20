import React from 'react';
import { Builder } from '@builder.io/sdk';
import { BuilderProvider } from './components/contexts/builderContext';
import MemsourceDialog from './components';
import ClientSide from './components/clientSide';

export const MemsourceConnector = (props: any) => {
  return (
    <ClientSide>
      <BuilderProvider {...props}>
        <MemsourceDialog />
      </BuilderProvider>
    </ClientSide>
  );
};

Builder.registerEditor({
  name: 'memsource-connector',
  component: MemsourceConnector
});
