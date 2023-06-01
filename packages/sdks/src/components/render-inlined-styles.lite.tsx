import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  elementTag: 'state.tag',
});

interface Props {
  styles: string;
  id?: string;
}

export default function RenderInlinedStyles(props: Props) {
  return (
    /**
     * We have a Svelte plugin that converts this `div` to a `Fragment`. We cannot directly use a "Fragment" here because
     * not all frameworks support providing properties to a "Fragment" (e.g. Solid)
     *
     * eslint-disable-next-line @typescript-eslint/ban-ts-comment
     * @ts-ignore */
    <style innerHTML={props.styles} id={props.id} />
  );
}
