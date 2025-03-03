import { builder } from '@builder.io/react';
import { useEffect, useState } from 'react';
import queries from './queries';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

interface Row {
  id: string;
  name: string;
  data: string;
}

interface QueryResults {
  [key: `$${string}`]: object;
}

const queryKeys = [
  '$eq',
  '$gt',
  '$gte',
  '$in',
  '$lt',
  '$lte',
  '$ne',
  '$nin',
  '$and',
  '$not',
  '$or',
  '$nor',
  '$exists',
  '$type',
  '$elemMatch',
  '$regex',
  '$options',
];

export default function QueryCheatsheet() {
  const [queryResults, setQueryResults] = useState(
    queryKeys.reduce((acc, key) => ({ ...acc, [key]: {} }), {}) as QueryResults
  );

  useEffect(() => {
    function fetchContent() {
      // Array of requests
      const requests = queryKeys.map((key) => {
        const queryFn = queries[key as keyof typeof queries];
        return queryFn({ key, sort: { name: 1 } }).then((val) => ({
          [key]: val,
        }));
      });

      return Promise.all(requests).then((response) => {
        const results = response.reduce((acc: object, query: object) => {
          return { ...acc, ...query };
        }, {}) as QueryResults;
        setQueryResults(results);
      });
    }

    fetchContent();
  }, []);

  const rows = Object.entries(queryResults).map(([key, value]) => {
    const data = value as Row;
    return (
      <tr id={key} key={key}>
        <td>{data.id ? key : 'Loading...'}</td>
        <td>{data.id}</td>
        <td>{data.name}</td>
        <td>{JSON.stringify(data.data)}</td>
      </tr>
    );
  });

  return (
    <>
      <h1>Query Cheatsheet</h1>
      <table>
        <thead>
          <tr>
            <th>Query</th>
            <th>ID</th>
            <th>Name</th>
            <th>Data Result</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </>
  );
}
