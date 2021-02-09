export const haveDependenciesChanged = (props: any) => {
  const { dependenciesKeyRef, newDependenciesKey } = props;

  if (dependenciesKeyRef.current !== newDependenciesKey) {
    return true;
  }

  return false;
};
