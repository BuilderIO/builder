<template>
  <template v-if="canShowBlock">
    <BlockStyles :block="processedBlock" :context="context"></BlockStyles>

    <template v-if="!blockComponent?.noWrap">
      <template v-if="!repeatItem">
        <BlockWrapper :Wrapper="Tag" :block="processedBlock" :context="context"
          ><ComponentRef
            :componentRef="componentRefProps.componentRef"
            :componentOptions="componentRefProps.componentOptions"
            :blockChildren="componentRefProps.blockChildren"
            :context="componentRefProps.context"
            :registeredComponents="componentRefProps.registeredComponents"
            :linkComponent="componentRefProps.linkComponent"
            :builderBlock="componentRefProps.builderBlock"
            :includeBlockProps="componentRefProps.includeBlockProps"
            :isInteractive="componentRefProps.isInteractive"
          ></ComponentRef
          ><template
            :key="child.id"
            v-for="(child, index) in childrenWithoutParentComponent"
          >
            <Block
              :block="child"
              :registeredComponents="registeredComponents"
              :linkComponent="linkComponent"
              :context="context"
            ></Block> </template
        ></BlockWrapper>
      </template>

      <template v-else>
        <template :key="index" v-for="(data, index) in repeatItem">
          <RepeatedBlock
            :repeatContext="data.context"
            :block="data.block"
            :registeredComponents="registeredComponents"
            :linkComponent="linkComponent"
          ></RepeatedBlock>
        </template>
      </template>
    </template>

    <template v-else>
      <ComponentRef
        :componentRef="componentRefProps.componentRef"
        :componentOptions="componentRefProps.componentOptions"
        :blockChildren="componentRefProps.blockChildren"
        :context="componentRefProps.context"
        :registeredComponents="componentRefProps.registeredComponents"
        :linkComponent="componentRefProps.linkComponent"
        :builderBlock="componentRefProps.builderBlock"
        :includeBlockProps="componentRefProps.includeBlockProps"
        :isInteractive="componentRefProps.isInteractive"
      ></ComponentRef>
    </template>
  </template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';

import { TARGET } from '../../constants/target';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types';
import { getBlockComponentOptions } from '../../functions/get-block-component-options';
import { getProcessedBlock } from '../../functions/get-processed-block';
import { isPreviewing } from '../../server-index';
import type { BuilderBlock } from '../../types/builder-block';
const DynamicDiv = () =>
  import('../dynamic-div.vue')
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        'Error while attempting to dynamically import component DynamicDiv at ../dynamic-div.vue',
        err
      );
      throw err;
    });
import { bindAnimations } from './animator';
import {
  getComponent,
  getInheritedStyles,
  getRepeatItemData,
  provideBuilderBlock,
  provideBuilderContext,
  provideLinkComponent,
  provideRegisteredComponents,
} from './block.helpers';
const BlockStyles = () =>
  import('./components/block-styles.vue')
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        'Error while attempting to dynamically import component BlockStyles at ./components/block-styles.vue',
        err
      );
      throw err;
    });
const BlockWrapper = () =>
  import('./components/block-wrapper.vue')
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        'Error while attempting to dynamically import component BlockWrapper at ./components/block-wrapper.vue',
        err
      );
      throw err;
    });
import type { ComponentProps } from './components/component-ref/component-ref.helpers';
const ComponentRef = () =>
  import('./components/component-ref/component-ref.vue')
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        'Error while attempting to dynamically import component ComponentRef at ./components/component-ref/component-ref.vue',
        err
      );
      throw err;
    });
const RepeatedBlock = () =>
  import('./components/repeated-block.vue')
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        'Error while attempting to dynamically import component RepeatedBlock at ./components/repeated-block.vue',
        err
      );
      throw err;
    });

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
  linkComponent: any;
};

