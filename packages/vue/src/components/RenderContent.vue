<template>
  <div @click="onClick" v-if="!isEditing" v-html="html"></div>
</template>

<script>
import { builder, Builder } from '@builder.io/sdk';

const NAVIGATION_TIMEOUT_DEFAULT = 1000;

function delay(duration, resolveValue) {
  return new Promise(resolve => setTimeout(() => resolve(resolveValue), duration));
}

export default {
  name: 'RenderContent',

  data: () => ({
    isEditing: Builder.isEditing,
    fetchInitialized: false,
    content: null,
  }),

  computed: {
    html() {
      if (this.isEditing || Builder.isEditing) {
        // Editing component
        return `<builder-component api-key="${builder.apiKey}" prerender="false" model="${
          this.model
        }" options='${JSON.stringify(this.options || {}).replace(/'/g, '&apos;')}'>`;
      }

      return this.content && this.content.data.html;
    },
  },

  props: {
    model: {
      required: true,
      type: String,
    },
    options: {
      required: false,
      type: Object,
    },
    // Don't handle routing automatically with this.$router.push() for link
    // clicks and leave to the browser/you to handle
    nativeRouting: {
      required: false,
      type: Boolean,
    },
  },

  created() {
    if (Builder.isEditing) {
      this.isEditing = true;
      this.loadEditScript();
    }
    if (!this.fetchInitialized && !this.content) {
      this.getContent();
    }
  },

  methods: {
    // Handle routing client side from link clicks
    async onClick(event) {
      if (this.nativeRouting || !this.$router) {
        return;
      }
      if (event.button !== 0 || event.ctrlKey || event.defaultPrevented) {
        // If this is a non-left click, or the user is holding ctr/cmd, or the url is absolute,
        // or if the link has a target attribute, don't route on the client and let the default
        // href property handle the navigation
        return;
      }

      const hrefTarget = this.findHrefTarget(event);
      if (!hrefTarget) {
        return;
      }

      // target="_blank" or target="_self" etc
      if (hrefTarget.target) {
        return;
      }

      let href = hrefTarget.getAttribute('href');
      if (!href) {
        return;
      }

      if (href.startsWith('javascript:')) {
        return;
      }

      if (event.metaKey) {
        return;
      }

      if (!this.isRelative(href)) {
        const converted = this.convertToRelative(href);
        if (converted) {
          href = converted;
        } else {
          return;
        }
      }

      // Otherwise if this url is relative, navigate on the client
      event.preventDefault();

      // Attempt to route on the client
      let success = null;
      const routePromise = this.$router.push(href);

      const useNavigationTimeout = !(
        typeof this.navigationTimeout === 'boolean' && !this.navigationTimeout
      );
      const timeoutPromise = delay(
        typeof this.navigationTimeout === 'number'
          ? this.navigationTimeout
          : NAVIGATION_TIMEOUT_DEFAULT,
        false
      );

      try {
        const promiseRace = useNavigationTimeout ? [timeoutPromise, routePromise] : [routePromise];
        success = await Promise.race(promiseRace);
      } finally {
        // This is in a click handler so it will only run on the client
        if (success) {
          // If successful scroll the window to the top
          // TODO: add back if needed
          // window.scrollTo(0, 0);
        } else {
          // Otherwise handle the routing with a page refresh on failure. Angular, by deafult
          // if it fails to load a URL (e.g. if an API request failed when loading it), instead
          // of navigating to the new page to tell the user that their click did something but
          // the resulting page has an issue, it instead just silently fails and shows the user
          // nothing. Lets make sure we route to the new page. In some cases this even brings the
          // user to a correct and valid page anyway
          location.href = `${location.protocol}//${location.host}${href}`;
        }
      }
    },
    async getContent() {
      // For Nuxt - flag to know if the fetch hook ran
      this.fetchInitialized = true;
      try {
        const content = await builder.get(this.model, this.options).promise();
        this.content = content;
        this.$emit('contentLoaded', content);
      } catch (error) {
        this.$emit('contentError', error);
      }
    },
    isRelative(href) {
      return !href.match(/^(\/\/|https?:\/\/)/i);
    },
    convertToRelative(href) {
      const currentUrl = new URL(location.href);
      const hrefUrl = new URL(href);

      if (currentUrl.host === hrefUrl.host) {
        const relativeUrl = hrefUrl.pathname + (hrefUrl.search ? hrefUrl.search : '');
        return relativeUrl;
      }
    },
    loadEditScript() {
      const editJsSrc = 'https://cdn.builder.io/js/webcomponents';
      if (!(window.BuilderWC || document.querySelector(`script[src="${editJsSrc}"]`))) {
        const script = document.createElement('script');
        script.src = editJsSrc;
        script.async = true;
        document.body.appendChild(script);
      }
    },
    findHrefTarget(event) {
      let element = event.target;

      while (element) {
        if (element instanceof HTMLAnchorElement && element.getAttribute('href')) {
          return element;
        }

        if (element === event.currentTarget) {
          break;
        }

        element = element.parentElement;
      }

      return null;
    },
  },

  // For nuxt support
  async fetch() {
    await this.getContent();
  },
};
</script>
