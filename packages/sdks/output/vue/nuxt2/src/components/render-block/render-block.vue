<template>
  <component
    v-bind="attributes"
    v-if="!isEmptyHtmlElement(tagName)"
    :is="tagName"
  >
    <render-component-and-styles
      :block="useBlock"
      :blockChildren="children"
      :componentRef="componentRef"
      :componentOptions="componentOptions"
    ></render-component-and-styles>
    <render-block
      v-for="(child, index) in noCompRefChildren"
      :block="child"
      :key="child.id"
    ></render-block>
  </component>
  <component v-bind="attributes" v-else="" :is="tagName"></component>

  <render-component-and-styles
    v-else=""
    :block="useBlock"
    :blockChildren="children"
    :componentRef="componentRef"
    :componentOptions="componentOptions"
  ></render-component-and-styles>
</template>
<script>
import BuilderContext from "../../context/builder.context";
import { getBlockActions } from "../../functions/get-block-actions.js";
import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
import { getBlockProperties } from "../../functions/get-block-properties.js";
import { getBlockStyles } from "../../functions/get-block-styles.js";
import { getBlockTag } from "../../functions/get-block-tag.js";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import { isEmptyHtmlElement } from "./render-block.helpers.js";
import RenderComponentAndStyles from "./render-component-and-styles";

export default {
  name: "render-block",
  components: {
    "render-component-and-styles": async () => RenderComponentAndStyles,
  },
  props: ["block"],

  data: () => ({ isEmptyHtmlElement }),

  inject: {
    builderContext: "BuilderContext",
  },

  computed: {
    component() {
      const componentName = this.useBlock.component?.name;

      if (!componentName) {
        return null;
      }

      const ref = this.builderContext.registeredComponents[componentName];

      if (!ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
        return undefined;
      } else {
        return ref;
      }
    },
    componentInfo() {
      if (this.component) {
        const { component: _, ...info } = this.component;
        return info;
      } else {
        return undefined;
      }
    },
    componentRef() {
      return this.component?.component;
    },
    tagName() {
      return getBlockTag(this.useBlock);
    },
    useBlock() {
      return getProcessedBlock({
        block: this.block,
        state: this.builderContext.state,
        context: this.builderContext.context,
      });
    },
    attributes() {
      return {
        ...getBlockProperties(this.useBlock),
        ...getBlockActions({
          block: this.useBlock,
          state: this.builderContext.state,
          context: this.builderContext.context,
        }),
        style: getBlockStyles(this.useBlock),
      };
    },
    shouldWrap() {
      return !this.componentInfo?.noWrap;
    },
    componentOptions() {
      return {
        ...getBlockComponentOptions(this.useBlock),

        /**
         * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
         * they are provided to the component itself directly.
         */
        ...(this.shouldWrap
          ? {}
          : {
              attributes: this.attributes,
            }),
      };
    },
    children() {
      // TO-DO: When should `canHaveChildren` dictate rendering?
      // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
      // but still receive and need to render children.
      // return this.componentInfo?.canHaveChildren ? this.useBlock.children : [];
      return this.useBlock.children ?? [];
    },
    noCompRefChildren() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`
       */
      return this.componentRef ? [] : this.children;
    },
  },
};
</script>