export default defineComponent({
  name: 'block',
  components: {
    BlockStyles: defineAsyncComponent(BlockStyles),
    ComponentRef: defineAsyncComponent(ComponentRef),
    RepeatedBlock: defineAsyncComponent(RepeatedBlock),
    BlockWrapper: defineAsyncComponent(BlockWrapper),
    DynamicDiv: defineAsyncComponent(DynamicDiv),
  },
  props: ['block', 'registeredComponents', 'context', 'linkComponent'],

  data() {
    return {
      _processedBlock: {
        value: null as BuilderBlock | null,
        update: false,
      },
    };
  },

  mounted() {
    const blockId = this.processedBlock.id;
    const animations = this.processedBlock.animations;
    if (animations && blockId) {
      bindAnimations(
        animations.map((animation) => ({
          ...animation,
          elementId: blockId,
        }))
      );
    }
  },

  // beforeUpdate() {
  //   console.log('beforeUpdate');
  //   // if (this.processedBlock && !isPreviewing()) {
  //   //   return;
  //   // }
  //   this.processedBlock = this.block.repeat?.collection
  //     ? this.block
  //     : getProcessedBlock({
  //         block: this.block,
  //         localState: this.context.localState,
  //         rootState: this.context.rootState,
  //         rootSetState: this.context.rootSetState,
  //         context: this.context.context,
  //         shouldEvaluateBindings: true,
  //       });
  // },
  // updated() {
  //   // console.log('updated');

  //   this.processedBlock = this.block.repeat?.collection
  //     ? this.block
  //     : getProcessedBlock({
  //         block: this.block,
  //         localState: this.context.localState,
  //         rootState: this.context.rootState,
  //         rootSetState: this.context.rootSetState,
  //         context: this.context.context,
  //         shouldEvaluateBindings: true,
  //       });
  // },
  watch: {
    onUpdateHook0: {
      handler() {
        this._processedBlock.update = true;
      },
      immediate: true,
    },
    // onUpdateHook0: {
    //   // deep: true,
    //   handler() {
    //     console.log('onUpdateHook0');
    //     // if (this.processedBlock && !isPreviewing()) {
    //     //   return;
    //     // }
    //     this.processedBlock = this.block.repeat?.collection
    //       ? this.block
    //       : getProcessedBlock({
    //           block: this.block,
    //           localState: this.context.localState,
    //           rootState: this.context.rootState,
    //           rootSetState: this.context.rootSetState,
    //           context: this.context.context,
    //           shouldEvaluateBindings: true,
    //         });
    //   },
    //   immediate: true,
    // },
  },

  computed: {
    processedBlock() {
      if (
        this._processedBlock.value &&
        !this._processedBlock.update &&
        !isPreviewing()
      ) {
        console.log('skipping recompute for:', this._processedBlock.value);
        return this._processedBlock.value;
      }
      const blockToUse = this.block.repeat?.collection
        ? this.block
        : getProcessedBlock({
            block: this.block,
            localState: this.context.localState,
            rootState: this.context.rootState,
            rootSetState: this.context.rootSetState,
            context: this.context.context,
            shouldEvaluateBindings: true,
          });
      this._processedBlock.value = blockToUse;
      this._processedBlock.update = false;
      return blockToUse;
    },
    blockComponent() {
      return getComponent({
        block: this.processedBlock,
        registeredComponents: this.registeredComponents,
      });
    },
    repeatItem() {
      return getRepeatItemData({
        block: this.block,
        context: this.context,
      });
    },
    Tag() {
      const shouldUseLink =
        this.block.tagName === 'a' ||
        this.processedBlock.properties?.href ||
        this.processedBlock.href;
      if (shouldUseLink) {
        return this.linkComponent || 'a';
      }
      return this.block.tagName || 'div';
    },
    canShowBlock() {
      if (this.block.repeat?.collection) {
        if (this.repeatItem?.length) return true;
        return false;
      }
      const shouldHide =
        'hide' in this.processedBlock ? this.processedBlock.hide : false;
      const shouldShow =
        'show' in this.processedBlock ? this.processedBlock.show : true;
      return shouldShow && !shouldHide;
    },
    childrenWithoutParentComponent() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`.
       * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
       * blocks, and the children will be repeated within those blocks.
       */
      const shouldRenderChildrenOutsideRef =
        !this.blockComponent?.component && !this.repeatItem;
      return shouldRenderChildrenOutsideRef
        ? this.processedBlock.children ?? []
        : [];
    },
    componentRefProps() {
      return {
        blockChildren: this.processedBlock.children ?? [],
        componentRef: this.blockComponent?.component,
        componentOptions: {
          ...getBlockComponentOptions(this.processedBlock),
          ...provideBuilderBlock(this.blockComponent, this.processedBlock),
          ...provideBuilderContext(this.blockComponent, this.context),
          ...provideLinkComponent(this.blockComponent, this.linkComponent),
          ...provideRegisteredComponents(
            this.blockComponent,
            this.registeredComponents
          ),
        },
        context: this.context,
        linkComponent: this.linkComponent,
        registeredComponents: this.registeredComponents,
        builderBlock: this.processedBlock,
        includeBlockProps: this.blockComponent?.noWrap === true,
        isInteractive: !(this.blockComponent?.isRSC && TARGET === 'rsc'),
      };
    },
    onUpdateHook0() {
      const out = {
        0: this.block,
        1: this.context.localState,
        2: this.context.rootState,
        4: this.context.context,
        k: this.context.rootState.reactiveValue,
      };
      // console.log('onUpdateHook0 computed', out);
      return JSON.stringify(out);
    },
  },
});
</script>
