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
    const columns = getColumns();
    return columns[index]?.width || 100 / columns.length;
  }

  function getColumnCssWidth(index) {
    const columns = getColumns();
    const gutterSize = getGutterSize();
    const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
    return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
  }

  function getMaxWidthQuery() {
    if (props.stackColumnsAt === 'never') {
      return null;
    }

    const MAX_WIDTH_BREAKPOINTS = {
      tablet: 999,
      mobile: 639,
    };

    const getMaxWidthBreakpoint = (stackColumnsAt = 'tablet') => {
      switch (stackColumnsAt) {
        case 'tablet':
        case 'mobile':
          return MAX_WIDTH_BREAKPOINTS[stackColumnsAt];
      }
    };

    return `max-width: ${getMaxWidthBreakpoint(props.stackColumnsAt)}px`;
  }

  function getMediaQuery() {
    return `
@media (${getMaxWidthQuery()}) {
  .builder-columns {
    flex-direction: ${
      props.reverseColumnsWhenStacked ? 'column-reverse' : 'column'
    };
    align-items: stretch; 
  }

  .builder-column[style] {
    width: 100% !important;
    margin-left: 0 !important;
  }
}
`;
  }

  return (
    <View className="builder-columns" style={styles.view1}>
      <View>
        <Text>{getMediaQuery()}</Text>
      </View>

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
