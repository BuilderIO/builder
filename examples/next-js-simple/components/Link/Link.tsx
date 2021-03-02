import NextLink from 'next/link'

export const Link: React.FC<React.AnchorHTMLAttributes<any>> = ({
  href,
  children,
  ...props
}) => {
  return (
    <NextLink href={href!}>
      <a {...props}>{children}</a>
    </NextLink>
  )
}
