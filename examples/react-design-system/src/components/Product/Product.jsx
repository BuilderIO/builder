import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: '100%',
    margin: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
  media: {
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    flexGrow: 1,
  },
  title: {
    overflow: 'hidden',
    textOverflow: 'hidden',
  },
}));

const widthMap = {
  Small: 200,
  Medium: 260,
  Large: 400,
};

export const Product = props => {
  const { brandedName, priceLabel, description, image } = props;
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Link to={`/products/${props.id}`}>
      <Card className={classes.root} style={{ width: widthMap[props.sizeName] }}>
        <CardHeader
          title={
            <Typography
              style={{ fontSize: widthMap[props.sizeName] / 15 }}
              className={classes.title}
            >
              {brandedName}
            </Typography>
          }
          subheader={priceLabel}
        />
        <CardMedia
          style={{ height: widthMap[props.sizeName] * 1.2 }}
          className={classes.media}
          image={image.sizes.Best.url}
          title={brandedName}
        />
        <CardActions disableSpacing>
          <IconButton aria-label="add to favorites">
            <FavoriteIcon />
          </IconButton>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>{description}</Typography>
          </CardContent>
        </Collapse>
      </Card>
    </Link>
  );
};
