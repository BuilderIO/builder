import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Image } from '@builder.io/react';

const useStyles = makeStyles({
  card: {
    boxShadow: 'none',
  },
  root: {
    padding: '30px',
  },
  col: {
    minWidth: 300,
  },
  media: {
    height: 300,
  },
  imageContainer: {
    position: 'relative',
  },
});

export const DynamicColumns = props => {
  const { columns } = props;
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Grid container justify="center" spacing={2}>
        {columns.slice(0, 4).map((col, index) => (
          <Grid key={index} className={classes.col} item md={12 / columns.length}>
            <Card className={classes.card}>
              {/* Builder optimized image with srcset, picture tags, etc */}
              <div className={classes.imageContainer}>
                <Image lazy aspectRatio={1} className={classes.media} image={col.image} />
              </div>
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  {col.text}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
