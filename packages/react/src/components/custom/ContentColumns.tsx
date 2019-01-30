import React from 'react'
import { Builder } from '@builder.io/sdk'
import { BuilderBlock } from '../../decorators/builder-block.decorator'

export function updateQueryParam(uri: string, key: string, value: string) {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2')
  }

  return uri + separator + key + '=' + encodeURIComponent(value)
}

// tslint:disable-next-line:max-line-length
const icon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h' +
  '0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICAgIDxwYXRoIGQ9Ik0xMCAxOGg1VjVoLTV2MTN6bS02IDBoNVY1SDR2MTN6TTE2' +
  'IDV2MTNoNVY1aC01eiIvPgogICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K'

const defaultText = `
  <h2>
    Hello there
  </h2>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Praesent vehicula turpis ac auctor malesuada. Duis commodo tempor faucibus.
    Fusce sed arcu id sem mattis egestas euismod vitae urna. Suspendisse eu semper leo.
    Cras at dui leo. Suspendisse potenti.
  </p>
`

export interface Column {
  text?: string
  image?: string
  buttonText?: string
  buttonUrl?: string
  showSeparator?: boolean
}

export interface ContentColumnsProps {
  columns: Column[]
}

@BuilderBlock({
  name: 'Content Columns',
  image: icon,
  inputs: [
    {
      name: 'columns',
      type: 'array',
      subFields: [
        {
          name: 'image',
          type: 'file',
          allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'gif'],
          helperText: 'An image will only display if one is set'
        },
        {
          name: 'text',
          type: 'html',
          defaultValue: defaultText
        },
        {
          name: 'buttonText',
          type: 'text',
          helperText: 'A button will only display if this is set'
        },
        {
          name: 'buttonUrl',
          type: 'url'
        },
        {
          name: 'showSeparator',
          type: 'boolean',
          helperText: 'Show a separator bar at the bottom',
          defaultValue: false
        }
      ],
      defaultValue: [{ text: defaultText }, { text: defaultText }]
    }
  ]
})
export class ContentColumnsComponent extends React.Component<ContentColumnsProps> {
  gutterSize = 15

  isBrowser = Builder.isBrowser

  get columns() {
    return this.props.columns
  }

  // Shrink images to be no taller or wider than the maximum width of their column
  get maxImageSize() {
    if (!this.columns.length) {
      return 0
    }
    const maxPageWidth = 1200
    const columnsCount = this.columns.length
    return maxPageWidth / columnsCount
  }

  getImageUrl(baseUrl: string) {
    const maxImageSize = this.maxImageSize
    let url = baseUrl
    url = updateQueryParam(url, 'width', String(maxImageSize))
    url = updateQueryParam(url, 'height', String(maxImageSize))
    url = updateQueryParam(url, 'quality', '75')
    return url
  }

  get columnWidth() {
    const subtractWidth = (this.gutterSize * (this.columns.length - 1)) / this.columns.length
    return `calc(${100 / this.columns.length}% - ${subtractWidth}px)`
  }

  isEmptyHtml(html: string) {
    if (!(html && html.trim())) {
      return true
    }

    if (!this.isBrowser) {
      return false
    }

    const div = document.createElement('div')
    div.innerHTML = html

    return !div.innerText.trim().length
  }

  getSafeHtml(html: string) {
    if (!html) {
      return ''
    }
    return html
  }

  render() {
    const Fragment = React.Fragment as any
    return (
      <Fragment>
        <style className="builder-style builder-style-content-columns">
          {`
          .builder-content-columns a:not([href]) {
            cursor: default;
          }
          .builder-content-columns {
            display: flex;
            flex-direction: column;
          }
          @media (min-width: 500px) {
            .builder-content-columns {
              flex-direction: row;
            }
          }
          .builder-content-columns .column {
            margin-bottom: 15px;
          }
          @media (max-width: 500px) {
            .builder-content-columns .column {
              margin-right: 0 !important;
              margin-left: 0 !important;
              width: 100% !important;
            }
          }
          .builder-content-columns .image-container {
            text-align: center;
          }
          .builder-content-columns .image {
            margin: 0 auto 15px auto;
            max-width: 100%;
            display: block;
          }
          .builder-content-columns .button-container {
            margin: auto;
          }
          .builder-content-columns .button {
            display: inline-block;
            margin-top: 15px;
            min-width: 150px;
            max-width: 100%;
            text-align: center;
            padding: 10px 20px;
            max-width: 300px;
            border: 1px solid black;
          }
          .builder-content-columns .separator {
            margin-top: 15px;
            background: black;
            height: 5px;
            width: 100px;
            max-width: 100%;
          }
        `}
        </style>

        <div
          className="builder-content-columns columns-container"
          style={{ padding: `${this.gutterSize}px ${this.gutterSize}px 0 ${this.gutterSize}px` }}
        >
          {this.columns.map((column, index) => {
            const first = index === 0
            const last = index === this.columns.length - 1

            return (
              <a
                key={index}
                className="column"
                href={column.buttonUrl}
                style={{
                  width: this.columnWidth,
                  marginBottom: this.gutterSize + 'px',
                  marginRight: last ? 0 : this.gutterSize / 2 + 'px',
                  marginLeft: first ? 0 : this.gutterSize / 2 + 'px'
                }}
              >
                <div className="image-container">
                  {column.image && (
                    <img
                      role="presentation"
                      className="image"
                      src={this.getImageUrl(column.image)}
                    />
                  )}
                </div>
                {column.text &&
                  !this.isEmptyHtml(column.text) && (
                    <div
                      className="text"
                      dangerouslySetInnerHTML={{ __html: this.getSafeHtml(column.text) }}
                    />
                  )}
                <div className="button-container">
                  {column.buttonText && <span className="button">{column.buttonText}</span>}
                </div>
                {column.showSeparator && <div className="separator" />}
              </a>
            )
          })}
        </div>
      </Fragment>
    )
  }
}
