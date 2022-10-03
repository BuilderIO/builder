import { Builder, builder } from '@builder.io/sdk';
import { getContentWithAllReferences } from './get-all-content-with-refs';

// mock builder and the test should for expecting specific calledWith arguments

// await getContentWithAllReferences(mockeBuilder, 'page', {
//    url: '/'
// });

// expect(mockedBuilder).tocalle get with {url: / }, and respond with a conten with reference
// expect { query: { id: reference.id }} and send the reference object in mocked call
// check if the reference object is inside the content 

test('Adds async props', async () => {

  const mockBuilder = jest.fn(async () => ({
    get: jest.fn(async (model: string, options) => {
      
    })
  }))
  
  const bInstance = await mockBuilder();

  // @ts-ignore-next-line
  await getContentWithAllReferences(bInstance, 'page', { includeRefs: true })

  expect(bInstance.get).toBeCalledWith('page', { includeRefs: true });


  
  
});
