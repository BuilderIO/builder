<template>
  <div v-if="!product && !editorial && !isPreviewing()">404</div>
  <div v-else>
    <ProductHeader />
    <ProductInfo :product="product" />
    <Content :model="model" :content="editorial" :apiKey="apiKey" />
    <ProductFooter />
  </div>
</template>

<script setup>
import { useRoute, useAsyncData } from '#app'
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'
import ProductHeader from '@/components/ProductHeader.vue'
import ProductFooter from '@/components/ProductFooter.vue'
import ProductInfo from '@/components/ProductInfo.vue'

const apiKey = 'ee9f13b4981e489a9a1209887695ef2b'
const model = 'product-editorial'
const {params} = useRoute()

const { 
  data: product,
} = useAsyncData('product', () => 
  $fetch(`https://fakestoreapi.com/products/${params.handle}`)
)

const { 
  data: editorial,
} = useAsyncData('editorial', () => 
  fetchOneEntry({
    model,
    apiKey,
    userAttributes: { urlPath: route.fullPath },
  })
)
</script>
  