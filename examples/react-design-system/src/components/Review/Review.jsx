import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Rating from '@material-ui/lab/Rating';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 345,
    width: '100%',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
}));

export const Review = props => {
  const { backgroundColor, reviewAuthor, reviewText, image } = props;
  const classes = useStyles();
  return (
    <div className={classes.root} style={{ backgroundColor }}>
      <div>
        <Rating value={5} readOnly />
      </div>
      <Typography variant="h3" component="p">
        {reviewText}
      </Typography>
      <Typography variant="body2"> - {reviewAuthor}</Typography>
      <Avatar src={image} className={classes.avatar}>
        {reviewAuthor}
      </Avatar>
    </div>
  );
};
