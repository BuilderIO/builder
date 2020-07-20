import React from 'react';
import { Parallax, Background } from 'react-parallax';
import { BuilderBlockComponent, Image } from '@builder.io/react';
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

/**
 * Hero component with dynamic children
 *
 * See ./HeroWithChildren.builder.js for how to use, namely you will need to use
 *
 *    withChildren(HeroWithEditableChildren)
 *
 * to forward the Builder.io children to the component
 *
 * Also, it is generally best to supply default children for easy editing (aka when
 * this component is added in the Builder.io editor, have some example children that can be
 * added by default). See `canHaveChildren` in ./HeroWithChildren.builder.js for an
 * example of this
 */
export const HeroWithEditableChildren = props => {
  const { image, parallaxStrength, height } = props;

  const classes = useStyles();

  return (
    <Parallax blur={{ min: -20, max: 20 }} strength={parallaxStrength}>
      <div style={{ minHeight: height }} className={classes.container}>
        <div className={classes.wrapper}>
          {/*
           * Render dynamic children.
           * Note: you must use `withChildren()` HOC to support children, see
           * ./HeroWithChildren.builder.js for this
           */}
          {props.children}
        </div>
      </div>
      <Background className="custom-bg">
        {/* Builder optimized image with srcset, lazy, etc */}
        <Image image={image} />
      </Background>
    </Parallax>
  );
};
