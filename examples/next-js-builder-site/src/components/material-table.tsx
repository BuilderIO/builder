import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withBuilder, BuilderBlocks } from '@builder.io/react';

export interface MaterialTableProps {
  headColumns: { label: string; numeric: boolean }[];
  bodyRows: { columns: { content: any[]; numeric: boolean }[] }[];
  builderBlock: any;
}

const defaultContent = {
  '@type': '@builder.io/sdk:Element',
  component: {
    name: 'Text',
    options: {
      text: '<p>Enter some text...</p>',
    },
    defaultStyle: {
      lineHeight: 'normal',
      height: 'auto',
      textAlign: 'center',
    },
  },
};

export function MaterialTableComponent(props: MaterialTableProps) {
  const { headColumns, bodyRows, builderBlock } = props;
  return (
    <Table className="builder-table">
      {headColumns && !!headColumns.length && (
        <TableHead>
          {headColumns.map((col, index) => (
            <TableCell key={index} align={col.numeric ? 'right' : undefined}>
              {col.label}
            </TableCell>
          ))}
        </TableHead>
      )}
      {bodyRows && !!bodyRows.length && (
        <TableBody>
          {bodyRows.map((row, index) => (
            <TableRow key={index}>
              {row.columns.map((col, colIndex) => (
                <TableCell
                  key={colIndex}
                  align={col.numeric ? 'right' : undefined}
                >
                  <BuilderBlocks
                    key={colIndex}
                    parentElementId={builderBlock && builderBlock.id}
                    dataPath={`component.options.bodyRows.${index}.columns.${colIndex}.content`}
                    child
                    blocks={col.content}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      )}
    </Table>
  );
}
