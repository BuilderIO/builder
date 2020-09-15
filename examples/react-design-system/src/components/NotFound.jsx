import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  notFound: {
    padding: '100px 20px',
    textAlign: 'center',
  },
  notFoundTitle: {
    fontWeight: 400,
  },
  notFoundSubTitle: {
    fontWeight: 100,
  },
}));

export const NotFound = () => {
  const classes = useStyles();
  return (
    <div className={classes.notFound}>
      <h3 className={classes.notFoundTitle}>No page found for this URL, did you publish it?</h3>
      {process.env.NODE_ENV === 'development' && (
        <h4 className={classes.notFoundSubTitle}>
          To edit this page in Builder.io, go to{' '}
          <a target="_blank" href="https://builder.io">
            builder.io
          </a>
          , create a new page, and enter <pre>{window.location.href}</pre> as the editing URL (at
          the top right of the preview)
        </h4>
      )}
    </div>
  );
};
