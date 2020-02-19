import React from 'react';
import { Parallax } from 'react-parallax';
import { BuilderBlockComponent } from '@builder.io/react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  container: {
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  wrapper: {
    margin: 'auto 0',
  },
}));

export const HeroWithEditableChildren = props => {
  const { image, strength, height } = props;

  const classes = useStyles();

  return (
    <Parallax blur={{ min: -20, max: 20 }} bgImage={image} strength={strength}>
      <div style={{ minHeight: height }} className={classes.container}>
        <div className={classes.wrapper}>
          {/*
           * Render dynamic children.
           * Note `canHaveChildren: true` and the defualt children in ./HeroWithChildren.builder.js
           */}
          {props.builderBlock?.children?.map(item => (
            <BuilderBlockComponent block={item} key={item.id} />
          ))}
        </div>
      </div>
    </Parallax>
  );
};
