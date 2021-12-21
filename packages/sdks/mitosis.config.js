module.exports = {
  files: 'src/**',
  targets: ['reactNative', 'vue'],
  options: {
    vue: {
      registerComponentPrepend:
        "import { registerComponent } from '../functions/register-component'",
    },
  },
};
