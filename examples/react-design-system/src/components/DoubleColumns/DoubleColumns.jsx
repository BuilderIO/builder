import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
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
    minWidth: 400,
  },
  media: {
    height: 300,
  },
  sectionTitle: {
    textAlign: 'center',
    padding: '20px',
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
      <Grid container justify="center" spacing={2}>
        {[
          { img: image1, text: text1 },
          { img: image2, text: text2 },
        ].map((col, index) => (
          <Grid key={index} className={classes.col} item md={4}>
            <Card className={classes.card}>
              <CardMedia className={classes.media} image={col.img} title={col.text} />
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
