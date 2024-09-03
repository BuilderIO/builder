<template>
  <div
    ref="elementRef"
    :class="'builder-custom-code' + (replaceNodes ? ' replace-nodes' : '')"
    v-html="code"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
}

export default defineComponent({
  name: "builder-custom-code",

  props: ["replaceNodes", "code"],

  data() {
    return { scriptsInserted: [], scriptsRun: [] };
  },

  mounted() {
    // TODO: Move this function to standalone one in '@builder.io/utils'
    if (
      !this.$refs.elementRef?.getElementsByTagName ||
      typeof window === "undefined"
    ) {
      return;
    }
    const scripts = this.$refs.elementRef.getElementsByTagName("script");
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
  },
});
</script>