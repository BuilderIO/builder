import { Themed } from '@theme-ui/mdx'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'

const Link: React.FC<NextLinkProps> = ({ href, children, ...props }) => {
  return (
    <Themed.a sx={{ textDecoration: 'none'}} as={NextLink} href={href}>
      <a {...props}>{children}</a>
    </Themed.a>
  )
}

export default Link
