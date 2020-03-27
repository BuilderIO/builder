/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { Builder } from '@builder.io/react';
import { useLocalStore, useObserver } from 'mobx-react';
import { Button } from '@material-ui/core';

export const GraphiqlExplorer = () => {
  return (
    <div
      css={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      <div css={{ display: 'flex', padding: 50 }}>
        <Button
          css={{ margin: 'auto' }}
          target="_blank"
          size="large"
          href="/graphql-explorer"
          color="primary"
          variant="contained"
        >
          Go to the GraphQL explorer
        </Button>
      </div>
    </div>
  );
};

Builder.registerComponent(GraphiqlExplorer, {
  name: 'GraphiqlExplorer',
});
