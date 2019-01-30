import React from 'react'
// import { parse } from 'url';

import { Input as BuilderInput } from '@builder.io/sdk'
import { BuilderBlock } from '../../decorators/builder-block.decorator'

export const defaultHeroValues: HeroProps = {
  heading: 'Summer Essentials',
  subtext:
    'Warm days and cool nights call for easy breezy dresses, playful bags, and effortless' +
    'slides. Meet the must have styles of the season ahead.',
  mainImage:
    'https://builder.io/api/v1/image/assets%2FSiV2WLFdmvRvdlAcjQfpSMXMmgf1%2Fc1cf27e59be143e696e8484d5348c6a8',
  backgroundImage:
    'https://builder.io/api/v1/image/assets%2FSiV2WLFdmvRvdlAcjQfpSMXMmgf1%2F9db794927ffd4438815962348648d965'
}

export const heroInputs: BuilderInput[] = [
  { name: 'heading', type: 'string', defaultValue: defaultHeroValues.heading },
  { name: 'subtext', type: 'string', defaultValue: defaultHeroValues.subtext },
  { name: 'subhead', type: 'string' },
  { name: 'imageCredit', type: 'string' },
  { name: 'buttonText', type: 'string', defaultValue: 'Shop Now' },
  { name: 'buttonLink', type: 'url' },
  { name: 'secondaryLinkText', type: 'text' },
  { name: 'secondaryLinkUrl', type: 'url' },
  {
    name: 'mainImage',
    type: 'file',
    allowedFileTypes: ['jpeg', 'jpg'],
    // Retina size is uploaded then downsized with the image cutting API for non-retina devices
    imageHeight: 1000,
    imageWidth: 1600,
    helperText: 'This image must be a 1000 x 1600 jpeg (retina desktop size)',
    defaultValue: defaultHeroValues.mainImage
  },
  {
    name: 'backgroundImage',
    type: 'file',
    allowedFileTypes: ['jpeg', 'jpg'],
    imageHeight: 1000,
    imageWidth: 1600,
    helperText: 'This image must be a 1000 x 1600 jpeg (retina desktop size)',
    defaultValue: defaultHeroValues.backgroundImage
  },
  { name: 'backgroundColor', type: 'color' },
  { name: 'whiteText', type: 'boolean' }
]

export interface HeroProps {
  heading: string
  subtext?: string
  subhead?: string
  imageCredit?: string
  buttonText?: string
  buttonLink?: string
  secondaryLinkText?: string
  secondaryLinkUrl?: string
  mainImage: string
  backgroundImage?: string
  backgroundColor?: string
  mainVideo?: string
  whiteText?: boolean
}

@BuilderBlock({
  name: 'Hero',
  inputs: heroInputs
})
export class ShopStyleHeroComponent extends React.Component<HeroProps> {
  parseHeading(heading: string) {
    if (!heading) {
      return []
    }

    // Split the heading by "--" to insert a bold line in place of this
    // (per the design/spec)
    const lineRegex = /[-]{2,}/g
    return heading.split(lineRegex)
  }

  // Get an image url that adds compression and scales the image
  // down for non-retina screens
  getImageUrl(baseUrl: string) {
    if (baseUrl.indexOf('builder.io') === -1) {
      return baseUrl
    }

    // Uploaded image is largest possible size - desktop retina size
    const imageHeight = 1000
    const imageWidth = 1600

    // const { isMobile, isRetina } = this.deviceService;
    // hardcoding for now - use srcset or react context for real thing
    const isMobile = false
    const isRetina = false

    // For non-retina devices reduce the image size by half, and for mobile devices
    // reduce the image size by half again
    const reductionFactor = (isMobile ? 2 : 1) * (!isRetina ? 2 : 1)

    const width = imageWidth / reductionFactor
    const height = imageHeight / reductionFactor

    return `${baseUrl}?quality=85&width=${width}&height=${height}`
  }

  tabletBreakpoint = 700
  desktopBreakpoint = 1200

