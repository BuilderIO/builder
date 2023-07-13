<template>
  <template v-if="canShowBlock">
    <template v-if="!component?.noWrap">
      <template v-if="isEmptyHtmlElement(Tag)">
        <component
          :is="Tag"
          v-bind="attributes"
          v-on="stripVOn(actions)"
        ></component>
      </template>

      <template v-if="!isEmptyHtmlElement(Tag) && repeatItem">
        <template :key="index" v-for="(data, index) in repeatItem">
          <render-repeated-block
            :repeatContext="data.context"
            :block="data.block"
          ></render-repeated-block>
        </template>
      </template>

      <template v-if="!isEmptyHtmlElement(Tag) && !repeatItem">
        <component :is="Tag" v-bind="attributes" v-on="stripVOn(actions)">
          <render-component v-bind="renderComponentProps"></render-component>

          <template
            :key="'render-block-' + child.id"
            v-for="(child, index) in childrenWithoutParentComponent"
          >
            <render-block
              :block="child"
              :context="childrenContext"
            ></render-block>
          </template>
          <template
            :key="'block-style-' + child.id"
            v-for="(child, index) in childrenWithoutParentComponent"
          >
            <block-styles
              :block="child"
              :context="childrenContext"
            ></block-styles>
          </template>
        </component>
      </template>
    </template>

    <template v-else>
      <render-component v-bind="renderComponentProps"></render-component>
    </template>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import type { BuilderContextInterface } from "../../context/types.js";
import { getBlockActions } from "../../functions/get-block-actions.js";
import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
import { getBlockProperties } from "../../functions/get-block-properties.js";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import type { BuilderBlock } from "../../types/builder-block.js";
import BlockStyles from "./block-styles.vue";
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from "./render-block.helpers.js";
import type { RenderComponentProps } from "./render-component.vue";
import RenderRepeatedBlock from "./render-repeated-block.vue";
import { TARGET } from "../../constants/target.js";
import { extractTextStyles } from "../../functions/extract-text-styles.js";
import RenderComponent from "./render-component.vue";
import { getReactNativeBlockStyles } from "../../functions/get-react-native-block-styles.js";

export type RenderBlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

export default defineComponent({
  name: "render-block",
  components: {
    RenderComponent: RenderComponent,
    RenderRepeatedBlock: RenderRepeatedBlock,
    BlockStyles: BlockStyles,
  },
  props: ["block", "context"],

  data() {
    return {
      component: getComponent({
        block: this.block,
        context: this.context,
      }),
      Tag: this.block.tagName || "div",
      childrenContext: this.context,
      isEmptyHtmlElement,
    };
  },

  computed: {
    repeatItem() {
      return getRepeatItemData({
        block: this.block,
        context: this.context,
      });
    },
    useBlock() {
      return this.repeatItem
        ? this.block
        : getProcessedBlock({
            block: this.block,
            localState: this.context.localState,
            rootState: this.context.rootState,
            rootSetState: this.context.rootSetState,
            context: this.context.context,
            shouldEvaluateBindings: true,
          });
    },
    canShowBlock() {
      if ("hide" in this.useBlock) {
        return !this.useBlock.hide;
      }
      if ("show" in this.useBlock) {
        return this.useBlock.show;
      }
      return true;
    },
    actions() {
      return getBlockActions({
        block: this.useBlock,
        rootState: this.context.rootState,
        rootSetState: this.context.rootSetState,
        localState: this.context.localState,
        context: this.context.context,
      });
    },
    attributes() {
      const blockProperties = getBlockProperties(this.useBlock);
      return {
        ...blockProperties,
        ...(TARGET === "reactNative"
          ? {
              style: getReactNativeBlockStyles({
                block: this.useBlock,
                context: this.context,
                blockStyles: blockProperties.style,
              }),
            }
          : {}),
      };
    },
    childrenWithoutParentComponent() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`.
       * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
       * blocks, and the children will be repeated within those blocks.
       */
      const shouldRenderChildrenOutsideRef =
        !this.component?.component && !this.repeatItem;
      return shouldRenderChildrenOutsideRef ? this.useBlock.children ?? [] : [];
    },
    renderComponentProps() {
      return {
        blockChildren: this.useBlock.children ?? [],
        componentRef: this.component?.component,
        componentOptions: {
          ...getBlockComponentOptions(this.useBlock),
          /**
           * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
           * they are provided to the component itself directly.
           */
          ...(!this.component?.noWrap
            ? {}
            : {
                attributes: {
                  ...this.attributes,
                  ...this.actions,
                },
              }),
        },
        context: this.childrenContext,
      };
    },
  },

  methods: {
    stripVOn: function stripVOn(actions = {}) {
      return Object.keys(actions).reduce(
        (acc, attr) => ({
          ...acc,
          [attr.replace("v-on:", "")]: actions[attr],
        }),
        {}
      );
    },
  },
});
</script>