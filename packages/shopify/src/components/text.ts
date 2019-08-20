import { BuilderElement } from '@builder.io/sdk'

export const Text = (block: BuilderElement) => {
  const { options } = block.component!

  return `
    <style>
      .builder-text p:first-child, .builder-paragraph:first-child { margin: 0 } .builder-text > p, .builder-paragraph { color: inherit; line-height: inherit; letter-spacing: inherit; font-weight: inherit; font-size: inherit; text-align: inherit; font-family: inherit; }
    </style>
    <span class="builder-text">
      ${options.text || ''}
    </span>
  `
}
