import { Content } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import customTargetingMultiRequest from './custom-targeting-multi-request';
import customTargetingRequest from './custom-targeting-request';
import desktopRequest from './desktop-request';
import loggedInRequest from './is-logged-in-request';
import mobileRequest from './mobile-request';
import noTargetRequest from './no-target-request';

const MODEL = 'targeted-page';
const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default function TargetedPage() {
  const [content, setContent] = useState();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fnMap: { [key: string]: any } = {
      desktop: desktopRequest,
      mobile: mobileRequest,
      'mens-fashion': customTargetingRequest,
      'multi-target': customTargetingMultiRequest,
      'is-logged-in': loggedInRequest,
    };

    async function fetchContent() {
      const options = {
        apiKey: BUILDER_API_KEY,
        model: MODEL,
      };
      const target: string = searchParams.get('target') || '';
      const targetFn = target ? fnMap[target] : noTargetRequest;
      const content = await targetFn(window.location.pathname, options);

      setContent(content);

      if (content?.data.title) {
        document.title = content.data.title;
      }
    }
    fetchContent();
  }, [searchParams]);

  return (
    <>
      <h1>Targeting Snippet</h1>
      <hr />
      <Content apiKey={BUILDER_API_KEY} model={MODEL} content={content} />
    </>
  );
}
