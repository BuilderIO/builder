import { onMount, useMetadata, useStore } from '@builder.io/mitosis';
import * as React from 'react';
import type { RegisteredComponent } from '../../context/types.js';
import { ApiVersion } from '../../types/api-version.js';
import type { BuilderContent } from '../../types/builder-content.js';
import { Nullable } from '../../types/typescript.js';
import { default as ContentVariants } from '../content-variants/content-variants.lite.jsx';

useMetadata({
  rsc: {
    componentType: 'server',
  },
  qwik: {
    setUseStoreFirst: true,
  },
  angular: {
    selector: 'builder-content, content-variants',
  },
  vue: {
    emits: ['contentLoaded'],
  },
});

interface DataContentProps {
  model: string;
  content?: Nullable<BuilderContent>;
  render?: (
    data: any,
    fullContent: Nullable<BuilderContent>
  ) => React.ReactElement;
  apiKey?: string;
  apiHost?: string;
  apiVersion?: ApiVersion;
  data?: { [key: string]: any };
  context?: { [key: string]: any };
  customComponents?: RegisteredComponent[];
  linkComponent?: any;
  canTrack?: boolean;
  locale?: string;
  enrich?: boolean;
  nonce?: string;
  isNestedRender?: boolean;
  blocksWrapper?: any;
  blocksWrapperProps?: { [key: string]: any };
  contentWrapper?: any;
  contentWrapperProps?: { [key: string]: any };
  trustedHosts?: string[];
  strictStyleMode?: boolean;
}

export default function DataContent(props: DataContentProps) {
  const state = useStore({
    content: null as Nullable<BuilderContent>,
    loading: true,
  });

  onMount(() => {
    if (props.content) {
      state.content = props.content;
      state.loading = false;
      return;
    }
  });

  return (
    <ContentVariants
      content={props.content}
      model={props.model}
      render={props.render}
      apiKey={props.apiKey || ''}
      apiHost={props.apiHost}
      apiVersion={props.apiVersion}
      data={props.data}
      context={props.context}
      customComponents={props.customComponents}
      linkComponent={props.linkComponent}
      canTrack={props.canTrack}
      locale={props.locale}
      enrich={props.enrich}
      nonce={props.nonce}
      isNestedRender={props.isNestedRender}
      blocksWrapper={props.blocksWrapper}
      blocksWrapperProps={props.blocksWrapperProps}
      contentWrapper={props.contentWrapper}
      contentWrapperProps={props.contentWrapperProps}
      trustedHosts={props.trustedHosts}
    />
  );
}
