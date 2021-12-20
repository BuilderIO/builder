# Embedding and customizing Builder starter kit

<a href="https://www.figma.com/file/yH2zHTPa5v2qz5qIR8OJ6I/Embed-Flow?node-id=0%3A1" target="_blank"> <img width="843" alt="Screen Shot 2021-12-10 at 10 32 30 AM" src="https://user-images.githubusercontent.com/5093430/145624167-e86ccf2d-9c40-4277-8142-11f8f6399d75.png"></a>

The all-in-one starter kit for highly customizable builder space with a white labeling plugin (under plugin folder, and host site under /site folder)

Demo space: Please contact us to spin a demo space with white labeling enabled.

## Features

- Theming with Material UI and Builder.io data models
- Landing pages built with Builder and hosted with next.js
- Completely white-labeled builder space with different colors, starting page, headers, and publish buttons, automatic components-only mode,
- Admin dasbhoard for generating / Authenticating / embedding Builder spaces

## Get Started

#### 1. Contact Builder.io to setup your demo space under an enterprise flag(this is required to enable white-labeling)

We will setup the space for you as this requires enterprise features to be enabled, and will add you to a space that's ready for this case, use the API key and add it to your site env files.

```
BUILDER_PUBLIC_KEY=e7eb284a1bc549c8856f32d1fc7a44cf
```

#### 2. Run site

The example site lives in the site folder

```
cd site
npm install
npm run dev
```

#### 3. Run plugin

The example plugin is in the plugin folder, and should run in parallel with the site, open a new tab in your command line

```
cd plugin
npm install
npm run start
```

## Considerations

- [`site/pages/[[...page]].tsx`](./site/pages/[[...page]].tsx) In this file we generate landing pages statically, supports multiple paths (/foo/bar/path).

- [`site/component/layout.tsx`](./site/component/layout.tsx): in this file we demonstrate using `BuilderContent` component to hook into the `theme` data model in builder to enable wysiwyg experience for configuring Material UI theme color options.

- [`plugin/src/interfaces/application-context.ts`](./plugin/src/interfaces/application-context.ts) This has all the relavant interfaces you'll need to interact with Builder's internals, most important one is `ApplicationContext` which represents a mobx-state-tree of the app with most of the actions and properties you'll need for a custom-tailored experience.

- [`plugin/src/constant/page-templates.ts`](./plugin/src/constant/page-templates.ts) This is the template for creating new pages, you can add to the blocks whatever is suitable for your use case to get the content creater a head start on their page creation journey.

- [`plugin/src/plugin.ts`](./plugin/src/plugin.ts) In this file we register all the various option that allow for customizing your space,for example we're telling the editor to use components-only mode, and hide all specific tabs in `Builder.register('editor.settings', {...})`, we also register global app settings with `defaultRoute`, `theming` options, and `typeography`

\*\* Note:
Mult-tenancy was not addressed in this code to simplify the starting point, feel free to reach out and we can expand on this, or add it as a feature to the starter.

## References

- [Admin API Docs and Playground](https://beta.builder.io/api/v2/admin)
- [Builder React SDK](https://github.com/BuilderIO/builder/tree/main/packages/react)
- [Builder Write API doc](https://www.builder.io/c/docs/write-api)
