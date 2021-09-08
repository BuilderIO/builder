import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import { red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    width: 'calc(50vw - 3px)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'none'
  },
  '@media (min-width: 724px)': {
    root: {
      width: 'calc(33vw - 3px)'
    }
  },
  '@media (min-width: 1224px)': {
    root: {
      width: 'calc(25vw - 3px)'
    }
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
  const product = props;
  const classes = useStyles();

  const item = product?.items?.[0];
  const seller = item?.sellers?.[0];
  const price = seller?.commertialOffer?.Price;

  return (
    <Link style={{
      border: '0.5px solid #eaeef5',
    }} to={`/products/${props.productId}`}>
      <Card className={classes.root}>
        
        <CardMedia
          style={{ height: widthMap[props.sizeName] * 1.2 }}
          className={classes.media}
          image={item?.images[0].imageUrl}
          title={item.name}
        />
        <div>
          <div style={{
            textAlign: 'center',
            font: 'serif',
            color: '#444',
            fontWeight: 'bold',
          }}>
            {item.name}
          </div>
          <div style={{
            textAlign: 'center',
            font: 'serif',
            color: '#999',
            fontWeight: 100,
            marginTop: 30,
            marginBottom: 30,
          }}>
            ${price}.00
          </div>
        </div>
      </Card>
    </Link>
  );
};
