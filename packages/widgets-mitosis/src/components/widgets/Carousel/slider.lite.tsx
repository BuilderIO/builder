// npm install @glidejs/glide
import Glide from '@glidejs/glide/dist/glide.modular.esm';
import '@glidejs/glide/dist/css/glide.core.min.css';
import { For, onMount, Show, useStore, useContext } from '@builder.io/mitosis';

// these elements needs to be migrated from @builder.io/sdks
import { BuilderElement } from '../../../types/element';
import RenderBlocks from '../../render-blocks.lite';
import RenderBlock from '../../render-block.lite';
import BuilderContext from '../../../context';

export interface SliderProps {
  builderBlock: any;
  useChildrenForSlides: boolean;
  slides: any[];
  prevArrow: any;
  frontArrow: any;
  dots: boolean;
  autoplay: boolean;
  autoplaySpeed: number;
}

export default function Slider(props: SliderProps) {
  const context = useContext(BuilderContext);

  const store = useStore({
    glide: new Glide('.glide', {
      type: 'slider',
      startAt: 0,
      autoplay: props.autoplay ? props.autoplaySpeed * 1000 : undefined,
    }),
    prevArrowFn: () => {
      store.glide.go('<');
    },
    nextArrowFn: () => {
      store.glide.go('>');
    },
  });

  onMount(() => {
    store.glide.on('mount:after', () => {
      console.log('slider mounted!');
    });
    store.glide.mount();
  });
  return (
    <div className="glide">
      {/* SLIDES */}
      <div className="glide__track" data-glide-el="track">
        <div className="glide__slides">
          <Show
            when={props.useChildrenForSlides && props.builderBlock && props.builderBlock.children}
          >
            <For each={props.builderBlock.children}>
              {(block: BuilderElement, index: number) => (
                <div className="glide__slide" key={index}>
                  <RenderBlock block={block} key={block.id} context={context} />
                </div>
              )}
            </For>
          </Show>
          <Show when={!props.useChildrenForSlides && props.slides}>
            <For each={props.slides}>
              {(slide: any, index: number) => (
                <div className="glide__slide" key={index}>
                  <RenderBlocks
                    key={index}
                    path={`component.options.slides.${index}.content`}
                    blocks={slide.content}
                  />
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>
      {/* DOTS */}
      <Show when={props.dots}>
        <div class="glide__bullets" data-glide-el="controls[nav]">
          <For each={props.slides}>
            {(_, index) => (
              <button class="glide__bullet" onClick={() => (store.glide.index = index)}></button>
            )}
          </For>
        </div>
      </Show>
      {/* CONTROLS */}
      <div data-glide-el="controls">
        <div onClick={store.prevArrowFn}>
          <RenderBlocks path="component.options.prevButton" blocks={props.prevArrow} />
        </div>
        <div onClick={store.nextArrowFn}>
          <RenderBlocks path="component.options.nextButton" blocks={props.frontArrow} />
        </div>
      </div>
    </div>
  );
}
