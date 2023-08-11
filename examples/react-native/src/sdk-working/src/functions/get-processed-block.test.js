import { getProcessedBlock } from "./get-processed-block.js";
test("Can process bindings", () => {
  var _a, _b, _c, _d, _e, _f;
  const block = {
    "@type": "@builder.io/sdk:Element",
    properties: {
      foo: "bar"
    },
    bindings: {
      "properties.foo": '"baz"',
      "responsiveStyles.large.zIndex": "1 + 1",
      "properties.test": "state.test",
      "properties.block": `
        const foo = 'bar';
        return foo;
      `,
      "properties.isEditing": "builder.isEditing"
    }
  };
  const processed = getProcessedBlock({
    block,
    context: {},
    rootState: { test: "hello" },
    rootSetState: void 0,
    localState: void 0,
    shouldEvaluateBindings: true
  });
  expect(processed).not.toEqual(block);
  expect((_a = processed.properties) == null ? void 0 : _a.foo).toEqual("baz");
  expect((_b = processed.properties) == null ? void 0 : _b.test).toEqual("hello");
  expect((_c = processed.properties) == null ? void 0 : _c.block).toEqual("bar");
  expect((_d = processed.properties) == null ? void 0 : _d.isEditing).toEqual(false);
  expect((_f = (_e = processed.responsiveStyles) == null ? void 0 : _e.large) == null ? void 0 : _f.zIndex).toEqual(2);
});
