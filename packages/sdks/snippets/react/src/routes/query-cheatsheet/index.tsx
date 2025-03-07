import { useEffect, useState } from 'react';
import queries from './queries';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

interface Row {
  id: string;
  name: string;
  data: string;
}

interface QueryResults {
  [key: `$${string}`]: object;
}

const queryKeys = [
  { key: '$eq', model: 'product' },
  { key: '$gt', model: 'product' },
  { key: '$gte', model: 'product' },
  { key: '$in', model: 'contact-record' },
  { key: '$lt', model: 'product' },
  { key: '$lte', model: 'product' },
  { key: '$ne', model: 'contact-record' },
  { key: '$nin', model: 'contact-record' },
  { key: '$and', model: 'product' },
  { key: '$not', model: 'contact-record' },
  { key: '$or', model: 'contact-record' },
  { key: '$nor', model: 'product' },
  { key: '$exists', model: 'contact-record' },
  { key: '$type', model: 'contact-record' },
  { key: '$elemMatch', model: 'contact-record' },
  { key: '$regex', model: 'contact-record' },
  { key: '$options', model: 'contact-record' },
];

export default function QueryCheatsheet() {
  const [queryResults, setQueryResults] = useState(
    queryKeys.reduce(
      (acc, query) => ({ ...acc, [query.key]: {} }),
      {}
    ) as QueryResults
  );

  useEffect(() => {
    function fetchContent() {
      // Array of requests
      const requests = queryKeys.map((query) => {
        const { key, model } = query;
        const queryFn = queries[key as keyof typeof queries];
        return queryFn({
          model,
          sort: { name: 1 },
          apiKey: BUILDER_API_KEY,
        }).then((val) => ({ [key]: val }));
      });

      return Promise.all(requests).then((response) => {
        const results = response.reduce((acc: object, query: object) => {
          return { ...acc, ...query };
        }, {});
        setQueryResults(results as QueryResults);
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
