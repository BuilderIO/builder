import { builder } from '@builder.io/react'

/**
 * Get global layout props
 */
export async function getLayoutProps() {
  return {
    theme: (await builder.get('theme').promise()) || null,
    header: (await builder.get('header').promise()) || null,
  }
}
