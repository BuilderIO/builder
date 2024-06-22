# skeleton

## 2024.4.4

### Patch Changes

- Add JSdoc to `getSelectedProductOptions` utility and cleanup the skeleton implementation ([#2089](https://github.com/Shopify/hydrogen/pull/2089)) by [@juanpprieto](https://github.com/juanpprieto)

- Updated dependencies [[`286589ee`](https://github.com/Shopify/hydrogen/commit/286589ee281c161ad323e3d45a8b9b859aa5b11f), [`6f5061d9`](https://github.com/Shopify/hydrogen/commit/6f5061d9432f749fde7902548894e98c0d3f899c), [`ae262b61`](https://github.com/Shopify/hydrogen/commit/ae262b616127a7173d23a1a38a6e658af3105ce8), [`2c11ca3b`](https://github.com/Shopify/hydrogen/commit/2c11ca3b7a00ccca2b621dbc29abd319f9598cc8), [`b70f9c2c`](https://github.com/Shopify/hydrogen/commit/b70f9c2c3db8e863c65509097454b9ad7c81cd52), [`17528db1`](https://github.com/Shopify/hydrogen/commit/17528db1eb3d1baa001bafe0684b4bce28d2e271), [`58ea9bb0`](https://github.com/Shopify/hydrogen/commit/58ea9bb0f0eee83ff89e34e2f1f6ac3c4999e213)]:
  - @shopify/cli-hydrogen@8.0.4
  - @shopify/hydrogen@2024.4.2

## 1.0.10

### Patch Changes

- Update `@shopify/cli` dependency to avoid React version mismatches in your project: ([#2059](https://github.com/Shopify/hydrogen/pull/2059)) by [@frandiox](https://github.com/frandiox)

  ```diff
    "dependencies": {
      ...
  -   "@shopify/cli": "3.58.0",
  +   "@shopify/cli": "3.59.2",
      ...
    }
  ```

- Updated dependencies [[`d2bc720b`](https://github.com/Shopify/hydrogen/commit/d2bc720bb5f7cfb5f42617f98ad2dfcd29891f4b)]:
  - @shopify/cli-hydrogen@8.0.3

## 1.0.9

### Patch Changes

- Pin React dependency to 18.2.0 to avoid mismatches. ([#2051](https://github.com/Shopify/hydrogen/pull/2051)) by [@frandiox](https://github.com/frandiox)

- Updated dependencies [[`9c36c8a5`](https://github.com/Shopify/hydrogen/commit/9c36c8a566b1ae2ceac4846c4c9fe4f63f6f4ab3)]:
  - @shopify/cli-hydrogen@8.0.2

## 1.0.8

### Patch Changes

- Stop inlining the favicon in base64 to avoid issues with the Content-Security-Policy. In `vite.config.js`: ([#2006](https://github.com/Shopify/hydrogen/pull/2006)) by [@frandiox](https://github.com/frandiox)

  ```diff
  export default defineConfig({
    plugins: [
      ...
    ],
  + build: {
  +   assetsInlineLimit: 0,
  + },
  });
  ```

- To improve HMR in Vite, move the `useRootLoaderData` function from `app/root.tsx` to a separate file like `app/lib/root-data.ts`. This change avoids circular imports: ([#2014](https://github.com/Shopify/hydrogen/pull/2014)) by [@frandiox](https://github.com/frandiox)

  ```tsx
  // app/lib/root-data.ts
  import {useMatches} from '@remix-run/react';
  import type {SerializeFrom} from '@shopify/remix-oxygen';
  import type {loader} from '~/root';

  /**
   * Access the result of the root loader from a React component.
   */
  export const useRootLoaderData = () => {
    const [root] = useMatches();
    return root?.data as SerializeFrom<typeof loader>;
  };
  ```

  Import this hook from `~/lib/root-data` instead of `~/root` in your components.

- Updated dependencies [[`b4dfda32`](https://github.com/Shopify/hydrogen/commit/b4dfda320ca52855b2d4493a4306d15a883ca843), [`ffa57bdb`](https://github.com/Shopify/hydrogen/commit/ffa57bdbcdf51e03d565736f9388b5bb4f46292c), [`ac4e1670`](https://github.com/Shopify/hydrogen/commit/ac4e1670f0361a2cd2c6827e4162bbbee0ca37f3), [`0af624d5`](https://github.com/Shopify/hydrogen/commit/0af624d51afc7250db889ba5e736c85a6070c8b2), [`9723eaf3`](https://github.com/Shopify/hydrogen/commit/9723eaf3e5a42c30e657d1cadb123ed775d620e4), [`e842f68c`](https://github.com/Shopify/hydrogen/commit/e842f68c8e879d4c54e0730f3cb55214a760d7f5)]:
  - @shopify/cli-hydrogen@8.0.1
  - @shopify/hydrogen@2024.4.1

## 1.0.7

### Patch Changes

- Update internal libraries for parsing `.env` files. ([#1946](https://github.com/Shopify/hydrogen/pull/1946)) by [@aswamy](https://github.com/aswamy)

  Please update the `@shopify/cli` dependency in your app to avoid duplicated subdependencies:

  ```diff
  "dependencies": {
  -   "@shopify/cli": "3.56.3",
  +   "@shopify/cli": "3.58.0",
  }
  ```

- Add Adds magic Catalog route ([#1967](https://github.com/Shopify/hydrogen/pull/1967)) by [@juanpprieto](https://github.com/juanpprieto)

- Update Vite plugin imports, and how their options are passed to Remix: ([#1935](https://github.com/Shopify/hydrogen/pull/1935)) by [@frandiox](https://github.com/frandiox)

  ```diff
  -import {hydrogen, oxygen} from '@shopify/cli-hydrogen/experimental-vite';
  +import {hydrogen} from '@shopify/hydrogen/vite';
  +import {oxygen} from '@shopify/mini-oxygen/vite';
  import {vitePlugin as remix} from '@remix-run/dev';

  export default defineConfig({
      hydrogen(),
      oxygen(),
      remix({
  -     buildDirectory: 'dist',
  +     presets: [hydrogen.preset()],
        future: {
  ```

- Add `@shopify/mini-oxygen` as a dev dependency for local development: ([#1891](https://github.com/Shopify/hydrogen/pull/1891)) by [@frandiox](https://github.com/frandiox)

  ```diff
    "devDependencies": {
      "@remix-run/dev": "^2.8.0",
      "@remix-run/eslint-config": "^2.8.0",
  +   "@shopify/mini-oxygen": "^3.0.0",
      "@shopify/oxygen-workers-types": "^4.0.0",
      ...
    },
  ```

- Add the `customer-account push` command to the Hydrogen CLI. This allows you to push the current `--dev-origin` URL to the Shopify admin to enable secure connection to the Customer Account API for local development. ([#1804](https://github.com/Shopify/hydrogen/pull/1804)) by [@michenly](https://github.com/michenly)

- Fix types returned by the `session` object. ([#1869](https://github.com/Shopify/hydrogen/pull/1869)) by [@frandiox](https://github.com/frandiox)

  In `remix.env.d.ts` or `env.d.ts`, add the following types:

  ```diff
  import type {
    // ...
    HydrogenCart,
  + HydrogenSessionData,
  } from '@shopify/hydrogen';

  // ...

  declare module '@shopify/remix-oxygen' {
    // ...

  + interface SessionData extends HydrogenSessionData {}
  }
  ```

- Codegen dependencies must be now listed explicitly in `package.json`: ([#1962](https://github.com/Shopify/hydrogen/pull/1962)) by [@frandiox](https://github.com/frandiox)

  ```diff
  {
    "devDependencies": {
  +   "@graphql-codegen/cli": "5.0.2",
      "@remix-run/dev": "^2.8.0",
      "@remix-run/eslint-config": "^2.8.0",
  +   "@shopify/hydrogen-codegen": "^0.3.0",
      "@shopify/mini-oxygen": "^2.2.5",
      "@shopify/oxygen-workers-types": "^4.0.0",
      ...
    }
  }
  ```

- Updated dependencies [[`4eaec272`](https://github.com/Shopify/hydrogen/commit/4eaec272696f1a718aa7cab1070a54385ebc3686), [`14bb5df1`](https://github.com/Shopify/hydrogen/commit/14bb5df1c1513a7991183d34e72220cb2b139cf5), [`646b78d4`](https://github.com/Shopify/hydrogen/commit/646b78d4bc26310121b16000ed4d1c5d5e63957d), [`87072950`](https://github.com/Shopify/hydrogen/commit/870729505f7eb1f1c709799dd036ad02fd94be95), [`5f1295fe`](https://github.com/Shopify/hydrogen/commit/5f1295fe60b86396f364fefef339248a444c988a), [`3c8a7313`](https://github.com/Shopify/hydrogen/commit/3c8a7313cafb0ca21bbca19ac0b3f8ef4ab12655), [`ca1dcbb7`](https://github.com/Shopify/hydrogen/commit/ca1dcbb7d69c458006e25892c86c4478d394a428), [`11879b17`](https://github.com/Shopify/hydrogen/commit/11879b175d78e3326de090a56a044d1e55d0bae8), [`f4d6e5b0`](https://github.com/Shopify/hydrogen/commit/f4d6e5b0244392a7c13b9fa51c5046fd103c3e4f), [`788d86b3`](https://github.com/Shopify/hydrogen/commit/788d86b3a737bff53b4ec3aa9667458b2d45ade7), [`ebaf5529`](https://github.com/Shopify/hydrogen/commit/ebaf5529287b24a70b3146444b18f95b64f9f336), [`da95bb1c`](https://github.com/Shopify/hydrogen/commit/da95bb1c8c644f450053ce649b40dc380e7375dc), [`5bb43304`](https://github.com/Shopify/hydrogen/commit/5bb43304c08427786cfd4f2529e59bd38f593252), [`140e4768`](https://github.com/Shopify/hydrogen/commit/140e4768c880aaed4ba95b1d4c707df6963e011c), [`062d6be7`](https://github.com/Shopify/hydrogen/commit/062d6be7e031c388498ec3d359de51a4bfdfdfd8), [`b3323e59`](https://github.com/Shopify/hydrogen/commit/b3323e59a4381647f1df797c5dc54793f6e0a29a), [`ab0df5a5`](https://github.com/Shopify/hydrogen/commit/ab0df5a52bc587515880ae26f4edd18ba2be83cd), [`ebaf5529`](https://github.com/Shopify/hydrogen/commit/ebaf5529287b24a70b3146444b18f95b64f9f336), [`ebaf5529`](https://github.com/Shopify/hydrogen/commit/ebaf5529287b24a70b3146444b18f95b64f9f336), [`9e899218`](https://github.com/Shopify/hydrogen/commit/9e8992181ce7d27548d35f98b5a4f78b80795ce8), [`a209019f`](https://github.com/Shopify/hydrogen/commit/a209019f722ece4b65f8d5f37c8018c949956b1e), [`d007b7bc`](https://github.com/Shopify/hydrogen/commit/d007b7bc6f6c36e984d937108230ecc7c202fa42), [`a5511cd7`](https://github.com/Shopify/hydrogen/commit/a5511cd7bf9b0f0c4ef0e52cd72418f78c04785b), [`4afedb4d`](https://github.com/Shopify/hydrogen/commit/4afedb4d7202715df9a153e877e8eb281cc3e928), [`34fbae23`](https://github.com/Shopify/hydrogen/commit/34fbae23999eefbd1af1dff44816a52813d75b44), [`e3baaba5`](https://github.com/Shopify/hydrogen/commit/e3baaba54c701a48923ab3fe8078278f2db2c53f), [`99d72f7a`](https://github.com/Shopify/hydrogen/commit/99d72f7afc354abb66ed0e4ffb020bede2781286), [`9351f9f5`](https://github.com/Shopify/hydrogen/commit/9351f9f564267124bcbf986f5550a542c4bf1e30)]:
  - @shopify/cli-hydrogen@8.0.0
  - @shopify/hydrogen@2024.4.0
  - @shopify/remix-oxygen@2.0.4

## 1.0.6

### Patch Changes

- Improve performance of predictive search: ([#1823](https://github.com/Shopify/hydrogen/pull/1823)) by [@frandiox](https://github.com/frandiox)

  - Change the request to be GET instead of POST to avoid Remix route revalidations.
  - Add Cache-Control headers to the response to get quicker results when typing.

  Aside from that, it now shows a loading state when fetching the results instead of "No results found.".

- Updated dependencies [[`351b3c1b`](https://github.com/Shopify/hydrogen/commit/351b3c1b7768870793ff072ba91426107ba0180c), [`5060cf57`](https://github.com/Shopify/hydrogen/commit/5060cf57f69d8391b425b54acaa487af1f7405ae), [`2888014e`](https://github.com/Shopify/hydrogen/commit/2888014e54fab72c150e9eca55df3c6dd789503e)]:
  - @shopify/hydrogen@2024.1.4
  - @shopify/cli-hydrogen@7.1.2

## 1.0.5

### Patch Changes

- Update the `@shopify/cli` dependency: ([#1786](https://github.com/Shopify/hydrogen/pull/1786)) by [@frandiox](https://github.com/frandiox)

  ```diff
  - "@shopify/cli": "3.52.0",
  + "@shopify/cli": "3.56.3",
  ```

- Update Remix and associated packages to 2.8.0. ([#1781](https://github.com/Shopify/hydrogen/pull/1781)) by [@frandiox](https://github.com/frandiox)

  ```diff
  "dependencies": {
  -  "@remix-run/react": "^2.6.0",
  -  "@remix-run/server-runtime": "^2.6.0",
  +  "@remix-run/react": "^2.8.0",
  +  "@remix-run/server-runtime": "^2.8.0",
      //...
    },
    "devDependencies": {
  -   "@remix-run/dev": "^2.6.0",
  -   "@remix-run/eslint-config": "^2.6.0",
  +  "@remix-run/dev": "^2.8.0",
  +  "@remix-run/eslint-config": "^2.8.0",
      //...
    },
  ```

- Updated dependencies [[`ced1d4cb`](https://github.com/Shopify/hydrogen/commit/ced1d4cb5b1eeeb4303449eb1d60aac44f33480e), [`fc013401`](https://github.com/Shopify/hydrogen/commit/fc013401c5727948b602c9c6b6963a2df21cbd38), [`e641255e`](https://github.com/Shopify/hydrogen/commit/e641255eccc5783b41c8fabbc88313a610f539d0), [`d7e04cb6`](https://github.com/Shopify/hydrogen/commit/d7e04cb6a33d40ea86fa8ac2712d7a5ea785de2d), [`eedd9c49`](https://github.com/Shopify/hydrogen/commit/eedd9c497b36aba47a641cecbc710e18f5b14e46)]:
  - @shopify/cli-hydrogen@7.1.1
  - @shopify/hydrogen@2024.1.3

## 1.0.4

### Patch Changes

- This is an important fix to a bug with 404 routes and path-based i18n projects where some unknown routes would not properly render a 404. This fixes all new projects, but to fix existing projects, add a `($locale).tsx` route with the following contents: ([#1732](https://github.com/Shopify/hydrogen/pull/1732)) by [@blittle](https://github.com/blittle)

  ```ts
  import {type LoaderFunctionArgs} from '@remix-run/server-runtime';

  export async function loader({params, context}: LoaderFunctionArgs) {
    const {language, country} = context.storefront.i18n;

    if (
      params.locale &&
      params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
    ) {
      // If the locale URL param is defined, yet we still are still at the default locale
      // then the the locale param must be invalid, send to the 404 page
      throw new Response(null, {status: 404});
    }

    return null;
  }
  ```

- Add defensive null checks to the default cart implementation in the starter template ([#1746](https://github.com/Shopify/hydrogen/pull/1746)) by [@blittle](https://github.com/blittle)

- 🐛 Fix issue where customer login does not persist to checkout ([#1719](https://github.com/Shopify/hydrogen/pull/1719)) by [@michenly](https://github.com/michenly)

  ✨ Add `customerAccount` option to `createCartHandler`. Where a `?logged_in=true` will be added to the checkoutUrl for cart query if a customer is logged in.

- Updated dependencies [[`faeba9f8`](https://github.com/Shopify/hydrogen/commit/faeba9f8947d6b9420b33274a0f39b62418ff2e5), [`6d585026`](https://github.com/Shopify/hydrogen/commit/6d585026623204e99d54a5f2efa3d1c74f690bb6), [`fcecfb23`](https://github.com/Shopify/hydrogen/commit/fcecfb2307210b9d73a7cc90ba865508937217ba), [`28864d6f`](https://github.com/Shopify/hydrogen/commit/28864d6ffbb19b62a5fb8f4c9bbe27568de62411), [`c0ec7714`](https://github.com/Shopify/hydrogen/commit/c0ec77141fb1d7a713d91219b8777bc541780ae8), [`226cf478`](https://github.com/Shopify/hydrogen/commit/226cf478a5bdef1cca33fe8f69832ae0e557d9d9), [`06d9fd91`](https://github.com/Shopify/hydrogen/commit/06d9fd91140bd52a8ee41a20bc114ce2e7fb67dc)]:
  - @shopify/cli-hydrogen@7.1.0
  - @shopify/hydrogen@2024.1.2

## 1.0.3

### Patch Changes

- ♻️ `CustomerClient` type is deprecated and replaced by `CustomerAccount` ([#1692](https://github.com/Shopify/hydrogen/pull/1692)) by [@michenly](https://github.com/michenly)

- Updated dependencies [[`02798786`](https://github.com/Shopify/hydrogen/commit/02798786bf8ae5c53f6430723a86d62b8e94d120), [`52b15df4`](https://github.com/Shopify/hydrogen/commit/52b15df457ce723bbc83ad594ded73a7b06447d6), [`a2664362`](https://github.com/Shopify/hydrogen/commit/a2664362a7d89b34835553a9b0eb7af55ca70ae4), [`eee5d927`](https://github.com/Shopify/hydrogen/commit/eee5d9274b72404dfb0ffef30d5503fd553be5fe), [`c7b2017f`](https://github.com/Shopify/hydrogen/commit/c7b2017f11a2cb4d280dfd8f170e65a908b9ea02), [`06320ee4`](https://github.com/Shopify/hydrogen/commit/06320ee48b94dbfece945461031a252f454fd0a3)]:
  - @shopify/hydrogen@2024.1.1
  - @shopify/cli-hydrogen@7.0.1

## 1.0.2

### Patch Changes

- Use new parameters introduced in Storefront API v2024-01 to fix redirection to the product's default variant when there are unknown query params in the URL. ([#1642](https://github.com/Shopify/hydrogen/pull/1642)) by [@wizardlyhel](https://github.com/wizardlyhel)

  ```diff
  -   selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
  +   selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...ProductVariant
      }
  ```

- Update the GraphQL config in `.graphqlrc.yml` to use the more modern `projects` structure: ([#1577](https://github.com/Shopify/hydrogen/pull/1577)) by [@frandiox](https://github.com/frandiox)

  ```diff
  -schema: node_modules/@shopify/hydrogen/storefront.schema.json
  +projects:
  + default:
  +    schema: 'node_modules/@shopify/hydrogen/storefront.schema.json'
  ```

  This allows you to add additional projects to the GraphQL config, such as third party CMS schemas.

  Also, you can modify the document paths used for the Storefront API queries. This is useful if you have a large codebase and want to exclude certain files from being used for codegen or other GraphQL utilities:

  ```yaml
  projects:
    default:
      schema: 'node_modules/@shopify/hydrogen/storefront.schema.json'
      documents:
        - '!*.d.ts'
        - '*.{ts,tsx,js,jsx}'
        - 'app/**/*.{ts,tsx,js,jsx}'
  ```

- Improve resiliency of `HydrogenSession` ([#1583](https://github.com/Shopify/hydrogen/pull/1583)) by [@blittle](https://github.com/blittle)

- Update `@shopify/cli` dependency in `package.json`: ([#1579](https://github.com/Shopify/hydrogen/pull/1579)) by [@frandiox](https://github.com/frandiox)

  ```diff
  -   "@shopify/cli": "3.51.0",
  +   "@shopify/cli": "3.52.0",
  ```

- - Update example and template Remix versions to `^2.5.1` ([#1639](https://github.com/Shopify/hydrogen/pull/1639)) by [@wizardlyhel](https://github.com/wizardlyhel)

  - Enable Remix future flags:
    - [`v3_fetcherPersist`](https://remix.run/docs/en/main/hooks/use-fetchers#additional-resources)
    - [`v3_relativeSplatpath`](https://remix.run/docs/en/main/hooks/use-resolved-path#splat-paths)

- Updated dependencies [[`810f48cf`](https://github.com/Shopify/hydrogen/commit/810f48cf5d55f0cfcac6e01fe481db8c76e77cd2), [`8c477cb5`](https://github.com/Shopify/hydrogen/commit/8c477cb565c3e018bf4e13bad01804c21611fb8a), [`42ac4138`](https://github.com/Shopify/hydrogen/commit/42ac4138553c7e1a438b075c4f9cb781edffebc4), [`0241b7d2`](https://github.com/Shopify/hydrogen/commit/0241b7d2dcb887d259ce9033aca356d391bc07df), [`6a897586`](https://github.com/Shopify/hydrogen/commit/6a897586bd0908db90736921d11e4b6bdf29c912), [`0ff63bed`](https://github.com/Shopify/hydrogen/commit/0ff63bed840f5b8a5eb9968b67bd9a5a57099253), [`6bc1d61c`](https://github.com/Shopify/hydrogen/commit/6bc1d61c17a9c9be13f52338d2ab940e64e73495), [`eb0f4bcc`](https://github.com/Shopify/hydrogen/commit/eb0f4bccb57966a00ecb2b88d17dd694599da340), [`400bfee6`](https://github.com/Shopify/hydrogen/commit/400bfee6836a51c6ab5e4804e8b1e9ad48856dcb), [`a69c21ca`](https://github.com/Shopify/hydrogen/commit/a69c21caa15dfedb88afd50f262f17bf86f74836), [`970073e7`](https://github.com/Shopify/hydrogen/commit/970073e78258880505e0de563136b5379d5d24af), [`772118ca`](https://github.com/Shopify/hydrogen/commit/772118ca6aefbd47841fffc6ce42856c2dc779bd), [`335375a6`](https://github.com/Shopify/hydrogen/commit/335375a6b1a512f70e169a82bc87a8392dc8c92c), [`335371ce`](https://github.com/Shopify/hydrogen/commit/335371ceb6e1bd5aebb6104f131d3f22798a245f), [`94509b75`](https://github.com/Shopify/hydrogen/commit/94509b750afefd686971198ed86277e2c70f3176), [`36d6fa2c`](https://github.com/Shopify/hydrogen/commit/36d6fa2c4fa54ff79f06ef17aa41f60478977bc0), [`3e7b6e8a`](https://github.com/Shopify/hydrogen/commit/3e7b6e8a3bf66bad7fc0f9c224f1c163dbe3e288), [`cce65795`](https://github.com/Shopify/hydrogen/commit/cce6579580f849bec9a28cf575f7130ba3627f6b), [`9e3d88d4`](https://github.com/Shopify/hydrogen/commit/9e3d88d498efaa20fe23de9837e0f444180bc787), [`ca1161b2`](https://github.com/Shopify/hydrogen/commit/ca1161b29ad7b4d0838953782fb114d5fe82193a), [`92840e51`](https://github.com/Shopify/hydrogen/commit/92840e51820e5c7822f731affd3f591c0099be10), [`952fedf2`](https://github.com/Shopify/hydrogen/commit/952fedf27b869164550954d1c15f53b32ec02675), [`1bc053c9`](https://github.com/Shopify/hydrogen/commit/1bc053c94ba1be14ddc28be9eb70be7219b295d1)]:
  - @shopify/hydrogen@2024.1.0
  - @shopify/cli-hydrogen@7.0.0
  - @shopify/remix-oxygen@2.0.3

## 1.0.1

### Patch Changes

- Sync up environment variable names across all example & type files. ([#1542](https://github.com/Shopify/hydrogen/pull/1542)) by [@michenly](https://github.com/michenly)

- Remove error boundary from robots.txt file in the Skeleton template ([#1492](https://github.com/Shopify/hydrogen/pull/1492)) by [@andrewcohen](https://github.com/andrewcohen)

- Use the worker runtime by default when running the `dev` or `preview` commands. ([#1525](https://github.com/Shopify/hydrogen/pull/1525)) by [@frandiox](https://github.com/frandiox)

  Enable it in your project by adding the `--worker` flag to your package.json scripts:

  ```diff
  "scripts": {
    "build": "shopify hydrogen build",
  - "dev": "shopify hydrogen dev --codegen",
  + "dev": "shopify hydrogen dev --worker --codegen",
  - "preview": "npm run build && shopify hydrogen preview",
  + "preview": "npm run build && shopify hydrogen preview --worker",
    ...
  }
  ```

- Update to the latest version of `@shopify/oxygen-workers-types`. ([#1494](https://github.com/Shopify/hydrogen/pull/1494)) by [@frandiox](https://github.com/frandiox)

  In TypeScript projects, when updating to the latest `@shopify/remix-oxygen` adapter release, you should also update to the latest version of `@shopify/oxygen-workers-types`:

  ```diff
  "devDependencies": {
    "@remix-run/dev": "2.1.0",
    "@remix-run/eslint-config": "2.1.0",
  - "@shopify/oxygen-workers-types": "^3.17.3",
  + "@shopify/oxygen-workers-types": "^4.0.0",
    "@shopify/prettier-config": "^1.1.2",
    ...
  },
  ```

- Update internal dependencies for bug resolution. ([#1496](https://github.com/Shopify/hydrogen/pull/1496)) by [@vincentezw](https://github.com/vincentezw)

  Update your `@shopify/cli` dependency to avoid duplicated sub-dependencies:

  ```diff
    "dependencies": {
  -   "@shopify/cli": "3.50.2",
  +   "@shopify/cli": "3.51.0",
    }
  ```

- Update all Node.js dependencies to version 18. (Not a breaking change, since Node.js 18 is already required by Remix v2.) ([#1543](https://github.com/Shopify/hydrogen/pull/1543)) by [@michenly](https://github.com/michenly)

- 🐛 fix undefined menu error ([#1533](https://github.com/Shopify/hydrogen/pull/1533)) by [@michenly](https://github.com/michenly)

- Add `@remix-run/server-runtime` dependency. ([#1489](https://github.com/Shopify/hydrogen/pull/1489)) by [@frandiox](https://github.com/frandiox)

  Since Remix is now a peer dependency of `@shopify/remix-oxygen`, you need to add `@remix-run/server-runtime` to your dependencies, with the same version as the rest of your Remix dependencies.

  ```diff
  "dependencies": {
    "@remix-run/react": "2.1.0"
  + "@remix-run/server-runtime": "2.1.0"
    ...
  }
  ```

- Updated dependencies [[`b2a350a7`](https://github.com/Shopify/hydrogen/commit/b2a350a754ea2d29bc267c260dc298a02f8f4470), [`9b4f4534`](https://github.com/Shopify/hydrogen/commit/9b4f453407338874bd8f1a1f619b607670e021d0), [`74ea1dba`](https://github.com/Shopify/hydrogen/commit/74ea1dba9af37a146882df7ed9674be5659862b5), [`2be9ce82`](https://github.com/Shopify/hydrogen/commit/2be9ce82fd4a5121f1772bbb7349e96ed530e84e), [`a9b8bcde`](https://github.com/Shopify/hydrogen/commit/a9b8bcde96c22cedef7d87631d429199810b4a7a), [`bca112ed`](https://github.com/Shopify/hydrogen/commit/bca112ed7db49e533fe49898b663fa0dd318e6ba), [`848c6260`](https://github.com/Shopify/hydrogen/commit/848c6260a2db3a9cb0c86351f0f7128f61e028f0), [`d53b4ed7`](https://github.com/Shopify/hydrogen/commit/d53b4ed752eb0530622a666ea7dcf4b40239cafa), [`961fd8c6`](https://github.com/Shopify/hydrogen/commit/961fd8c630727784f77b9f693d2e8ff8601969fc), [`2bff9fc7`](https://github.com/Shopify/hydrogen/commit/2bff9fc75916fa95f9a9279d069408fb7a33755c), [`c8e8f6fd`](https://github.com/Shopify/hydrogen/commit/c8e8f6fd233e52cf5570b1904af710d6b907aae5), [`8fce70de`](https://github.com/Shopify/hydrogen/commit/8fce70de32bd61ee86a6d895ac43cc1f78f1bf49), [`f90e4d47`](https://github.com/Shopify/hydrogen/commit/f90e4d4713c6c1fc1e921a7ecd08e95fe5da1744), [`e8cc49fe`](https://github.com/Shopify/hydrogen/commit/e8cc49feff18f5ee72d5f6965ff2094addc23466)]:
  - @shopify/cli-hydrogen@6.1.0
  - @shopify/remix-oxygen@2.0.2
  - @shopify/hydrogen@2023.10.3

## 1.0.0

### Major Changes

- The Storefront API 2023-10 now returns menu item URLs that include the `primaryDomainUrl`, instead of defaulting to the Shopify store ID URL (example.myshopify.com). The skeleton template requires changes to check for the `primaryDomainUrl`: by [@blittle](https://github.com/blittle)

  1. Update the `HeaderMenu` component to accept a `primaryDomainUrl` and include
     it in the internal url check

  ```diff
  // app/components/Header.tsx

  + import type {HeaderQuery} from 'storefrontapi.generated';

  export function HeaderMenu({
    menu,
  +  primaryDomainUrl,
    viewport,
  }: {
    menu: HeaderProps['header']['menu'];
  +  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
    viewport: Viewport;
  }) {

    // ...code

    // if the url is internal, we strip the domain
    const url =
      item.url.includes('myshopify.com') ||
      item.url.includes(publicStoreDomain) ||
  +   item.url.includes(primaryDomainUrl)
        ? new URL(item.url).pathname
        : item.url;

     // ...code

  }
  ```

  2. Update the `FooterMenu` component to accept a `primaryDomainUrl` prop and include
     it in the internal url check

  ```diff
  // app/components/Footer.tsx

  - import type {FooterQuery} from 'storefrontapi.generated';
  + import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

  function FooterMenu({
    menu,
  +  primaryDomainUrl,
  }: {
    menu: FooterQuery['menu'];
  +  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  }) {
    // code...

    // if the url is internal, we strip the domain
    const url =
      item.url.includes('myshopify.com') ||
      item.url.includes(publicStoreDomain) ||
  +   item.url.includes(primaryDomainUrl)
        ? new URL(item.url).pathname
        : item.url;

     // ...code

    );
  }
  ```

  3. Update the `Footer` component to accept a `shop` prop

  ```diff
  export function Footer({
    menu,
  + shop,
  }: FooterQuery & {shop: HeaderQuery['shop']}) {
    return (
      <footer className="footer">
  -      <FooterMenu menu={menu} />
  +      <FooterMenu menu={menu} primaryDomainUrl={shop.primaryDomain.url} />
      </footer>
    );
  }
  ```

  4. Update `Layout.tsx` to pass the `shop` prop

  ```diff
  export function Layout({
    cart,
    children = null,
    footer,
    header,
    isLoggedIn,
  }: LayoutProps) {
    return (
      <>
        <CartAside cart={cart} />
        <SearchAside />
        <MobileMenuAside menu={header.menu} shop={header.shop} />
        <Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
        <main>{children}</main>
        <Suspense>
          <Await resolve={footer}>
  -          {(footer) => <Footer menu={footer.menu}  />}
  +          {(footer) => <Footer menu={footer.menu} shop={header.shop} />}
          </Await>
        </Suspense>
      </>
    );
  }
  ```

### Patch Changes

- If you are calling `useMatches()` in different places of your app to access the data returned by the root loader, you may want to update it to the following pattern to enhance types: ([#1289](https://github.com/Shopify/hydrogen/pull/1289)) by [@frandiox](https://github.com/frandiox)

  ```ts
  // root.tsx

  import {useMatches} from '@remix-run/react';
  import {type SerializeFrom} from '@shopify/remix-oxygen';

  export const useRootLoaderData = () => {
    const [root] = useMatches();
    return root?.data as SerializeFrom<typeof loader>;
  };

  export function loader(context) {
    // ...
  }
  ```

  This way, you can import `useRootLoaderData()` anywhere in your app and get the correct type for the data returned by the root loader.

- Updated dependencies [[`81400439`](https://github.com/Shopify/hydrogen/commit/814004397c1d17ef0a53a425ed28a42cf67765cf), [`a6f397b6`](https://github.com/Shopify/hydrogen/commit/a6f397b64dc6a0d856cb7961731ee1f86bf80292), [`3464ec04`](https://github.com/Shopify/hydrogen/commit/3464ec04a084e1ceb30ee19874dc1b9171ce2b34), [`7fc088e2`](https://github.com/Shopify/hydrogen/commit/7fc088e21bea47840788cb7c60f873ce1f253128), [`867e0b03`](https://github.com/Shopify/hydrogen/commit/867e0b033fc9eb04b7250baea97d8fd49d26ccca), [`ad45656c`](https://github.com/Shopify/hydrogen/commit/ad45656c5f663cc1a60eab5daab4da1dfd0e6cc3), [`f24e3424`](https://github.com/Shopify/hydrogen/commit/f24e3424c8e2b363b181b71fcbd3e45f696fdd3f), [`66a48573`](https://github.com/Shopify/hydrogen/commit/66a4857387148b6a104df5783314c74aca8aada0), [`0ae7cbe2`](https://github.com/Shopify/hydrogen/commit/0ae7cbe280d8351126e11dc13f35d7277d9b2d86), [`8198c1be`](https://github.com/Shopify/hydrogen/commit/8198c1befdfafb39fbcc88d71f91d21eae252973), [`ad45656c`](https://github.com/Shopify/hydrogen/commit/ad45656c5f663cc1a60eab5daab4da1dfd0e6cc3)]:
  - @shopify/hydrogen@2023.10.0
  - @shopify/remix-oxygen@2.0.0
  - @shopify/cli-hydrogen@6.0.0
