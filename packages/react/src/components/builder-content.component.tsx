import React from 'react';
import {
  builder,
  Subscription,
  GetContentOptions,
  Builder,
  BuilderContent as Content,
} from '@builder.io/sdk';
import { NoWrap } from './no-wrap';
import { applyPatchWithMinimalMutationChain } from '../functions/apply-patch-with-mutation';
import { VariantsProvider } from './variants-provider.component';

export type BuilderContentProps<ContentType> = {
  /**
   * Callback to run when content is fetched and loaded.
   */
  contentLoaded?: (data: any, content: any) => void;
  /**
   * Callback to run if an error occurred while fetching content.
   */
  contentError?: (error: any) => void;
  options?: GetContentOptions;
  children: (content: ContentType, loading?: boolean, fullData?: any) => React.ReactNode;
  /**
   * Only render what was explicitly passed in via `content` - don't fetch from
   * the Builder API.
   *
   * @see content
   */
  inline?: boolean;
  /**
   * @package
   * @deprecated
   */
  dataOnly?: boolean;
  /**
   * @package
   * Pass in a specific builder instance to use instead of the default
   * singleton.
   */
  builder?: Builder;
  /**
   * @deprecated and unnecessary
   */
  isStatic?: boolean;
  /**
   * Builder content object to use instead of fetching from the API.
   *
   * Required if `inline` is set to `true`.
   */
  content?: Content;
} & ({ model: string } | { modelName: string }); // model and modelName are aliases of the same thing¸

/**
 * When passed content json explicitly it'll calculate a/b tests on the content
 * and pass the winning variation down to the children function. If then content
 * prop was omitted it'll try to fetch matching content from your Builder
 * account based on the default user attributes and model.
 */
export class BuilderContent<ContentType extends object = any> extends React.Component<
  BuilderContentProps<ContentType>
