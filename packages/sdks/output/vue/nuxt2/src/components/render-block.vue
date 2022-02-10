<template>
  <component
    v-bind="propertiesAndActions"
    v-if="!(componentInfo && componentInfo.noWrap)"
    :style="css"
    :is="tagName"
  >
    <block-styles :block="useBlock"></block-styles>

    <component
      v-bind="componentOptions"
      v-if="componentRef"
      :builderBlock="useBlock"
      :is="componentRef"
    >
      <render-block
        v-for="(child, index) in children"
        :block="child"
        :key="index"
      ></render-block>
    </component>

    <render-block
      v-for="(child, index) in noCompRefChildren"
      :block="child"
      :key="index"
    ></render-block>
  </component>
  <component
    v-bind="componentOptions"
    v-else=""
    :attributes="propertiesAndActions"
    :builderBlock="useBlock"
    :style="css"
    :is="componentRef"
  >
    <render-block
      v-for="(child, index) in children"
      :block="child"
      :key="index"
    ></render-block>
  </component>
</template>
<script>
import { getBlockComponentOptions } from '../functions/get-block-component-options';
import { getBlockProperties } from '../functions/get-block-properties';
import { getBlockStyles } from '../functions/get-block-styles';
import { getBlockTag } from '../functions/get-block-tag';
import { components } from '../functions/register-component';
import BuilderContext from '../context/builder.context';
import { getBlockActions } from '../functions/get-block-actions';
import { getProcessedBlock } from '../functions/get-processed-block';
import BlockStyles from './block-styles';

export default {
  name: 'render-block',
  components: { 'block-styles': async () => BlockStyles },
  props: ['block'],

  inject: {
    builderContext: 'BuilderContext',
  },

  computed: {
    component() {
      const componentName = this.useBlock.component?.name;

      if (!componentName) {
        return null;
      }

      const ref = components[this.useBlock.component?.name];

      if (componentName && !ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
      }

      return ref;
    },
    componentInfo() {
      return this.component?.info;
    },
    componentRef() {
      return this.component?.component;
    },
    tagName() {
      return getBlockTag(this.useBlock);
    },
    properties() {
      return getBlockProperties(this.useBlock);
    },
    useBlock() {
      return getProcessedBlock({
        block: this.block,
        state: this.builderContext.state,
        context: this.builderContext.context,
      });
    },
    propertiesAndActions() {
      return { ...this.properties, ...this.actions };
    },
    actions() {
      return getBlockActions({
        block: this.useBlock,
        state: this.builderContext.state,
        context: this.builderContext.context,
      });
    },
    css() {
      return getBlockStyles(this.useBlock);
    },
    componentOptions() {
      return getBlockComponentOptions(this.useBlock);
    },
    children() {
      // TO-DO: When should `canHaveChildren` dictate rendering?
      // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
      // but still receive and need to render children.
      // return this.componentInfo?.canHaveChildren ? this.useBlock.children : [];
      return this.useBlock.children ?? [];
    },
    noCompRefChildren() {
      return this.componentRef ? [] : this.children;
    },
  },
};
</script>
