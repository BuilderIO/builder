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
           * Note `canHaveChildren: true` and the defualt children in ./HeroWithChildren.builder.js
           */}
          {props.builderBlock?.children?.map(item => (
            <BuilderBlockComponent block={item} key={item.id} />
          ))}
        </div>
      </div>
      <Background className="custom-bg">
        {/* Builder optimized image with srcset, lazy, etc */}
        <Image image={image} />
      </Background>
    </Parallax>
  );
};
