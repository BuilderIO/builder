import { useIsPreviewing } from '@builder.io/react';

export default function FourOhFour() {
  const isPreviewing = useIsPreviewing();
  console.log('isPreviewing', isPreviewing);
  return <div>404</div>;
}
