import { builder } from '@builder.io/sdk';
import { getContentWithAllReferences } from './get-all-content-with-refs';

test('Adds async props', async () => {
  
  const content = await getContentWithAllReferences(builder, 'page', { url: '/' });
  
  
});
