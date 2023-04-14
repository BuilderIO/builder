import { Fragment, Show, useStore } from '@builder.io/mitosis';
import { isBrowser } from '../../functions/is-browser';
import type { BuilderContent } from '../../types/builder-content';
import { getData, getVariantsScriptString } from './helpers';

interface VariantsProviderProps {
  initialContent: BuilderContent;
  children: (
    variants: BuilderContent[],
    renderScript?: () => JSX.Element
  ) => JSX.Element;
}

export default function RenderContentVariants(props: VariantsProviderProps) {
  const state = useStore({
    variantScriptStr: getVariantsScriptString(
      Object.entries(props.initialContent.variations || {}).map(
        ([item, value]) => ({
          id: item,
          testRatio: value?.testRatio,
        })
      ),
      props.initialContent.id!
    ),

    variants: [
      ...Object.entries(props.initialContent.variations!).map(
        ([id, value]): BuilderContent => ({
          ...value,
          id,
          data: getData(value!),
        })
      ),
      props.initialContent,
    ],

    // figure out how to replace this logic with the one we already have written elsewhere to grab variants
    getVariantId: () => {
      const cookieName = `builder.tests.${props.initialContent.id}`;
      // can probably reuse other variant selector logic here
      let variantId: string | null = builder.getCookie(cookieName);

      if (!variantId && isBrowser()) {
        let n = 0;
        const random = Math.random();
        for (let i = 0; i < state.variants.length; i++) {
          const variant = state.variants[i];
          const testRatio = variant.testRatio;
          n += testRatio!;
          if (random < n) {
            builder.setCookie(cookieName, variant.id);
            variantId = variant.id!;
            break;
          }
        }

        // can remove since variants now includes initialContent
        if (!variantId) {
          // render initial content when no winning variation
          variantId = props.initialContent.id!;
          builder.setCookie(cookieName, variantId);
        }
      }

      return variantId;
    },

    // TO-DO: refactor this logic to match RenderContent. maybe reuse RenderContent?
    // either way this needs to become a Mitosis component that is called here
    renderContentChild: (content: BuilderContent, index: number) => {
      // default Variation is at the end, wrap the rest with template
      const Tag = index === state.variants.length - 1 ? Fragment : 'template';
      return (
        <Fragment key={String(content?.id! + index)}>
          {Tag !== 'template' && renderScript?.()}
          <Tag
            key={String(content?.id! + index)}
            {...(Tag === 'template' && {
              'data-template-variant-id': content?.id,
            })}
          >
            <TagName
              {...(index === 0 &&
                !this.props.dataOnly && {
                  ref: (ref: any) => (this.ref = ref),
                })}
              className="builder-content"
              onClick={(event) => {}}
              builder-content-id={content?.id}
              builder-model={this.name}
            >
              {this.props.children(
                content?.data! as any,
                this.props.inline ? false : loading,
                useData
              )}
            </TagName>
          </Tag>
        </Fragment>
      );
    },

    shouldRenderInitialContent:
      (isBrowser() && !builder.canTrack) ||
      !Object.keys(props.initialContent?.variations || {}).length,
  });

  return (
    <Show
      when={state.shouldRenderInitialContent}
      else={
        <Show
          when={!isBrowser()}
          else={state.renderContentChild(
            state.variants.find((item) => item.id === state.getVariantId())!,
            0
          )}
        >
          {/* render script that will remove non-winning variants */}
          <script
            id={`variants-script-${props.initialContent.id}`}
            innerHTML={state.variantScriptStr}
          ></script>
          {state.variants.map(state.renderContentChild)}
        </Show>
      }
    >
      {state.renderContentChild(props.initialContent, 0)}
    </Show>
  );
}
