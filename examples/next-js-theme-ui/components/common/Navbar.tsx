/** @jsxRuntime classic */
/** @jsx jsx */
import React, { FC, useState, useEffect } from 'react'
import { Link } from '@components/ui'
import { BuilderComponent, builder } from '@builder.io/react'
import { jsx, Themed, useThemeUI } from 'theme-ui'
import { useUI } from '@components/ui/context'
import Image from 'next/image'

const Navbar: FC = () => {
  const [announcement, setAnnouncement] = useState()
  const { theme } = useThemeUI()
  const { navigationLinks, logo } = useUI()

  useEffect(() => {
    async function fetchContent() {
      const anouncementContent = await builder
        .get('announcement-bar', {
          cacheSeconds: 120,
        })
        .toPromise()
      setAnnouncement(anouncementContent)
    }
    fetchContent()
  }, [])

  return (
    <React.Fragment>
      <BuilderComponent
        content={announcement}
        data={{ theme }}
        model="announcement-bar"
      />
      <Themed.div
        as="header"
        sx={{
          margin: `0 auto`,
          maxWidth: 1920,
          py: 2,
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Themed.div
          sx={{
            display: ['none', 'none', 'flex'],
            flexBasis: 0,
            minWidth: 240,
            justifyContent: 'space-evenly',
          }}
        >
          {navigationLinks?.map((link, index) => (
            <Themed.a
              key={index}
              sx={{ padding: 10, minWidth: 9, textDecoration: 'none'}}
              as={Link}
              href={link.link}
            >
              {link.title}
            </Themed.a>
          ))}
        </Themed.div>
        <Themed.div
          sx={{
            transform: 'translateX(-50%)',
            left: '50%',
            position: 'absolute',
          }}
        >
          <Themed.h1
            sx={{
              fontSize: 20,
              fontWeight: 'bold',
            }}
          >
            {logo && logo.image && (
              <Themed.a
                as={Link}
                href="/"
                sx={{
                  letterSpacing: -1,
                  textDecoration: `none`,
                  paddingLeft: '5px',
                }}
              >
                <Image
                  layout="fixed"
                  width={logo.width}
                  height={logo.height}
                  src={logo.image}
                ></Image>
              </Themed.a>
            )}
            {logo && logo.text && !logo.image && (
              <Themed.a
                as={Link}
                href="/"
                sx={{
                  letterSpacing: -1,
                  textDecoration: `none`,
                  paddingLeft: '5px',
                }}
              >
                {logo.text}
              </Themed.a>
            )}
          </Themed.h1>
        </Themed.div>
        <Themed.div
          sx={{
            display: 'flex',
            minWidth: 140,
            width: '100%',
            justifyContent: ['space-between', 'flex-end'],
          }}
        >
        </Themed.div>
      </Themed.div>
    </React.Fragment>
  )
}

export default Navbar
