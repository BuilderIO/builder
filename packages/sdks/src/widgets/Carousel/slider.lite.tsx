// npm install @glidejs/glide
import Glide from '@glidejs/glide/dist/glide.modular.esm';
import '@glidejs/glide/dist/css/glide.core.min.css';
import { For, onMount, Show, useStore, useContext } from '@builder.io/mitosis';
import type { BuilderElement } from '../../types/element';
import RenderBlocks from '../../components/render-blocks.lite';
import RenderBlock from '../../components/render-block/render-block.lite';
import BuilderContext from '../../context/builder.context.lite';

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

  const state = useStore({
    glide: new Glide('.glide', {
      type: 'slider',
      startAt: 0,
      autoplay: props.autoplay ? props.autoplaySpeed * 1000 : undefined,
    }),
    prevArrowFn: () => {
      state.glide.go('<');
    },
    nextArrowFn: () => {
      state.glide.go('>');
    },
  });

  onMount(() => {
    state.glide.on('mount:after', () => {
      console.log('slider mounted!');
    });
    state.glide.mount();
  });
  return (
    <div className="glide">
      {/* SLIDES */}
      <div className="glide__track" data-glide-el="track">
        <div className="glide__slides">
          <Show
            when={
              props.useChildrenForSlides &&
              props.builderBlock &&
              props.builderBlock.children
            }
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
              <button
                class="glide__bullet"
                onClick={() => (state.glide.index = index)}
              ></button>
            )}
          </For>
        </div>
      </Show>
      {/* CONTROLS */}
      <div data-glide-el="controls">
        <div onClick={state.prevArrowFn}>
          <RenderBlocks
            path="component.options.prevButton"
            blocks={props.prevArrow}
          />
        </div>
        <div onClick={state.nextArrowFn}>
          <RenderBlocks
            path="component.options.nextButton"
            blocks={props.frontArrow}
          />
        </div>
      </div>
    </div>
  );
}
