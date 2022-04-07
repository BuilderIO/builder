/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Themed, AspectRatio } from 'theme-ui'
import React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import UntilInteraction from '@components/common/UntilInteraction'

type props = import('./LazyImageCarousel').ImageCarouselProps

const LazyCarousel = dynamic(() => import('./LazyImageCarousel'), {
  loading: () => <Themed.div sx={{ height: '100%', bg: 'muted' }} />,
  ssr: false,
})
const ImageCarousel: React.FC<props> = ({
  images,
  onThumbnailClick,
  showZoom,
  currentSlide,
  ...imageProps
}) => {
  return (
    <AspectRatio ratio={Number(imageProps.height ) / Number(imageProps.width)}>
      <UntilInteraction
        skeleton={<Image src={images[0].src} {...imageProps} />}
      >
        <LazyCarousel
          images={images}
          showZoom={showZoom}
          currentSlide={currentSlide}
          onThumbnailClick={onThumbnailClick}
          {...imageProps}
        />
      </UntilInteraction>
    </AspectRatio>
  )
}
export default ImageCarousel
