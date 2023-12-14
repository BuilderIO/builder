# SSR A/B testing

Here is a brief overview of how our SSR'd A/B testing works.

## How it works

### SSR

let's assume a content with 3 variants: `default`, `variant-1`, `variant-2`.

First, our SSR'd HTML will look roughly like this:

```html
<script src="{updateVisibilityStyles}" />
<script src="{updateVariantVisibility}" />
<style>
  .variant-1 {
    display: none;
  }
  .variant-2 {
    display: none;
  }
</style>
<div id="variant-1" hidden aria-hidden="true" />
<div id="variant-2" hidden aria-hidden="true" />
<div id="default-variant" />
```

The desired outcome will depend on the framework used:

#### React

Hydration is a heavy process, so we need to delete everything (other variants, style & script tags) except for the winning variant to keep the cost of hydrating Builder content at a minimum.

The intended CSR should look like this:

```html
<div id="winning-variant" />
```

#### Qwik

Since Qwik doesn't have hydration, there is no problem with keeping extra DOM elements around, as they do not have a hydration cost. Therefore, the intended CSR will look like this:

```html
<script src="{updateCookieAndStyles}" />
<script src="{updateVariantVisibility}" />
<style>
  .losing-var-1 {
    display: none;
  }
  .losing-var-2 {
    display: none;
  }
</style>
<div id="losing-var-1" hidden aria-hidden="true" />
<div id="winning-variant" />
<div id="loasing-var-2" hidden aria-hidden="true" />
```

We need to update the styles and HTML attributes to hide the correct variants.

#### Vue, Svelte, Solid

These hydrate, but we ran into issues trying to delete everything instantly. Instead, we update HTML+CSS visibility attributes to show the correct variant, and have an `onMount` trigger that removes all the other variants.

The intended CSR will first look like this:

```html
<script src="{updateCookieAndStyles}" />
<script src="{updateVariantVisibility}" />
<style>
  .losing-var-1 {
    display: none;
  }
  .losing-var-2 {
    display: none;
  }
</style>
<div id="losing-var-1" hidden aria-hidden="true" />
<div id="winning-variant" />
<div id="loasing-var-2" hidden aria-hidden="true" />
```

followed right after by:

```html
<div id="winning-variant" />
```

### CSR Modifications

To recap, initially:

- all non-default variants are hidden using HTML (`hidden`, `aria-hidden`) and CSS (`display: none`).
- the default variant is visible.

On CSR, 2 scripts will run:

- `updateCookieAndStyles` will run once before all variants:

  - It will update the cookie to the winning variant.
  - it will modify the styles:
    - React: delete all `display: none` styles.
    - Other frameworks: update the CSS to hide losing variants only.

- `updateVariantVisibility` will run for each variant:
  - React: it will delete the node if it's not the winning variant,
  - Other frameworks: it will hide the node if it's not the winning variant

Both scripts and the variant style tag "self-destruct" in hydration frameworks by removing themselves, as they are not needed anymore.

And as a last extra step for Svelte/Solid/Vue: on the second CSR, we unmount everything except for the winning variant.
