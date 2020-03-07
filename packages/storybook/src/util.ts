export const transformConfigToProps = (config: { inputs: any[] }) => {
  return config.inputs.reduce(
    (acc, value) => ({
      ...acc,
      [value.name]: getPropValue(value),
    }),
    {}
  );
};

const getPropValue = (entry: any) => {
  if (entry.type === 'list') {
    return entry.subFields.map((config: any) => transformConfigToProps({ inputs: [config] }));
  }
  // TODO: handle children
  return entry.defaultValue;
};
