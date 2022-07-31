declare module '@builder.io/sdk-qwik' {
  const getContent: (options: {
    model: string;
    apiKey: string;
    userAttributes: Record<string, string>;
  }) => Promise<any>;
  const RenderContent: any;
}
