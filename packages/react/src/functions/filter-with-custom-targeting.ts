type UserAttributes = {
  date?: string | Date;
  urlPath?: string;
  [key: string]: any; // Allow any other properties
};

// Query type
type QueryOperator =
  | 'is'
  | 'isNot'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqualTo'
  | 'lessThanOrEqualTo';

type QueryValue = string | number | boolean | Array<string | number | boolean>;

export type Query = {
  property: string;
  operator: QueryOperator;
  value: QueryValue;
};

export function filterWithCustomTargeting(
  userAttributes: UserAttributes,
  query: Query[],
  startDate?: string,
  endDate?: string
) {
  const item = {
    query,
    startDate,
    endDate,
  };

  const now = (userAttributes.date && new Date(userAttributes.date)) || new Date();

  if (item.startDate && new Date(item.startDate) > now) {
    return false;
  } else if (item.endDate && new Date(item.endDate) < now) {
    return false;
  }

  if (!item.query || !item.query.length) {
    return true;
  }

  return item.query.every((filter: Query) => {
    return objectMatchesQuery(userAttributes, filter);
  });
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isNumber(val: unknown): val is number {
  return typeof val === 'number';
}

function objectMatchesQuery(userattr: UserAttributes, query: Query): boolean {
  const result = (() => {
    const property = query.property;
    const operator = query.operator;
    let testValue = query.value;

    if (
      query &&
      query.property === 'urlPath' &&
      query.value &&
      typeof query.value === 'string' &&
      query.value !== '/' &&
      query.value.endsWith('/')
    ) {
      testValue = query.value.slice(0, -1);
    }

    // Check is query property is present in userAttributes. Proceed only if it is present.
    if (!(property && operator)) {
      return true;
    }

    if (Array.isArray(testValue)) {
      if (operator === 'isNot') {
        return testValue.every(val =>
          objectMatchesQuery(userattr, { property, operator, value: val })
        );
      }
      return !!testValue.find(val =>
        objectMatchesQuery(userattr, { property, operator, value: val })
      );
    }
    const value = userattr[property];

    if (Array.isArray(value)) {
      return value.includes(testValue);
    }

    switch (operator) {
      case 'is':
        return value === testValue;
      case 'isNot':
        return value !== testValue;
      case 'contains':
        return (isString(value) || Array.isArray(value)) && value.includes(String(testValue));
      case 'startsWith':
        return isString(value) && value.startsWith(String(testValue));
      case 'endsWith':
        return isString(value) && value.endsWith(String(testValue));
      case 'greaterThan':
        return isNumber(value) && isNumber(testValue) && value > testValue;
      case 'lessThan':
        return isNumber(value) && isNumber(testValue) && value < testValue;
      case 'greaterThanOrEqualTo':
        return isNumber(value) && isNumber(testValue) && value >= testValue;
      case 'lessThanOrEqualTo':
        return isNumber(value) && isNumber(testValue) && value <= testValue;
    }
    return false;
  })();

  return result;
}
