import { BuilderContent, BuilderElement } from '@builder.io/sdk';
export declare const isBuilderElement: (item: unknown) => item is BuilderElement;
declare type PropsMappers = {
    [key: string]: (props: any, block: BuilderElement) => Promise<any>;
};
export declare function getAsyncProps(content: BuilderContent, mappers: PropsMappers): Promise<BuilderContent>;
export {};
