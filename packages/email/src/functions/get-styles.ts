export function getStyles(block: any) {
  // TODO: responsive
  const styles = block && block.responsiveStyles && block.responsiveStyles.large;
  return styles;
}
