export function canDisableClear(props: any): boolean {
  const { disableClear } = props?.field?.options || ({} as any);
  return !!disableClear;
}
