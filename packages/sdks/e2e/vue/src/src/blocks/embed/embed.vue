<template>
  <div class="builder-embed" ref="elem" v-html="content"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isJsScript } from "./helpers";

export interface EmbedProps {
  content: string;
}

export default defineComponent({
  name: "builder-embed",

  props: ["content"],

  data() {
    return { scriptsInserted: [], scriptsRun: [], ranInitFn: false };
  },

  watch: {
    onUpdateHook0: {
      handler() {
        if (this.$refs.elem && !this.ranInitFn) {
          this.ranInitFn = true;
          this.findAndRunScripts();
        }
      },
      immediate: true,
    },
  },

  computed: {
    onUpdateHook0() {
      return {
        0: this.$refs.elem,
        1: this.ranInitFn,
      };
    },
  },

  methods: {
    findAndRunScripts() {
      if (!this.$refs.elem || !this.$refs.elem.getElementsByTagName) return;
      const scripts = this.$refs.elem.getElementsByTagName("script");
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src && !this.scriptsInserted.includes(script.src)) {
          this.scriptsInserted.push(script.src);
          const newScript = document.createElement("script");
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else if (
          isJsScript(script) &&
          !this.scriptsRun.includes(script.innerText)
        ) {
          try {
            this.scriptsRun.push(script.innerText);
            new Function(script.innerText)();
          } catch (error) {
            console.warn("`Embed`: Error running script:", error);
          }
        }
      }
    },
  },
});
</script>