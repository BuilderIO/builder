import { GetContentOptions } from '@builder.io/sdk';
import { getContentWithAllReferences } from './get-all-content-with-refs';


test('Gets deep references on a model passed', async () => {

  const returnSample = {
    "name":"home",
    "lastUpdatedBy":"IqzTkBgwWTbzaXDAhTL6IpwiCah1",
    "lastUpdated":1664826242499,
    "variations":{
       
    },
    "query":[
       {
          "operator":"is",
          "@type":"@builder.io/core:Query",
          "value":"/",
          "property":"urlPath"
       }
    ],
    "modelId":"767e51acd9cd41638c78e8916924a8fb",
    "firstPublished":1661750367770,
    "published":"published",
    "id":"8be720ec67f142508a03a64e777b761a",
    "createdDate":1661750062934,
    "createdBy":"IqzTkBgwWTbzaXDAhTL6IpwiCah1",
    "testRatio":1,
    "data":{
       "title":"home",
       "inputs":[
          
       ],
       "themeId":false,
       "colors":{
          "model":"color-collection",
          "@type":"@builder.io/core:Reference",
          "id":"740c91c542b047e3965e2c0985cea3f4",
          "value":{
             "lastUpdatedBy":"4FFFg0MNRJT0z0nW4uUizDHfHJV2",
             "id":"740c91c542b047e3965e2c0985cea3f4",
             "firstPublished":1661880429435,
             "published":"published",
             "query":[
                
             ],
             "meta":{
                "kind":"data"
             },
             "createdBy":"4FFFg0MNRJT0z0nW4uUizDHfHJV2",
             "lastUpdated":1661880429436,
             "createdDate":1661880406126,
             "data":{
                "referencelist":[
                   {
                      "color":{
                         "@type":"@builder.io/core:Reference",
                         "model":"color",
                         "id":"49a879da897a43669a5c6f0aa2313ba2"
                      }
                   },
                   {
                      "color":{
                         "id":"937717f2eccd46b8b7e913225518d3eb",
                         "model":"color",
                         "@type":"@builder.io/core:Reference"
                      }
                   }
                ]
             },
             "name":"dark theme",
             "testRatio":1,
             "variations":{
                
             },
             "modelId":"20aeb14339df47beaca7af65f4d41736",
             "rev":"wy82y4h4xp"
          }
       },
       "blocks": [],
       "url":"/",
       "state":{
          "deviceSize":"large",
          "location":{
             "pathname":"/",
             "path":[
                ""
             ],
             "query":{
                
             }
          }
       }
    },
    "meta":{
       "lastPreviewUrl":"http://localhost:3000/?builder.space=eb8361ab94b54e9eada61cf581e4da4f&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=8be720ec67f142508a03a64e777b761a&builder.overrides.8be720ec67f142508a03a64e777b761a=8be720ec67f142508a03a64e777b761a",
       "kind":"page",
       "hasLinks":false,
       "needsHydration":true
    },
    "rev":"yli5ydrg3dj"
 }

  const mockBuilder = jest.fn(() => ({
    get: jest.fn((model: string, options: GetContentOptions) => {
      return ({
         toPromise: async () => returnSample
      })
    })

  }))
  
  const bInstance = mockBuilder();

  // @ts-ignore-next-line
  const result = await getContentWithAllReferences(bInstance, 'page', { includeRefs: true })

  await expect(bInstance.get).toBeCalledWith('page', { includeRefs: true });

  await expect(result.query.value).toBe('/')

  await expect(result.data.colors.value.data.referencelist).toBeDefined()

  await expect(result.data.colors.value.data.referencelist[0].color).toHaveProperty('id')

});
