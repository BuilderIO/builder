import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import RenderBlocks from '../components/render-blocks.lite';

export default function Columns(props) {
  function getGutterSize() {
    return typeof props.space === 'number' ? props.space || 0 : 20;
  }

  function getColumns() {
    return props.columns || [];
  }

  function getWidth(index) {
    const columns = this.getColumns();
    return (columns[index] && columns[index].width) || 100 / columns.length;
  }

  function getColumnCssWidth(index) {
    const columns = this.getColumns();
    const gutterSize = this.getGutterSize();
    const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
    return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
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
  view1: { display: 'flex', alignItems: 'stretch' },
  view2: { flexGrow: 1 },
});
