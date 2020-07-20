import React, { createContext, useContext } from 'react';
import { generatePayload } from '../../services/payloadBuilder';
import isUrl from 'is-url';
import { MemsourceArgs } from '../../types';
const BuilderContext = createContext({});

export const BuilderProvider = (props: any) => {
  return (
    <BuilderContext.Provider value={props.context}>
      {props.children}
    </BuilderContext.Provider>
  );
};

export const getContext = (): any => {
  const builderContext = useContext(BuilderContext);
  if (builderContext === undefined) {
    const caller = getContext.caller.name;
    throw new Error(`${caller} must be used within a BuilderProvider`);
  }
  return builderContext;
};

export const isLocaleNotEligibleToLocaliseFrom = (): boolean => {
  const disallow = true;
  const allow = false;

  const allowedLocalesToTranslateFrom = getTranslatableSourceLocales();
  if (allowedLocalesToTranslateFrom === undefined) return allow;

  const sourceLocale = getSourceLocale();
  if (sourceLocale === undefined) return disallow;

  const isIncluded = allowedLocalesToTranslateFrom.includes(sourceLocale);

  if (isIncluded) return allow;
  return disallow;
};

export const modelHasOnlyOneLocale = (): boolean => {
  const hasNoTargetLocales = true;

  const targetLocales = getTargetLocales();

  if (targetLocales == undefined) return hasNoTargetLocales;
  return targetLocales.length === 0;
};

export const pageHasNoBlocks = (): boolean => {
  const withoutBlocks = true;
  const pageBlocks = getPageBlocks();

  if (pageBlocks === undefined) return withoutBlocks;

  return pageBlocks.length === 0;
};

export const modelHasNoProxyService = (): boolean => {
  const withoutProxyUrl = true;
  const withProxyUrl = false;
  const proxyServiceUrl = getMemsourceProxyServiceUrl();
  if (proxyServiceUrl === undefined) return withoutProxyUrl;

  const isValidUrl = isUrl(proxyServiceUrl);
  return isValidUrl ? withProxyUrl : withoutProxyUrl;
};

const getPageBlocks = (): any | undefined => {
  try {
    const ctx = getContext();
    const blocks = ctx.designerState.editingContentModel.data
      .get('blocks')
      .toJSON();
    return blocks;
  } catch {
    return undefined;
  }
};

const getTranslatableSourceLocales = (): Array<string> | undefined => {
  try {
    const ctx = getContext();
    return ctx.designerState.editingContentModel.model.fields
      .find((field: any) => field.name === 'allowedLocales')
      .enum.toJSON();
  } catch {
    return undefined;
  }
};

const getMemsourceProxyServiceUrl = (): string | undefined => {
  try {
    const ctx = getContext();
    return ctx.designerState.editingContentModel.model.fields
      .find((field: any) => field.name === 'memsourceProxyUrl')
      .toJSON().defaultValue;
  } catch {
    return undefined;
  }
};

export const getSourceLocale = (): string | undefined => {
  try {
    const ctx = getContext();
    return ctx.designerState.editingContentModel.data.toJSON().locale;
  } catch {
    return undefined;
  }
};

export const getTargetLocales = (): Array<string> | undefined => {
  try {
    const ctx = getContext();
    const sourceLocale = getSourceLocale();
    const targetLocales = ctx.designerState.editingContentModel.model.fields
      .find((field: any) => field.name === 'locale')
      .enum.toJSON();

    if (targetLocales.includes(sourceLocale)) {
      targetLocales.splice(targetLocales.indexOf(sourceLocale), 1);
    }
    return targetLocales;
  } catch {
    return undefined;
  }
};

export const getMemsourceArguments = (): MemsourceArgs | undefined => {
  const memsourceProxyUrl = getMemsourceProxyServiceUrl();
  if (memsourceProxyUrl === undefined) {
    throw new Error('Unable to retrieve memsourceProxyUrl from model');
  }

  const sourceLocale = getSourceLocale();
  if (sourceLocale === undefined) {
    throw new Error('Unable to retrieve page locale');
  }

  const projectName = getProjectName();
  if (projectName === undefined) {
    throw new Error('Unable to get either modelName, pageName and/or locale');
  }

  const payload = generatePayload(getContext());
  if (payload === undefined) {
    throw new Error('Error generating memsource payload');
  }

  return {
    memsourceProxyUrl,
    sourceLocale,
    projectName,
    payload
  };
};

const getProjectName = (): string | undefined => {
  try {
    const ctx = getContext();
    const { editingContentModel } = ctx.designerState;
    const modelName = editingContentModel.model.name;
    const pageName = editingContentModel.data.toJSON().title;
    const sourceLocale = editingContentModel.data.toJSON().locale;
    return `Builderio__${modelName}__${pageName}__${sourceLocale}`;
  } catch {
    return undefined;
  }
};
