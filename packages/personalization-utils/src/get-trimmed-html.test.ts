import { trimHtml } from './utils'; // Update this import to match your file structure

describe('trimHtml', () => {
  const baseHtml = `
    <div class="builder-personalization-container" style="display: block;">
      <template data-variant-id="builder-123-0">
        <div>Variant 1 Content</div>
      </template>
      <template data-variant-id="builder-123-1">
        <div>Variant 2 Content</div>
      </template>
      <script id="variants-script-builder-123">
        (function() {
          var variants = [
            {"query":[{"property":"itemInCart","operator":"is","value":"item1"}]},
            {"query":[{"property":"itemInCart","operator":"is","value":"item2"}]}
          ];
          // ... rest of the script ...
        })();
      </script>
      <div>Default Content</div>
    </div>
  `;

  it('should return winning variant content when a variant matches', () => {
    const userAttributes = { itemInCart: 'item1' };
    const result = trimHtml(baseHtml, userAttributes);
    expect(result).toContain(
      '<div class="builder-personalization-container" style="display: block;">'
    );
    expect(result).toContain('<div>Variant 1 Content</div>');
    expect(result).not.toContain('<template');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('Default Content');
  });

  it('should return default content when no variant matches', () => {
    const userAttributes = { itemInCart: 'item3' };
    const result = trimHtml(baseHtml, userAttributes);
    expect(result).toContain(
      '<div class="builder-personalization-container" style="display: block;">'
    );
    expect(result).toContain('<div>Default Content</div>');
    expect(result).not.toContain('<template');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('Variant 1 Content');
    expect(result).not.toContain('Variant 2 Content');
  });

  it('should handle multiple personalization containers', () => {
    const multipleContainersHtml = `
      ${baseHtml}
      <div class="other-content">Some other content</div>
      ${baseHtml.replace('builder-123', 'builder-456')}
    `;
    const userAttributes = { itemInCart: 'item2' };
    const result = trimHtml(multipleContainersHtml, userAttributes);
    const occurrences = (result.match(/Variant 2 Content/g) || []).length;
    expect(occurrences).toBe(2);
    expect(result).toContain('<div class="other-content">Some other content</div>');
    expect(result).not.toContain('Default Content');
  });

  it('should preserve additional attributes on the container div', () => {
    const htmlWithExtraAttributes = baseHtml.replace(
      'class="builder-personalization-container"',
      'class="builder-personalization-container extra-class" data-test="value"'
    );
    const userAttributes = { itemInCart: 'item1' };
    const result = trimHtml(htmlWithExtraAttributes, userAttributes);
    expect(result).toContain('class="builder-personalization-container extra-class"');
    expect(result).toContain('data-test="value"');
  });

  it('should not modify content when no personalization container is present', () => {
    const htmlWithoutContainer = '<div>Regular content</div>';
    const userAttributes = { itemInCart: 'item1' };
    const result = trimHtml(htmlWithoutContainer, userAttributes);
    expect(result).toBe(htmlWithoutContainer);
  });

  it('should handle empty variants array', () => {
    const htmlWithEmptyVariants = baseHtml.replace(
      `var variants = [
            {"query":[{"property":"itemInCart","operator":"is","value":"item1"}]},
            {"query":[{"property":"itemInCart","operator":"is","value":"item2"}]}
          ];
`,
      'var variants = [];'
    );
    const userAttributes = { itemInCart: 'item1' };
    const result = trimHtml(htmlWithEmptyVariants, userAttributes);
    expect(result).toContain('<div>Default Content</div>');
  });

  it('should handle malformed JSON in variants', () => {
    const htmlWithMalformedJson = baseHtml.replace('"query":[{', '"query":[{malformed');
    const userAttributes = { itemInCart: 'item1' };
    const result = trimHtml(htmlWithMalformedJson, userAttributes);
    expect(result).toContain('<div>Default Content</div>');
  });

  const baseHtmlWithDates = `
  <div class="builder-personalization-container" style="display: block;">
    <template data-variant-id="builder-123-0">
      <div>Current Variant</div>
    </template>
    <template data-variant-id="builder-123-1">
      <div>Future Variant</div>
    </template>
    <template data-variant-id="builder-123-2">
      <div>Past Variant</div>
    </template>
    <script id="variants-script-builder-123">
      (function() {
        var variants = [
          {"query":[],"startDate":"2023-01-01T00:00:00Z","endDate":"2025-12-31T23:59:59Z"},
          {"query":[],"startDate":"2026-01-01T00:00:00Z","endDate":"2027-12-31T23:59:59Z"},
          {"query":[],"startDate":"2020-01-01T00:00:00Z","endDate":"2022-12-31T23:59:59Z"}
        ];
        // ... rest of the script ...
      })();
    </script>
    <div>Default Content</div>
  </div>
`;

  it('should return the current variant when within date range', () => {
    const userAttributes = { date: '2024-06-15T12:00:00Z' };
    const result = trimHtml(baseHtmlWithDates, userAttributes);
    expect(result).toContain('<div>Current Variant</div>');
    expect(result).not.toContain('Future Variant');
    expect(result).not.toContain('Past Variant');
    expect(result).not.toContain('Default Content');
  });

  it('should return default content when current date is before all variant start dates', () => {
    const userAttributes = { date: '2019-06-15T12:00:00Z' };
    const result = trimHtml(baseHtmlWithDates, userAttributes);
    expect(result).toContain('<div>Default Content</div>');
    expect(result).not.toContain('Current Variant');
    expect(result).not.toContain('Future Variant');
    expect(result).not.toContain('Past Variant');
  });

  it('should return default content when current date is after all variant end dates', () => {
    const userAttributes = { date: '2028-06-15T12:00:00Z' };
    const result = trimHtml(baseHtmlWithDates, userAttributes);
    expect(result).toContain('<div>Default Content</div>');
    expect(result).not.toContain('Current Variant');
    expect(result).not.toContain('Future Variant');
    expect(result).not.toContain('Past Variant');
  });

  it('should handle variants with only start date', () => {
    const htmlWithOnlyStartDate = baseHtmlWithDates.replace(
      '"startDate":"2023-01-01T00:00:00Z","endDate":"2025-12-31T23:59:59Z"',
      '"startDate":"2023-01-01T00:00:00Z"'
    );
    const userAttributes = { date: '2024-06-15T12:00:00Z' };
    const result = trimHtml(htmlWithOnlyStartDate, userAttributes);
    expect(result).toContain('<div>Current Variant</div>');
  });

  it('should handle variants with only end date', () => {
    const htmlWithOnlyEndDate = baseHtmlWithDates.replace(
      '"startDate":"2023-01-01T00:00:00Z","endDate":"2025-12-31T23:59:59Z"',
      '"endDate":"2025-12-31T23:59:59Z"'
    );
    const userAttributes = { date: '2024-06-15T12:00:00Z' };
    const result = trimHtml(htmlWithOnlyEndDate, userAttributes);
    expect(result).toContain('<div>Current Variant</div>');
  });
});