> {
  ref: HTMLDivElement | null = null;

  get builder() {
    return this.props.builder || builder;
  }
  get name() {
    const props = this.props;

    if ('model' in props) {
      return props.model;
    } else {
      return props.modelName;
    }
  }

  get renderedVariantId() {
    const id = this.props.isStatic
      ? this.builder.getCookie(`builder.tests.${this.data?.id}`)
      : this.data?.variationId;
    if (id !== null) {
      return id;
    }
  }

  get options() {
    let options = {
      ...(this.props.options || ({} as GetContentOptions)),
    };
    if (!options.key && this.props.content?.id) {
      options.key = this.props.content.id;
    }
    if (this.props.content && !options.initialContent?.length) {
      options.initialContent = [this.props.content];
    }

    return options;
  }

  get data() {
    const content: Content =
      ((this.props.inline || !Builder.isBrowser || this.firstLoad) &&
        this.options.initialContent &&
        this.options.initialContent[0]) ||
      this.state.data;

    return getContentWithInfo(content);
  }

  state = {
    loading: !this.props.content,
    data: getContentWithInfo(this.props.content),
    updates: 1,
  };

  onWindowMessage = (event: MessageEvent) => {
    const message = event.data;
    if (!message) {
      return;
    }
    switch (message.type) {
      case 'builder.patchUpdates': {
        if (this.props.options?.noEditorUpdates) {
          return;
        }
        const { data } = message;
        if (!(data && data.data)) {
          break;
        }
        const patches = data.data[this.state.data?.id!];
        if (!(patches && patches.length)) {
          return;
        }

        if (location.href.includes('builder.debug=true')) {
          eval('debugger');
        }
        for (const patch of patches) {
          applyPatchWithMinimalMutationChain(this.state.data, patch);
        }
        this.setState({
          updates: this.state.updates + 1,
          data: this.state.data ? { ...this.state.data } : this.state.data,
        });
        if (this.props.contentLoaded) {
          this.props.contentLoaded(this.state.data?.data, this.state.data);
        }

        break;
      }
    }
  };

  subscriptions = new Subscription();

  firstLoad = true;
  clicked = false;
  trackedImpression = false;

  intersectionObserver: IntersectionObserver | null = null;

  // TODO: observe model name for changes
  componentDidMount() {
    // Temporary to test metrics diving in with bigquery and heatmaps
    // this.builder.autoTrack = true;
    // this.builder.env = 'development';
    if (!this.props.inline || Builder.isEditing) {
      this.subscribeToContent();
    } else if (this.props.inline && this.options?.initialContent?.length) {
      const contentData = this.options.initialContent[0];
      // TODO: intersectionobserver like in subscribetocontent - reuse the logic
      if (contentData?.id) {
        this.builder.trackImpression(contentData.id, this.renderedVariantId, undefined, {
          content: contentData,
        });
      }
    }

    if (Builder.isEditing) {
      addEventListener('message', this.onWindowMessage);
    }

    /// REACT15ONLY if (this.ref) { this.ref.setAttribute('builder-model', this.name); }
  }

  subscribeToContent() {
    if (this.name !== '_inline') {
      // TODO:... using targeting...? express.request hmmm
      this.subscriptions.add(
        builder.queueGetContent(this.name, this.options).subscribe(
          matches => {
            const match = matches && matches[0];
            this.setState({
              data: match,
              loading: false,
            });

            if (match && this.firstLoad) {
              this.firstLoad = false;
              // TODO: autoTrack
              if (builder.autoTrack && !Builder.isEditing) {
                let addedObserver = false;
                if (typeof IntersectionObserver === 'function' && this.ref) {
                  try {
                    const observer = (this.intersectionObserver = new IntersectionObserver(
                      (entries, observer) => {
                        entries.forEach(entry => {
                          // In view
                          if (entry.intersectionRatio > 0 && !this.trackedImpression) {
                            this.builder.trackImpression(
                              match.id!,
                              this.renderedVariantId,
                              undefined,
                              {
                                content: this.data,
                              }
                            ),
                              { content: this.data };
                            this.trackedImpression = true;
                            if (this.ref) {
                              observer.unobserve(this.ref);
                            }
                          }
                        });
                      }
                    ));

                    observer.observe(this.ref);
                    addedObserver = true;
                  } catch (err) {
                    console.warn('Could not bind intersection observer');
                  }
                }
                if (!addedObserver) {
                  this.trackedImpression = true;
                  this.builder.trackImpression(match.id!, this.renderedVariantId, undefined, {
                    content: match,
                  });
                }
              }
            }
            if (this.props.contentLoaded) {
              this.props.contentLoaded(match && match.data, match);
            }
          },
          error => {
            if (this.props.contentError) {
              this.props.contentError(error);
              this.setState({
                loading: false,
              });
            }
          }
        )
      );
    }
  }

  componentWillUnmount() {
    if (Builder.isEditing) {
      removeEventListener('message', this.onWindowMessage);
    }

    this.subscriptions.unsubscribe();
    if (this.intersectionObserver && this.ref) {
      this.intersectionObserver.unobserve(this.ref);
    }
  }

  onClick = (reactEvent: React.MouseEvent<HTMLElement>) => {
    // TODO: viewport scrolling tracking for impression events
    const event = reactEvent.nativeEvent;

    const content = this.data;
    if (!content) {
      return;
    }
    if (builder.autoTrack) {
      this.builder.trackInteraction(content.id!, this.renderedVariantId, this.clicked, event, {
        content,
      });
    }
    if (!this.clicked) {
      this.clicked = true;
    }
  };

  render() {
    if (this.props.dataOnly) {
      return null;
    }
    const { loading } = this.state;

    const useData: any = this.data;
    const TagName = this.props.dataOnly ? NoWrap : 'div';
    return (
      <VariantsProvider initialContent={useData}>
        {(variants, renderScript) => {
          return (
            <React.Fragment>
              {variants.map((content, index) => {
                // default Variation is at the end, wrap the rest with template
                // TODO: IE11 don't support templates
                const Tag = index === variants.length - 1 ? React.Fragment : 'template';
                return (
                  <React.Fragment key={String(content?.id! + index)}>
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
                        onClick={this.onClick}
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
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        }}
      </VariantsProvider>
    );
  }
}

export const getContentWithInfo = (content?: Content) => {
  if (content) {
    const cookieValue = builder.getCookie(`builder.tests.${content.id}`);
    const cookieVariation =
      cookieValue === content.id ? content : content.variations?.[cookieValue];
    const variationName =
      cookieVariation?.name || (cookieVariation?.id === content.id ? 'Default variation' : '');

    return {
      ...content,
      variationId: cookieValue,
      testVariationId: cookieValue,
      testVariationName: variationName,
    };
  }
  return null;
};
