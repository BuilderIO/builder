/**
 * Test if the binding expression would be likely to generate
 * valid or invalid liquid. If we generate invalid liquid tags
 * Shopify will reject our PUT to update the template
 *
 * @todo Extend to support more complex things, but for now
 * for basic bindings just support `foo.bar.baz` if not wrapped in
 * context.shopify.*, or expressoins who include context.shopify.liquid.*
 * This is not perfect, there are cases this will fail, but it's much better
 * than not checking at all and always assuming expressions are valid, and
 * this should solve 80/20 of invalid liquid via JS expressions causing invalid
 * liquid code
 */
export const isValidLiquidBinding = (str = '') => {
  return Boolean(
    // Test is the expression is sipmle and would map to Shopify bindings
    // e.g. `state.product.price` -> `{{product.price}}
    str.match(/^[a-z0-9\.\s]+$/i) ||
      // Test for our `context.shopify.liquid.*(expression), which
      // we regex out later to transform back into valid liquid expressions
      str.match(/(context|ctx)\s*\.shopify\s*\.liquid\s*\./)
  );
};
