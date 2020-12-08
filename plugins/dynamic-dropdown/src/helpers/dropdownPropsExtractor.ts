import Mustache from 'mustache';

const getMassagedProps = (props: any): any => {
  const { url, mapper, dependencyComponentVariables } = props.field.options || ({} as any);

  if (isNullOrEmpty(url)) throw new Error('Missing { url: "" } required option');
  if (isNullOrEmpty(mapper)) throw new Error('Missing { mapper: "" } required option');

  const view = getView(props, dependencyComponentVariables);

  const renderedUrl = renderTemplate(url, view);

  const massagedProps = { url: renderedUrl, mapper };

  return massagedProps;
};

const isNullOrEmpty = (input: String) => {
  if (input == null) return true;

  if (typeof input === 'string') return input.trim().length === 0;

  return true;
};

export { getMassagedProps };

function getView(props: any, dependencyComponentVariables?: any[]) {
  const view = Object.assign({}, props.context.designerState.editingContentModel.data.toJSON());

  if (dependencyComponentVariables && dependencyComponentVariables.length) {
    dependencyComponentVariables.forEach((key: string) => {
      if (props.object.get(key) != null) {
        view[key] = props.object.get(key);
      }
    });
  }

  return view;
}

function renderTemplate(url: any, view: any) {
  const parsedTemplateParts = Mustache.parse(url);
  const variablesToReplace = parsedTemplateParts
    .filter((part: any): any => part[0] === 'name')
    .map((part: any) => part[1]);

  validateTemplateVariables(variablesToReplace, view);

  const renderedUrl = Mustache.render(url, view);

  return renderedUrl;
}

function validateTemplateVariables(variablesToReplace: any, view: any) {
  let variablesWithError: string[] = [];

  variablesToReplace.forEach((variableToReplace: string) => {
    if (!Object.keys(view).includes(variableToReplace)) {
      variablesWithError.push(`{{${variableToReplace}}}`);
    }
  });

  if (variablesWithError.length) {
    throw new Error(`Tokens ${variablesWithError.join(', ')} not replaced`);
  }
}
