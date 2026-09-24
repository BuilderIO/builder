import {
  Blocks,
  BuilderBlock,
  RegisteredComponent,
} from '@builder.io/sdk-react';

interface CustomHeroProps {
  content: BuilderBlock[];
  builderBlock: BuilderBlock;
}

const CustomHero = (props: CustomHeroProps) => {
  return (
    <>
      <h2>This is text from your component</h2>

      <Blocks
        blocks={props.content}
        parent={props.builderBlock.id}
        path="content"
      />
    </>
  );
};

export const customHeroInfo: RegisteredComponent = {
  name: 'CustomHero',
  component: CustomHero,
  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
  inputs: [
    {
      name: 'content',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [],
    },
  ],
};
