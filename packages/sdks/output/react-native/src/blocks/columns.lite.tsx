import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import RenderBlocks from '../components/render-blocks.lite';

export default function Columns(props) {
  function gutterSize() {
    return typeof props.space === 'number' ? props.space || 0 : 20;
  }

  function getColumns() {
    return props.columns || [];
  }

  function getWidth(index) {
    const columns = this.getColumns();
    return columns[index]?.width || 100 / columns.length;
  }

  function getColumnCssWidth(index) {
    const columns = this.getColumns();
    const gutterSize = this.gutterSize;
    const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
    return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
  }

  function maybeApplyForTablet(prop) {
    const stackColumnsAt = props.stackColumnsAt || 'tablet';
    return stackColumnsAt === 'tablet' ? prop : 'inherit';
  }

  function columnsCssVars() {
    const flexDir =
      props.stackColumnsAt === 'never'
        ? 'inherit'
        : props.reverseColumnsWhenStacked
        ? 'column-reverse'
        : 'column';
    return {
      '--flex-dir': flexDir,
      '--flex-dir-tablet': this.maybeApplyForTablet(flexDir),
    };
  }

  function columnCssVars() {
    const width = '100%';
    const marginLeft = '0';
    return {
      '--column-width': width,
      '--column-margin-left': marginLeft,
      '--column-width-tablet': this.maybeApplyForTablet(width),
      '--column-margin-left-tablet': this.maybeApplyForTablet(marginLeft),
    };
  }

  return (
    <View className="builder-columns" style={styles.view1}>
      {props.columns?.map((column) => (
        <View className="builder-column" style={styles.view2}>
          <RenderBlocks blocks={column.blocks} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  view1: {
    display: 'flex',
    alignItems: 'stretch',
    '@media (max-width: 999px)': { flexDirection: 'var(--flex-dir-tablet)' },
    '@media (max-width: 639px)': { flexDirection: 'var(--flex-dir)' },
  },
  view2: {
    flexGrow: 1,
    '@media (max-width: 999px)': {
      width: 'var(--column-width-tablet) !important',
      marginLeft: 'var(--column-margin-left-tablet) !important',
    },
    '@media (max-width: 639px)': {
      width: 'var(--column-width) !important',
      marginLeft: 'var(--column-margin-left) !important',
    },
  },
});
