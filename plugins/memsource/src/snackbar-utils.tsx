/** @jsx jsx */
import { jsx } from '@emotion/core';
import appState from '@builder.io/app-context';
import { Button } from '@material-ui/core';

export function showProjectNotification(jobId: string) {
  appState.snackBar.show(
    <div css={{ display: 'flex', alignItems: 'center' }}>Done!</div>,
    2000,
    <Button
      color="primary"
      css={{
        pointerEvents: 'auto',
        ...(appState.document.small && {
          width: 'calc(100vw - 90px)',
          marginRight: 45,
          marginTop: 10,
          marginBottom: 10,
        }),
      }}
      variant="contained"
      onClick={async () => {
        // todo navigate to memsource dashboard
      }}
    >
      Go to Project details
    </Button>
  );
}