  render() {
    const Fragment = React.Fragment as any
    return (
      <Fragment>
        <style className="builder-style builder-hero-style">
          {`
          .builder-content-hero.hero-content {
            position: relative;
            display: block;
            overflow: hidden;
            min-height: 300px;
            padding: 10px;
            background-color: white;
            width: 100vw;
            margin-left: calc(50% - 50vw);
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content {
              padding: 20px 0;
            }
          }
          .builder-content-hero.hero-content .cta-button {
            display: inline-block;
            min-width: 85px;
            padding: 0 10px;
            margin-top: 15px;
            overflow: hidden;
            font-size: 12px;
            line-height: 35px;
            text-align: center;
            text-overflow: ellipsis;
            white-space: nowrap;
            border: 1.5px solid black;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .light .cta-button {
              border-color: white;
            }
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .cta-button {
              margin-top: 10px;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .cta-button {
              max-width: 100%;
              min-width: 230px;
              margin-top: 20px;
              font-size: 18px;
              line-height: 50px;
              border-width: 3px;
            }
          }
          .builder-content-hero.hero-content,
          .builder-content-hero.hero-content .content-container {
            height: 350px;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content,
            .builder-content-hero.hero-content .content-container {
              height: 300px;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content,
            .builder-content-hero.hero-content .content-container {
              height: 500px;
            }
          }
          .builder-content-hero.hero-content .content-container {
            position: relative;
            display: flex;
            height: 100%;
            max-width: 1600px;
            margin: auto;
            color: black;
            border: 1px solid #e4e4e4;
            flex-direction: column-reverse;
          }
          .builder-content-hero.hero-content .content-container.light {
            color: white;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .content-container {
              border: none;
              flex-direction: row;
            }
          }
          .builder-content-hero.hero-content .video {
            position: absolute;
            height: 100%;
            min-width: 100%;
            opacity: 0;
            transition: opacity 0.2s;
            object-position: center;
            object-fit: cover;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .video {
              width: 1600px;
              margin-left: calc(50% - 800px);
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .video {
              width: 1600px;
              margin-left: calc(50% - 800px);
            }
          }
          .builder-content-hero.hero-content .video.loaded {
            opacity: 1;
          }
          .builder-content-hero.hero-content .inner-content {
            display: flex;
            width: 100%;
            text-align: center;
            background-position: center;
            background-size: cover;
          }
          .builder-content-hero.hero-content .inner-content.text-side {
            height: 180px;
            color: black;
            background-color: white;
          }
          .builder-content-hero.hero-content .inner-content.image-side {
            position: relative;
            height: 220px;
            overflow: hidden;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .inner-content {
              width: 50%;
              background-position: center left;
            }
            .builder-content-hero.hero-content .inner-content.text-side {
              height: auto;
              color: inherit;
              text-align: left;
              background-color: transparent;
              background-position: center right;
            }
            .builder-content-hero.hero-content .inner-content.image-side {
              height: auto;
            }
          }
          @media (max-width: 700px) {
            .builder-content-hero.hero-content .inner-content.text-side {
              background-image: none !important;
            }
          }
          .builder-content-hero.hero-content .subhead {
            display: none;
            color: #444;
            text-transform: uppercase;
          }
          .builder-content-hero.hero-content .light .subhead {
            color: white;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .subhead {
              display: block;
              margin-bottom: 10px;
              font-size: 9px;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .subhead {
              margin-bottom: 15px;
              font-size: 11px;
            }
          }
          .builder-content-hero.hero-content .text-content {
            position: relative;
            width: 100%;
            max-width: 580px;
            max-height: 100%;
            padding: 0 20px;
            margin-left: auto;
            overflow: hidden;
            align-self: center;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .text-content {
              padding: 0 20px;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .text-content {
              padding: 20px 50px;
            }
          }
          .builder-content-hero.hero-content .heading {
            font-size: 18px;
            line-height: normal;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .heading {
              font-size: 28px;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .heading {
              font-size: 54px;
            }
          }
          .builder-content-hero.hero-content .subtext {
            display: none;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .subtext {
              display: block;
              margin-top: 10px;
              font-size: 12px;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .subtext {
              margin-top: 20px;
              font-size: 14px;
            }
          }
          .builder-content-hero.hero-content .bar {
            display: none;
            vertical-align: middle;
            background-color: black;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .bar {
              display: inline-block;
              width: 70px;
              height: 3px;
            }
            .builder-content-hero.hero-content .light .bar {
              background-color: white;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .bar {
              width: 150px;
              height: 5px;
            }
          }
          .builder-content-hero.hero-content .secondary-link {
            display: block;
            padding: 10px;
            text-align: center;
            text-decoration: underline;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .secondary-link {
              padding: 0;
              margin-top: 10px;
              text-align: left;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .secondary-link {
              margin-top: 20px;
            }
          }
          .builder-content-hero.hero-content .credit-text {
            position: static;
            display: none;
            font-size: 10px;
            color: #444;
            text-align: center;
          }
          .builder-content-hero.hero-content .credit-text.outer {
            display: block;
            margin-top: 10px;
          }
          @media (min-width: 700px) {
            .builder-content-hero.hero-content .credit-text {
              position: absolute;
              bottom: -15px;
              left: 20px;
              display: block;
              text-align: left;
            }
            .builder-content-hero.hero-content .credit-text.outer {
              display: none;
            }
          }
          @media (min-width: 1600px) {
            .builder-content-hero.hero-content .credit-text {
              left: 5px;
            }
          }
          `}
        </style>
        <div className="builder-content-hero hero-content">
          <a href={this.props.buttonLink}>
            <div
              className={'content-container' + (this.props.whiteText ? ' light' : '')}
              style={{ backgroundColor: this.props.backgroundColor }}
            >
              <video muted autoPlay loop className="video" src={this.props.mainVideo} />
              {this.props.imageCredit && (
                <div className="credit-text">{this.props.imageCredit}</div>
              )}
              <div
                className="inner-content text-side"
                style={{
                  backgroundImage:
                    this.props.backgroundImage &&
                    'url(' + this.getImageUrl(this.props.backgroundImage) + ')'
                }}
              >
                <div className="text-content">
                  {this.props.subhead && <div className="subhead">{this.props.subhead}</div>}
                  <div className="heading">
                    {this.parseHeading(this.props.heading).map((part, index) => (
                      <span>
                        {index !== 0 && <span className="bar" />}
                        <span>{part}</span>
                      </span>
                    ))}
                  </div>
                  {this.props.subtext && <div className="subtext">{this.props.subtext}</div>}
                  {this.props.buttonText && (
                    <a className="cta-button" href={this.props.buttonLink}>
                      {this.props.buttonText}
                    </a>
                  )}
                  {this.props.secondaryLinkText && (
                    <a className="secondary-link" href={this.props.secondaryLinkText}>
                      {this.props.secondaryLinkText}
                    </a>
                  )}
                </div>
              </div>
              <div
                className="inner-content image-side"
                style={{
                  backgroundImage:
                    this.props.mainImage && 'url(' + this.getImageUrl(this.props.mainImage) + ')'
                }}
              />
            </div>
          </a>
          {this.props.imageCredit && (
            <div className="credit-text outer">{this.props.imageCredit}</div>
          )}
        </div>
      </Fragment>
    )
  }
}
