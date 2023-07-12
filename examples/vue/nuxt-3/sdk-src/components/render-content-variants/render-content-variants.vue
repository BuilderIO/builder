<template>
  <template v-if="shouldRenderVariants">
    <render-inlined-styles
      :id="`variants-styles-${content?.id}`"
      :styles="hideVariantsStyleString"
    ></render-inlined-styles>

    <component
      :id="`variants-script-${content?.id}`"
      v-html="variantScriptStr"
      :is="'script'"
    ></component>

    <template
      :key="variant.id"
      v-for="(variant, index) in getVariants(content)"
    >
      <render-content
        :content="variant"
        :apiKey="apiKey"
        :apiVersion="apiVersion"
        :canTrack="canTrack"
        :customComponents="customComponents"
        :hideContent="true"
        :parentContentId="content?.id"
        :isSsrAbTest="shouldRenderVariants"
      ></render-content>
    </template>
  </template>

  <render-content
    :model="model"
    :content="contentToRender"
    :apiKey="apiKey"
    :apiVersion="apiVersion"
    :canTrack="canTrack"
    :customComponents="customComponents"
    :classNameProp="`variant-${content?.id}`"
    :parentContentId="content?.id"
    :isSsrAbTest="shouldRenderVariants"
  ></render-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import {
  checkShouldRunVariants,
  getVariants,
  getVariantsScriptString,
} from "./helpers";
import RenderContent from "../render-content/render-content.vue";
import type { RenderContentProps } from "../render-content/render-content.types";
import { getDefaultCanTrack } from "../../helpers/canTrack";
import RenderInlinedStyles from "../render-inlined-styles.vue";
import { handleABTestingSync } from "../../helpers/ab-tests";

type VariantsProviderProps = RenderContentProps;

export default defineComponent({
  name: "render-content-variants",
  components: {
    RenderInlinedStyles: RenderInlinedStyles,
    RenderContent: RenderContent,
  },
  props: [
    "content",
    "canTrack",
    "apiKey",
    "apiVersion",
    "customComponents",
    "model",
  ],

  data() {
    return {
      variantScriptStr: getVariantsScriptString(
        getVariants(this.content).map((value) => ({
          id: value.id!,
          testRatio: value.testRatio,
        })),
        this.content?.id || ""
      ),
      shouldRenderVariants: checkShouldRunVariants({
        canTrack: getDefaultCanTrack(this.canTrack),
        content: this.content,
      }),
      hideVariantsStyleString: getVariants(this.content)
        .map((value) => `.variant-${value.id} { display: none; } `)
        .join(""),
      contentToRender: checkShouldRunVariants({
        canTrack: getDefaultCanTrack(this.canTrack),
        content: this.content,
      })
        ? this.content
        : handleABTestingSync({
            item: this.content,
            canTrack: getDefaultCanTrack(this.canTrack),
          }),
      getVariants,
    };
  },
});
</script>