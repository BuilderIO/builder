import { traverse } from './traverse';

const isLocalizedField = (value: any) => {
  return value && typeof value === 'object' && value['@type'] === '@builder.io/core:LocalizedValue';
};

export const containsLocalizedValues = (data: Record<string, any>) => {
  if (!data || !Object.getOwnPropertyNames(data).length) {
    return false;
  }
  let hasLocalizedValues = false;
  traverse(data, value => {
    if (isLocalizedField(value)) {
      hasLocalizedValues = true;
      return;
    }
  });
  return hasLocalizedValues;
};

export const extractLocalizedValues = (data: Record<string, any>, locale: string) => {
  if (!data || !Object.getOwnPropertyNames(data).length) {
    return {};
  }

  traverse(data, (value, update) => {
    if (isLocalizedField(value)) {
      update(value[locale] ?? undefined);
    }
  });

  return data;
};
