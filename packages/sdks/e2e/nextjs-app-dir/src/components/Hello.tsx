'use client';
import * as React from 'react';
import { useState } from 'react';

function Hello(props) {
  const [name, setName] = useState(() => 'World');

  return <div>hello {name}</div>;
}

export default Hello;
