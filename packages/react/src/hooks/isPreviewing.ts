import { useEffect, useState } from 'react';
import { Builder } from '@builder.io/sdk';

export function isPreviewing() {
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (Builder.isEditing || Builder.isPreviewing) {
      setIsPreviewing(true);
    }
  }, []);

  return isPreviewing;
}
