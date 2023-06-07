import 'masonry-layout/dist/masonry.pkgd.min.js';
import type { BuilderElement } from '../../types/element';
import RenderBlocks from '../../components/render-blocks.lite';
import RenderBlock from '../../components/render-block/render-block.lite';
import BuilderContext from '../../context/builder.context.lite';
import { Show, For, useContext } from '@builder.io/mitosis';

type BuilderBlockType = BuilderElement;

interface MasonryProps {
  tiles: Array<{
    content: BuilderBlockType[];
  } /* BuilderBlock <- export this type */>;
  builderBlock: BuilderBlockType;
  useChildrenForTiles?: boolean;
  gutterSize?: string;
  columnWidth?: string;
}

export default function MasonryComponent(props: MasonryProps) {
  const context = useContext(BuilderContext);
  //TODO: layoutComplete state

  return (
    <div>
      <div
        className="grid"
        data-masonry={`{ "columnWidth": ${props.columnWidth}, "itemSelector": ".grid-item" }`}
      >
        <Show
          when={
            props.useChildrenForTiles &&
            props.builderBlock &&
            props.builderBlock.children
          }
        >
          <For each={props.builderBlock.children}>
            {(block: BuilderElement, index: number) => (
              <div
                key={index}
                className="grid-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  width: props.columnWidth,
                }}
              >
                <RenderBlock block={block} context={context} id={block.id} />
              </div>
            )}
          </For>
        </Show>
        <Show when={!props.useChildrenForTiles && props.tiles}>
          <For each={props.tiles}>
            {(tile, index) => (
              <div
                key={index}
                className="grid-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  width: props.columnWidth,
                }}
              >
                <RenderBlocks
                  blocks={(tile as any).content || tile}
                  path={`component.options.tiles.${index}.content`}
                  parent={props.builderBlock && props.builderBlock.id}
                />
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}
