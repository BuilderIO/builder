export const generatePayload = (builderContext: any) => {
  try {
    const payloadMetadata = getPageOptions(builderContext);
    const translatablePageData = getTranslatablePageOptions(builderContext);

    const translatableComponents = getTranslatableComponents(builderContext);
    return {
      __context: payloadMetadata,
      content: translatableComponents.concat(translatablePageData)
    };
  } catch {
    // do nothing
  }
};

const getPageOptions = (builderContext: any) => {
  const { email } = builderContext.user.data;
  const {
    modelName,
    id,
    name
  } = builderContext.designerState.editingContentModel;
  const data = builderContext.designerState.editingContentModel.data.toJSON();
  delete data.blocks;
  return { ...data, modelName, pageId: id, requestor: email, pageName: name };
};

const getTranslatablePageOptions = (builderContext: any) => {
  const pageData = builderContext.designerState.editingContentModel.data.toJSON();
  const translatablePageOptions = builderContext.designerState.editingContentModel.model.fields
    .map((each: any) => each.toJSON())
    .filter(
      (each: any) =>
        ['text', 'longText'].includes(each.type) &&
        each.hideFromUI === false &&
        each.enum === undefined
    )
    .map((each: any) => {
      if (pageData[each.name]) {
        return {
          __id: `page-${each.name}`,
          __optionKey: each.name,
          toTranslate: pageData[each.name]
        };
      }
    })
    .filter((each: any) => each);

  return translatablePageOptions;
};

const getTranslatableComponents = (builderContext: any) => {
  const usedComponentsSchema = _getComponentsUsedSchema(builderContext);
  const translatableComponentNames = _getTranslatableComponentNames(
    usedComponentsSchema
  );

  const allOccurrencies = builderContext.designerState.editingContentModel.data
    .get('blocks')
    .toJSON()
    .map((block: any) => {
      const occurrencies = extractAllOccurrencies(block.toJSON(), 'component');
      return occurrencies;
    });

  const filtered = allOccurrencies
    .flat()
    .filter((block: any) => translatableComponentNames.includes(block.name));

  const translatableComponents = filtered
    .map((block: any) => _mapComponentToPayload(block, usedComponentsSchema))
    .flat()
    .filter(Boolean);

  return translatableComponents;
};

const _getComponentsUsedSchema = (builderContext: any) => {
  return builderContext.designerState.editingContentModel.componentsUsed;
};

const _getTranslatableComponentNames = (schema: any) => {
  const translatableComponentNames = [];
  for (let key in schema) {
    const comp = schema[key];
    if (
      comp.inputs.some((input: any) =>
        ['text', 'longText', 'list'].includes(input.type)
      )
    ) {
      translatableComponentNames.push(key);
    }
  }

  return translatableComponentNames;
};

const _mapComponentToPayload = (block: any, schema: any) => {
  const { name, options, id } = block;
  const singleValueOptions = mapSingleValueOptions(schema, name, options, id);
  const multipleValueOptions = mapMultipleValueOptions(
    schema,
    name,
    options,
    id
  );

  return [...singleValueOptions, ...multipleValueOptions];
};

const extractAllOccurrencies = (builderBlock: any, key: string) =>
  recursiveExtraction(builderBlock, key, []);

const recursiveExtraction = (
  builderBlock: any,
  key: string,
  ocurrencies: Array<any>
) => {
  if (!builderBlock) return ocurrencies;
  if (builderBlock instanceof Array) {
    for (const datum in builderBlock) {
      ocurrencies = ocurrencies.concat(
        recursiveExtraction(builderBlock[datum], key, [])
      );
    }
    return ocurrencies;
  }
  if (builderBlock && builderBlock.id && builderBlock[key]) {
    ocurrencies.push({ ...builderBlock[key], id: builderBlock.id });
  }

  if (typeof builderBlock === 'object' && builderBlock !== null) {
    const children = Object.keys(builderBlock);
    if (children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        ocurrencies = ocurrencies.concat(
          recursiveExtraction(builderBlock[children[i]], key, [])
        );
      }
    }
  }
  return ocurrencies;
};
const mapSingleValueOptions = (
  schema: any,
  name: any,
  options: any,
  id: any
) => {
  return Object.values(
    schema[name].inputs
      .filter((each: any) => ['text', 'longText'].includes(each.type))
      .map((each: any) => each.name)
  )
    .map((each: any) => {
      if (options[each]) {
        return {
          __id: id,
          __optionKey: each,
          toTranslate: options[each]
        };
      }
    })
    .filter((each: any) => each);
};

const mapMultipleValueOptions = (
  schema: any,
  name: any,
  options: any,
  id: any
) => {
  const multipleValues: any[] = [];
  Object.values(
    schema[name].inputs
      .filter((each: any) => ['list'].includes(each.type))
      .map((each: any) => each.name)
  ).forEach((each: any) => {
    if (options[each]) {
      return options[each].map(({ item }: { item: string }, index: number) => {
        console.log('Addind index', index);
        multipleValues.push({
          __id: id,
          __optionKey: each,
          __listIndex: index,
          toTranslate: item
        });
      });
    }
  });

  return multipleValues.filter(Boolean);
};
