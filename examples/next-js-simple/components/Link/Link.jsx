import NextLink from 'next/link'

export const Link = ({ href, children, ...props }) => {
  return (
    <NextLink href={href}>
      <a {...props}>{children}</a>
    </NextLink>
  )
}
