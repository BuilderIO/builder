import { TARGET } from '../../constants/target.js';
import { BuilderBlock } from '../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
import RenderBlock from './render-block.lite';
import { For, Show } from '@builder.io/mitosis';

type Props = {
  block: BuilderBlock;
  componentRef: any;
  componentOptions: any;
  blockChildren: BuilderBlock[];
};

export default function RenderComponentAndStyles(props: Props) {
  return (
    <>
      <Show when={TARGET === 'vue' || TARGET === 'svelte'}>
        <BlockStyles block={props.block} />
      </Show>
      {props.componentRef && (
        <props.componentRef {...props.componentOptions}>
          <For each={props.blockChildren}>
            {(child) => <RenderBlock key={child.id} block={child} />}
          </For>
        </props.componentRef>
      )}
    </>
  );
}
