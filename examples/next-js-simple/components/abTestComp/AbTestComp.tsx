import { builder, Builder, BuilderContent, useIsPreviewing } from '@builder.io/react';
import { useEffect, useState } from 'react';

export const AbTestComp = (props:any) => {
  const isPreviewingInBuilder = useIsPreviewing();
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState({});
  // builder.apiVersion = "v3";
  console.log('PROPS: ', props)
  useEffect(() => {
    async function fetchContent() {

      const content = await builder
        .get('author', {
          query: {
            id: props?.author?.id
          }
        })
        .promise();

      setContent(content);
      setNotFound(!content);
      console.log('CONTENT: ', content)
    }
    fetchContent();

  }, []);
  
  if (notFound && !isPreviewingInBuilder) {
    return <div>NO DATA</div>
  }
  console.log('CONTENT BEFORE RETURN ', content)
  return (
    <BuilderContent model="author" >{ (data, loading, fullContent) => {
        console.log('CONTENT INSIDE RETURN: ', data, loading, fullContent, content)
        return (
          <>
            <div>
              {data?.name || 'helllo'}
            </div>
          </>
        )
      }}
    </BuilderContent>
  )
 };



Builder.registerComponent(AbTestComp, {
  name: 'A/B Test Comp',
  inputs: [
    {
      name: 'title',
      type: 'text',
    }, 
    {
      name: 'author',
      type: 'reference',
      model: 'author'
    }
  ]
});

