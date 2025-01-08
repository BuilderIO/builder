import type { RegisteredComponent } from '@builder.io/sdk-react';

export const ComponentWithLocalizedSubfields = (props: {
  texts: { text1: string; text2: string }[];
}) => {
  return (
    <div>
      {props.texts?.map((text, index) => (
        <div key={index}>
          {text.text1}
          <br />
          {text.text2}
        </div>
      ))}
    </div>
  );
};

export const componentWithLocalizedSubfieldsInfo: RegisteredComponent = {
  name: 'ComponentWithLocalizedSubfields',
  component: ComponentWithLocalizedSubfields,
  inputs: [
    {
      name: 'texts',
      type: 'array',
      subFields: [
        {
          name: 'text1',
          type: 'text',
        },
        {
          name: 'text2',
          type: 'text',
        },
      ],
    },
  ],
};
