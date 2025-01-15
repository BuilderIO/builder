import { Builder } from "@builder.io/sdk";
import { MyPlugin } from "./components/mainpage";


Builder.register('appTab', {
    name: 'Shop the look',
    path: 'shop-the-look',
    settings: {
      stylesheets: [
        'https://cdn.jsdelivr.net/npm/tailwindcss@<version>/dist/tailwind.min.css',
      ],
    },
    icon: 'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F20c994a85a6741b5be6a6ead7316c8d9',
    component: MyPlugin,
  })
  