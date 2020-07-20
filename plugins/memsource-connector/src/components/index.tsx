import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { LocalisationDialog } from './LocalisationDialog';
import AlertDialog from './AlertDialog';
import { useLocaleDialogStageReducer } from './reducers';

export default () => {
  const [open, setOpen] = useState(false);

  const { localeDialogStage, dispatch } = useLocaleDialogStageReducer();
  const onResultCallback = (nextStage: 'failure' | 'success', msg: string) => {
    setOpen(false);
    dispatch({ nextStage, message: msg });
  };
  return (
    <>
      <Button
        data-testid="button-localise"
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
      >
        Localize
      </Button>
      {localeDialogStage.onDisplay && open && (
        <LocalisationDialog setOpen={setOpen} onResult={onResultCallback} />
      )}
      {localeDialogStage.onResult && (
        <AlertDialog
          message={localeDialogStage.message}
          severity={localeDialogStage.severity}
          setOpen={() => dispatch({ nextStage: 'display', message: '' })}
        />
      )}
    </>
  );
};
