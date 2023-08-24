import { getProps } from '@e2e/tests';
import { RenderContent, _processContentResult } from '../../sdk-src';
import { component$, useStore } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export interface MainProps {
  url: string;
}

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await getProps({
    pathname: event.url.pathname,
    _processContentResult,
  });

  if (!data) {
    event.status(404);
  }
  return data;
});

type Block = {
  textValue: string;
};

type Column = {
  blocks: Block[];
  id: string;
};

type Columns = Column[];

const Block = component$<{ block: Block }>((props) => {
  return <div>{props.block.textValue}</div>;
});

const Column = component$<{ blocks: Block[] }>((props) => {
  return (
    <div>
      {props.blocks.map((item) => {
        return <div>{item.textValue}</div>;
      })}
    </div>
  );
});

const Columns = component$<{ columns: Columns }>((props) => {
  return (
    <div>
      {props.columns.map((column, index) => {
        return (
          <div key={index}>
            <Column key={column.id} blocks={column.blocks} />
          </div>
        );
      })}
    </div>
  );
});

export default component$(() => {
  const contentProps = useBuilderContentLoader();
  const store = useStore<{ columns: Columns }>(
    {
      columns: [
        { id: 'first', blocks: [{ textValue: '1' }, { textValue: '2' }] },
        { id: 'second', blocks: [{ textValue: '5' }, { textValue: '72' }] },
      ],
    },
    {
      deep: true,
    }
  );
  return (
    <>
      <>
        {contentProps.value ? (
          <RenderContent {...contentProps.value} />
        ) : (
          <div>Content Not Found</div>
        )}
      </>
      {/* <button
        onClick$={$(() => {
          store.columns[0].blocks[1].textValue = 'NEW VALUE';
        })}
      >
        update
      </button>
      <Columns columns={store.columns} /> */}
    </>
  );
  ('');
});
