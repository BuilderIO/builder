export const getDependenciesKeyFrom = (props: any) => {
  const { dependencyComponentVariables } = props?.field?.options || ({} as any);
  const dynamicDependencies: string[] = [];
  if (dependencyComponentVariables && dependencyComponentVariables.length) {
    dependencyComponentVariables.forEach((key: string) => {
      if (props.object.get(key) != null) {
        dynamicDependencies.push(props.object.get(key));
      }
    });

    return dynamicDependencies.join('-');
  }

  return '';
};
