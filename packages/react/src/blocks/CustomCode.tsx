import React from 'react';
import { BuilderElement, Builder } from '@builder.io/sdk';
import { withBuilder } from '../functions/with-builder';

interface Props {
  code: string;
  builderBlock?: BuilderElement;
  replaceNodes?: boolean;
  scriptsClientOnly?: boolean;
}

// TODO: settings context to pass this down. do in shopify-specific generated code
const globalReplaceNodes = ({} as { [key: string]: Node[] }) || null;

const isShopify = Builder.isBrowser && 'Shopify' in window;

if (Builder.isBrowser && globalReplaceNodes) {
  const customCodeQuerySelector = '.builder-custom-code';

  try {
    let allCustomCodeElements = Array.from(document.querySelectorAll(customCodeQuerySelector));

    // Search each template element (if present) for custom code blocks since
    // querySelectorAll cannot search all templates that we use for variations, because they are
    // considered document fragments and are not a part of the DOM.
    const builderTemplates = document.querySelectorAll('template[data-template-variant-id]');
    if (builderTemplates.length) {
      Array.from(builderTemplates).forEach(template => {
        const content: DocumentFragment = (template as any).content;
        const codeElements = content.querySelectorAll(customCodeQuerySelector);
        if (codeElements.length) {
          allCustomCodeElements = allCustomCodeElements.concat(Array.from(codeElements));
        }
      });
    }

    allCustomCodeElements.forEach(el => {
      const parent = el.parentElement;
      const id = parent && parent.getAttribute('builder-id');
      if (id) {
        globalReplaceNodes[id] = globalReplaceNodes[id] || [];
        globalReplaceNodes[id].push(isShopify ? el : el.cloneNode(true));
      }
    });
  } catch (err) {
    console.error('Builder replace nodes error:', err);
  }
}

class CustomCodeComponent extends React.Component<Props> {
  elementRef: Element | null = null;
  originalRef: Node | Element | null = null;

  scriptsInserted = new Set();
  scriptsRun = new Set();

  firstLoad = true;
  replaceNodes = false;
  state = {
    hydrated: false,
  };

  constructor(props: Props) {
    super(props);
    if (Builder.isBrowser) {
      const id = this.props.builderBlock?.id;
      this.replaceNodes = Boolean(
        Builder.isBrowser && (props.replaceNodes || isShopify) && id && globalReplaceNodes?.[id]
      );

      if (this.firstLoad && this.props.builderBlock) {
        if (id && globalReplaceNodes?.[id]) {
          const el = globalReplaceNodes[id].shift() || null;
          this.originalRef = el;
          if (globalReplaceNodes[id].length === 0) {
            delete globalReplaceNodes[id];
          }
        } else if (this.replaceNodes) {
          const existing = document.querySelectorAll(
            `.${this.props.builderBlock.id} .builder-custom-code`
          );
          if (existing.length === 1) {
            const node = existing[0];
            this.originalRef = node as HTMLElement;
            (this.originalRef as Element).remove();
          }
        }
      }
    }
  }

  get noReactRender() {
    // Don't render liquid client side
    return Boolean(isShopify && this.props.code?.match(/{[{%]/g));
  }

  get isHydrating() {
    return !isShopify && this.originalRef;
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.code !== prevProps.code) {
      this.findAndRunScripts();
    }
  }

  componentDidMount() {
    this.firstLoad = false;
    if (!this.replaceNodes) {
      if (this.isHydrating) {
        // first render need to match what's on ssr (issue with next.js)
        this.setState({
          hydrated: true,
        });
        Builder.nextTick(() => this.findAndRunScripts());
      } else {
        this.findAndRunScripts();
      }
    }
    if (Builder.isBrowser && this.replaceNodes && this.originalRef && this.elementRef) {
      this.elementRef.appendChild(this.originalRef);
    }
  }

  findAndRunScripts() {
    if (this.elementRef && typeof window !== 'undefined') {
      const scripts = this.elementRef.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src) {
          if (this.scriptsInserted.has(script.src)) {
            continue;
          }
          this.scriptsInserted.add(script.src);
          const newScript = document.createElement('script');
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else if (
          !script.type ||
          ['text/javascript', 'application/javascript', 'application/ecmascript'].includes(
            script.type
          )
        ) {
          if (this.scriptsRun.has(script.innerText)) {
            continue;
          }
          try {
            this.scriptsRun.add(script.innerText);
            new Function(script.innerText)();
          } catch (error) {
            console.warn('Builder custom code component error:', error);
          }
        }
      }
    }
  }

  get code() {
    // when ssr'd by nextjs it'll break hydration if initial client render doesn't match ssr
    if (
      (Builder.isServer || (this.isHydrating && this.firstLoad)) &&
      this.props.scriptsClientOnly
    ) {
      return (this.props.code || '').replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      );
    }
    return this.props.code;
  }

  render() {
    // TODO: remove <script> tags for server render (unless has some param to say it's only goingn to be run on server)
    // like embed
    return (
      <div
        ref={ref => (this.elementRef = ref)}
        // TODO: add a class when node replaced in (?)
        className="builder-custom-code"
        {...(!this.replaceNodes &&
          !this.noReactRender && {
            dangerouslySetInnerHTML: { __html: this.code },
          })}
      />
    );
  }
}

export const CustomCode = withBuilder(CustomCodeComponent, {
  name: 'Custom Code',
  static: true,
  requiredPermissions: ['editCode'],
  inputs: [
    {
      name: 'code',
      type: 'html',
      required: true,
      defaultValue: '<p>Hello there, I am custom HTML code!</p>',
      code: true,
    },
    {
      name: 'replaceNodes',
      type: 'boolean',
      helperText: 'Preserve server rendered dom nodes',
      advanced: true,
      ...(isShopify && {
        defaultValue: true,
      }),
    },
    {
      name: 'scriptsClientOnly',
      type: 'boolean',
      helperText:
        'Only print and run scripts on the client. Important when scripts influence DOM that could be replaced when client loads',
      advanced: true,
      ...(!isShopify && {
        defaultValue: true,
      }),
    },
  ],
} as any);
