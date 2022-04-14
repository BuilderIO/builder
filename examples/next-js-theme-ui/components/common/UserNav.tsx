/** @jsxImportSource theme-ui */
import { FC } from 'react'
import { Bag } from '@components/icons'
import { Button } from 'theme-ui'

interface Props {
  className?: string
}

const UserNav: FC<Props> = ({ className, children, ...props }) => {
  return (
    <Button aria-label="Cart">
      <Bag />
    </Button>
  )
}

export default UserNav
