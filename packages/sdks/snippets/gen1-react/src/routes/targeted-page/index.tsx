import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FourOhFour from '../../components/404';

import customTargetingMultiRequest from './custom-targeting-multi-request';
import customTargetingRequest from './custom-targeting-request';
import desktopRequest from './desktop-request';
import loggedInRequest from './is-logged-in-request';
import mobileRequest from './mobile-request';
import noTargetRequest from './no-target-request';

const MODEL = 'targeted-page';
builder.init('ee9f13b4981e489a9a1209887695ef2b');

export default function TargetedPage() {
  const isPreviewingInBuilder = useIsPreviewing();
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState();
  const [searchParams] = useSearchParams();

  const fnMap: { [key: string]: any } = {
    desktop: desktopRequest,
    mobile: mobileRequest,
    'mens-fashion': customTargetingRequest,
    'multi-target': customTargetingMultiRequest,
    'is-logged-in': loggedInRequest,
  };

  useEffect(() => {
    async function fetchContent() {
      const target: string = searchParams.get('target') || '';
      const targetFn = target ? fnMap[target] : noTargetRequest;

      const content = await targetFn(MODEL, {
        url: window.location.pathname,
      });

      setContent(content);
      setNotFound(!content);

      if (content?.data.title) {
        document.title = content.data.title;
      }
    }
    fetchContent();
  }, [window.location.pathname]);

  if (notFound && !isPreviewingInBuilder) {
    return <FourOhFour />;
  }

  console.log('...', builder.getUserAttributes());

  return (
    <>
      <h1>Targeting Snippet</h1>
      <hr />
      <BuilderComponent model={MODEL} content={content} />
    </>
  );
}
