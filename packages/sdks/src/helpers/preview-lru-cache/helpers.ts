import { logger } from '../logger';

export const getIdFromSearchParams = (searchParams: URLSearchParams) => {
  const previewedModel = searchParams.get('preview');
  const previewedId = searchParams.get('overrides.' + previewedModel);

  if (!previewedId) {
    logger.warn('No previewed ID found in search params.');
  }

  return previewedId;
};
