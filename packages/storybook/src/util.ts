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
  if (entry.type === 'list' && !entry.defaultValue) {
    return entry.subFields.map((config: any) => getDefaultProps({ inputs: [config] }));
  } else if (entry.type === 'list') {
    return entry.defaultValue.map((val: any, index: number) => ({ ...val, key: val.key || index }));
  }
  return entry.defaultValue;
  // TODO: handle children
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

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const builderBlockFromConfig = (storyConfig: any) => {
  const options = getDefaultProps(storyConfig);
  return {
    data: {
      blocks: [
        {
          id: `builder-${uuidv4()}`,
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
