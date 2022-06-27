import { Builder } from '@builder.io/react';

export type BulkAction = {
  label: string;
  showIf(selectedContentIds: string[], content: any[], model: any): Boolean;
  onClick(
    actions: { refreshList: () => void },
    selectedContentIds: string[],
    content: any[],
    model: any
  ): Promise<void>;
};

export function registerBulkAction(bulkAction: BulkAction) {
  Builder.register('content.bulkAction', bulkAction);
}

export type ContentAction = {
  label: string;
  showIf(content: any, model: any): Boolean;
  onClick(content: any): Promise<void>;
};

export function registerContentAction(contentAction: ContentAction) {
  Builder.register('content.action', contentAction);
}

export type ElementAction = {
  label: string;
  showIf(element: any, model: any): Boolean;
  onClick(element: any): Promise<void> | void;
};

export function registerElementAction(elementAction: ElementAction) {
  Builder.register('element.action', elementAction);
}
