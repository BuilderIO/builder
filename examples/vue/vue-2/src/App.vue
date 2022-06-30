<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <DynamicallyRenderBuilderPage />
  </div>
</template>

<script>
import DynamicallyRenderBuilderPage from './components/DynamicallyRenderBuilderPage.vue';

export default {
  name: 'App',
  components: {
    DynamicallyRenderBuilderPage,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
