<!-- src/views/ProductEditorial.vue -->
<template>
    <div v-if="!product && !editorial && !isPreviewing()">404</div>
    <div v-else>
      <ProductHeader />
      <ProductInfo :product="product" />
      <Content :model="modelName" :content="editorial" :apiKey="apiKey" /> 
      <ProductFooter />
    </div>
  </template>
  
  <script setup lang="ts">

  import { ref, onMounted } from 'vue';
  import { Content, fetchOneEntry, isPreviewing, type BuilderContent } from '@builder.io/sdk-vue';
  import ProductHeader from '@/components/product-editorial/ProductHeader.vue';
  import ProductFooter from '@/components/product-editorial/ProductFooter.vue';
  import ProductInfo from '@/components/product-editorial/ProductInfo.vue';
  import { useRoute } from 'vue-router';
  const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  const modelName = 'product-editorial';
  
  const product = ref(null);
  const editorial = ref<BuilderContent | null>(null);
  const {params} = useRoute();

  onMounted(() => {
    function getContent() {
      fetch(`https://fakestoreapi.com/products/${params.id}`)
        .then((res) => res.json())
        .then((productData) => {
          fetchOneEntry({
            model: modelName,
            apiKey: apiKey,
            userAttributes: { urlPath: window.location.pathname },
          }).then((editorialData) => {
            product.value = productData;
            editorial.value = editorialData;
          });
        });
    }
    getContent();
  });

  </script>
  