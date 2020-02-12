import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    boxShadow: 'none',
  },
  root: {
    padding: '30px',
  },
  col: {
    minWidth: 500,
  },
  media: {
    height: 600,
  },
  sectionTitle: {
    textAlign: 'center',
    padding: '5px',
  },
});

export const DoubleColumns = props => {
  const { sectionTitle, image1, image2, text1, text2 } = props;
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Typography className={classes.sectionTitle} variant="h3" component="p">
        {sectionTitle}
      </Typography>
      <Grid container justify="center" spacing={3}>
        {[
          { img: image1, text: text1 },
          { img: image2, text: text2 },
        ].map((col, index) => (
          <Grid key={index} className={classes.col} item md={4}>
            <Card className={classes.card}>
              <CardMedia className={classes.media} image={col.img} title={col.text} />
              <CardContent>
                <Typography variant="h5" color="textSecondary" component="p">
                  {col.text}
                </Typography>
                <Button size="small" color="textSecondary">
                  Learn More >
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
