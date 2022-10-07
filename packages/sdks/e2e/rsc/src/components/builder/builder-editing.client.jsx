import {getBuilderEditing} from '@builder.io/sdk-react/rsc';
import {CUSTOM_COMPONENTS} from '../../routes/builder-demo.server'

export const BuilderEditing = getBuilderEditing({
  components: CUSTOM_COMPONENTS,
  onUpdate: (content) => {
    // On update, post to the server to be able to serve the latest draft
    // in real time
    fetch('/api/builderData', {
      body: JSON.stringify(content),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(() => {
      const current = new URL(window.location.href);
      current.searchParams.set('v', String(Date.now()));
      navigate(current.pathname + current.search, {
        scroll: false,
      });
    });
  },
});
