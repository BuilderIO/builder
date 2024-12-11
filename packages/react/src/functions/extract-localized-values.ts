import traverse from 'traverse';

const isLocalizedField = (value: any) => {
  return value && typeof value === 'object' && value['@type'] === '@builder.io/core:LocalizedValue';
};

export const containsLocalizedValues = (data: Record<string, any>) => {
  if (!data || !Object.getOwnPropertyNames(data).length) {
    return false;
  }
  let hasLocalizedValues = false;
  traverse(data).forEach(function (value) {
    if (isLocalizedField(value)) {
      hasLocalizedValues = true;
      this.stop();
    }
  });
  return hasLocalizedValues;
};

export const extractLocalizedValues = (data: Record<string, any>, locale: string) => {
  if (!data || !Object.getOwnPropertyNames(data).length) {
    return {};
  }

  return traverse(data).map(function (value) {
    if (isLocalizedField(value)) {
      this.update(value[locale] ?? undefined);
    }
  });
};
