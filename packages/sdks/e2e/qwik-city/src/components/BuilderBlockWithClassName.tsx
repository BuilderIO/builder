import { component$ } from '@builder.io/qwik';
import type { BuilderBlock } from '@builder.io/sdk-qwik';
import { Blocks } from '@builder.io/sdk-qwik';

interface BuilderBlockWithClassNameProps {
  builderBlock: BuilderBlock;
  content: BuilderBlock[];
  builderContext: any;
  builderComponents: any;
}

export default component$((props: BuilderBlockWithClassNameProps) => {
  return (
    <div>
      <Blocks
        parent={props.builderBlock?.id}
        path={`component.options.content`}
        context={props.builderContext}
        registeredComponents={props.builderComponents}
        blocks={props.content}
        className="test-class-name"
      />
    </div>
  );
});
