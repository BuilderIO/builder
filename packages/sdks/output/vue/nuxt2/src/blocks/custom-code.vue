<template>
  <div
    ref="elem"
    :class="
      _classStringToObject(
        'builder-custom-code' + (this.replaceNodes ? ' replace-nodes' : '')
      )
    "
    v-html="code"
  ></div>
</template>
<script>
export default {
  name: "builder-custom-code",

  props: ["replaceNodes", "code"],

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
              console.warn("`CustomCode`: Error running script:", error);
            }
          }
        }
      }
    },
    _classStringToObject(str) {
      const obj = {};
      if (typeof str !== "string") {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
};
</script>
