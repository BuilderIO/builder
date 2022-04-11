<script>
  import { onMount } from "svelte";
  import { afterUpdate } from "svelte";

  import RenderContent from "../components/render-content.lite";
  import BuilderContext from "../context/builder.context.lite";
  import { getContent } from "../functions/get-content";

  export let attributes;
  export let symbol;

  let className = "builder-symbol";
  let content = null;

  onMount(() => {
    content = symbol?.content;
  });

  afterUpdate(() => {
    const symbol = symbol;

    if (symbol && !symbol.content && !content && symbol.model) {
      getContent({
        model: symbol.model,
        apiKey: builderContext.apiKey!,
        options: {
          entry: symbol.entry,
        },
      }).then((response) => {
        content = response;
      });
    }
  });

</script>

<div
  {...attributes}
  dataSet={{ class: className }}
  class={className}>
  <RenderContent
    apiKey={builderContext.apiKey}
    context={builderContext.context}
    data={{ ...symbol?.data, ...builderContext.state, ...symbol?.content?.data?.state }}
    model={symbol?.model}
    {content} />
</div>
