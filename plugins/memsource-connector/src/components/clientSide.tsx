import React, { useEffect, useState } from 'react';

export default ({ children }: any) => {
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => setClientSide(true), []);

  return clientSide ? children : <></>;
};
