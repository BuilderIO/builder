import {
  filterWithCustomTargeting,
  type Query,
  type UserAttributes,
} from './helpers.js';

describe('filterWithCustomTargeting', () => {
  test('should return true when there is no query', () => {
    const userAttributes: UserAttributes = {};
    const result = filterWithCustomTargeting(userAttributes, []);
    expect(result).toBe(true);
  });

  test('should return false if startDate is in the future', () => {
    const userAttributes: UserAttributes = {
      date: '2025-01-01T00:00:00Z',
    };
    // startDate is after userAttributes.date
    const startDate = '2026-01-01T00:00:00Z';
    const result = filterWithCustomTargeting(userAttributes, [], startDate);
    expect(result).toBe(false);
  });

  test('should return false if endDate is in the past', () => {
    const userAttributes: UserAttributes = {
      date: '2025-01-01T00:00:00Z',
    };
    // endDate is before userAttributes.date
    const endDate = '2024-01-01T00:00:00Z';
    const result = filterWithCustomTargeting(
      userAttributes,
      [],
      undefined,
      endDate
    );
    expect(result).toBe(false);
  });

  test('should return true if no query is provided (even if dates are valid)', () => {
    const userAttributes: UserAttributes = {
      date: '2025-01-01T00:00:00Z',
    };
    const startDate = '2024-01-01T00:00:00Z'; // Past relative to user date
    const endDate = '2026-01-01T00:00:00Z'; // Future relative to user date
    const result = filterWithCustomTargeting(
      userAttributes,
      [],
      startDate,
      endDate
    );
    expect(result).toBe(true);
  });

  test('should handle single query with operator "is"', () => {
    const userAttributes: UserAttributes = {
      role: 'admin',
      date: '2025-01-01T00:00:00Z',
    };
    const queries: Query[] = [
      { property: 'role', operator: 'is', value: 'admin' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should handle single query with operator "isNot"', () => {
    const userAttributes: UserAttributes = {
      role: 'user',
      date: '2025-01-01T00:00:00Z',
    };
    const queries: Query[] = [
      { property: 'role', operator: 'isNot', value: 'admin' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should return false if "isNot" operator matches the same value', () => {
    const userAttributes: UserAttributes = {
      role: 'admin',
    };
    const queries: Query[] = [
      { property: 'role', operator: 'isNot', value: 'admin' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(false);
  });

  test('should handle operator "contains" for strings', () => {
    const userAttributes: UserAttributes = {
      description: 'Senior Admin',
    };
    const queries: Query[] = [
      { property: 'description', operator: 'contains', value: 'Admin' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should handle operator "contains" for arrays', () => {
    const userAttributes: UserAttributes = {
      tags: ['news', 'sports', 'tech'],
    };
    const queries: Query[] = [
      { property: 'tags', operator: 'contains', value: 'sports' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should return false for "contains" if the item is not found in the array', () => {
    const userAttributes: UserAttributes = {
      tags: ['news', 'sports', 'tech'],
    };
    const queries: Query[] = [
      { property: 'tags', operator: 'contains', value: 'politics' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(false);
  });

  test('should handle operator "startsWith"', () => {
    const userAttributes: UserAttributes = {
      role: 'administrator',
    };
    const queries: Query[] = [
      { property: 'role', operator: 'startsWith', value: 'admin' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should handle operator "endsWith"', () => {
    const userAttributes: UserAttributes = {
      role: 'administrator',
    };
    const queries: Query[] = [
      { property: 'role', operator: 'endsWith', value: 'ator' },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should handle operator "greaterThan"', () => {
    const userAttributes: UserAttributes = {
      age: 30,
    };
    const queries: Query[] = [
      { property: 'age', operator: 'greaterThan', value: 25 },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should return false if operator "greaterThan" does not match', () => {
    const userAttributes: UserAttributes = {
      age: 20,
    };
    const queries: Query[] = [
      { property: 'age', operator: 'greaterThan', value: 25 },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(false);
  });

  test('should handle operator "lessThan"', () => {
    const userAttributes: UserAttributes = {
      age: 20,
    };
    const queries: Query[] = [
      { property: 'age', operator: 'lessThan', value: 25 },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should handle "greaterThanOrEqualTo"', () => {
    const userAttributes: UserAttributes = {
      age: 25,
    };
    const queries: Query[] = [
      { property: 'age', operator: 'greaterThanOrEqualTo', value: 25 },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should handle "lessThanOrEqualTo"', () => {
    const userAttributes: UserAttributes = {
      age: 25,
    };
    const queries: Query[] = [
      { property: 'age', operator: 'lessThanOrEqualTo', value: 25 },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true);
  });

  test('should handle array value in query with operator "is" (OR logic)', () => {
    const userAttributes: UserAttributes = {
      country: 'Canada',
    };
    const queries: Query[] = [
      { property: 'country', operator: 'is', value: ['USA', 'Canada'] },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true); // Because Canada is in the array
  });

  test('should handle array value in query with operator "isNot" (AND logic)', () => {
    const userAttributes: UserAttributes = {
      country: 'USA',
    };
    const queries: Query[] = [
      { property: 'country', operator: 'isNot', value: ['Canada', 'Germany'] },
    ];
    const result = filterWithCustomTargeting(userAttributes, queries);
    expect(result).toBe(true); // userAttributes.country = 'USA' not in any of the array items
  });

  test('should return false if any single "isNot" item matches user attribute', () => {
    const userAttributes: UserAttributes = {
      country: 'USA',
    };
    const queries: Query[] = [
      { property: 'country', operator: 'isNot', value: ['USA', 'Germany'] },
    ];
    // Because 'USA' is in the array, the logic (AND) means it fails
    expect(filterWithCustomTargeting(userAttributes, queries)).toBe(false);
  });

  test('should ignore trailing slash for "urlPath" except if value is just "/"', () => {
    const userAttributes: UserAttributes = {
      urlPath: '/about',
    };

    const queries1: Query[] = [
      { property: 'urlPath', operator: 'is', value: '/about/' },
    ];
    // The function removes the trailing slash from '/about/' => '/about'
    expect(filterWithCustomTargeting(userAttributes, queries1)).toBe(true);

    // If the value is just '/', do not remove slash
    const queries2: Query[] = [
      { property: 'urlPath', operator: 'is', value: '/' },
    ];
    expect(filterWithCustomTargeting(userAttributes, queries2)).toBe(false);
  });

  test('should handle multiple queries with AND logic (every must be true)', () => {
    const userAttributes: UserAttributes = {
      role: 'admin',
      country: 'USA',
    };
    const queries: Query[] = [
      { property: 'role', operator: 'is', value: 'admin' },
      { property: 'country', operator: 'is', value: 'USA' },
    ];
    expect(filterWithCustomTargeting(userAttributes, queries)).toBe(true);
  });

  test('should return false if any one of multiple queries fails', () => {
    const userAttributes: UserAttributes = {
      role: 'admin',
      country: 'USA',
    };
    const queries: Query[] = [
      { property: 'role', operator: 'is', value: 'admin' },
      { property: 'country', operator: 'is', value: 'Canada' },
    ];
    expect(filterWithCustomTargeting(userAttributes, queries)).toBe(false);
  });

  test('should return true if property or operator is missing (as function returns true by default)', () => {
    const userAttributes: UserAttributes = {
      role: 'admin',
    };
    // Missing operator -> should default to true
    const queries: Query[] = [
      { property: 'role', operator: '', value: 'admin' } as any,
    ];
    expect(filterWithCustomTargeting(userAttributes, queries)).toBe(true);

    // Missing property -> should default to true
    const queries2: Query[] = [
      { property: '', operator: 'is', value: 'admin' } as any,
    ];
    expect(filterWithCustomTargeting(userAttributes, queries2)).toBe(true);
  });
});
