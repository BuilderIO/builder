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
      <render-blocks
        path="children"
        v-if="componentInfo.canHaveChildren && useBlock.children"
        :blocks="useBlock.children"
      ></render-blocks>

      <render-block
        v-for="(child, index) in !componentInfo.canHaveChildren
          ? useBlock.children
          : []"
        :block="child"
        :key="index"
      ></render-block>
    </component>

    <render-blocks
      path="children"
      v-if="!componentRef && componentInfo.canHaveChildren && useBlock.children"
      :blocks="useBlock.children"
    ></render-blocks>

    <render-block
      v-for="(child, index) in !componentRef && !componentInfo.canHaveChildren
        ? useBlock.children
        : []"
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
    <render-blocks
      path="children"
      v-if="componentInfo.canHaveChildren && useBlock.children"
      :blocks="useBlock.children"
    ></render-blocks>

    <render-block
      v-for="(child, index) in !componentInfo.canHaveChildren
        ? useBlock.children
        : []"
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
import RenderBlocks from './render-blocks';

export default {
  name: 'render-block',
  components: {
    'render-blocks': async () => RenderBlocks,
    'block-styles': async () => BlockStyles,
  },
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
  },
};
</script>
