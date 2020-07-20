export type State = {
  selectedLocales: Set<string>;
};

export type Action = {
  checked: boolean;
  locale: string;
};

export type MemsourceArgs = {
  memsourceProxyUrl: string;
  sourceLocale: string;
  projectName: string;
  payload: any;
};
