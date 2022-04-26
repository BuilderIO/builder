<template>
  <div class="builder-embed" ref="elem" v-html="content"></div>
</template>
<script>
export default {
  name: "builder-embed",

  props: ["content"],

  data: () => ({ scriptsInserted: [], scriptsRun: [] }),

  mounted() {
    this.findAndRunScripts();
  },

  methods: {
    findAndRunScripts() {
      // TODO: Move this function to standalone one in '@builder.io/utils'
      if (this.$refs.elem && typeof window !== "undefined") {
        /** @type {HTMLScriptElement[]} */
        const scripts = this.$refs.elem.getElementsByTagName("script");

        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];

          if (script.src) {
            if (this.scriptsInserted.includes(script.src)) {
              continue;
            }

            this.scriptsInserted.push(script.src);
            const newScript = document.createElement("script");
            newScript.async = true;
            newScript.src = script.src;
            document.head.appendChild(newScript);
          } else if (
            !script.type ||
            [
              "text/javascript",
              "application/javascript",
              "application/ecmascript",
            ].includes(script.type)
          ) {
            if (this.scriptsRun.includes(script.innerText)) {
              continue;
            }

            try {
              this.scriptsRun.push(script.innerText);
              new Function(script.innerText)();
            } catch (error) {
              console.warn("`Embed`: Error running script:", error);
            }
          }
        }
      }
    },
  },
};
</script>
