import React from 'react';

export const NothingToSelect = ({ name }: { name: string }) => {
  return <div data-testid="NOTHING_TO_SELECT">{`No ${name} to select`}</div>;
};
