import type { BuilderBlock } from '../../types/builder-block';

import { component$ } from '@builder.io/qwik';

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};

export const Columns = component$((props: { columns: Column[] }) => {
  return (
    <div>
      <div>
        COLUMNS: {props.columns?.[0].blocks?.[0]?.component?.options.text}
      </div>
    </div>
  );
});

export default Columns;
