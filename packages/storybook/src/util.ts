export const getDefaultProps = (config: { inputs: any[] }) => {
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
    return entry.subFields.map((config: any) => getDefaultProps({ inputs: [config] }));
  }
  // TODO: handle children
  return entry.defaultValue;
};

const responsiveStyles = {
  large: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    position: 'relative',
    flexShrink: '0',
    boxSizing: 'border-box',
    marginTop: '0px',
  },
};

export const builderBlockFromConfig = (storyConfig: any) => {
  const options = getDefaultProps(storyConfig);
  return {
    data: {
      blocks: [
        {
          id: 'builder-id',
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          component: {
            ...storyConfig,
            options,
          },
          responsiveStyles,
        },
      ],
    },
  };
};
