import React from 'react';
import { BuilderBlock } from '../../decorators/builder-block.decorator';

export interface CanvasProps {
  html?: string;
}

@BuilderBlock({
  name: 'Canvas',
  // tslint:disable-next-line:max-line-length
  image:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik03IDE0Yy0xLjY2IDAtMyAxLjM0LTMgMyAwIDEuMzEtMS4xNiAyLTIgMiAuOTIgMS4yMiAyLjQ5IDIgNCAyIDIuMjEgMCA0LTEuNzkgNC00IDAtMS42Ni0xLjM0LTMtMy0zem0xMy43MS05LjM3bC0xLjM0LTEuMzRjLS4zOS0uMzktMS4wMi0uMzktMS40MSAwTDkgMTIuMjUgMTEuNzUgMTVsOC45Ni04Ljk2Yy4zOS0uMzkuMzktMS4wMiAwLTEuNDF6Ii8+Cjwvc3ZnPgo=',
  inputs: [
    {
      name: 'html',
      type: 'html',
      hideFromUI: true,
      /* tslint:disable:max-line-length */
      defaultValue: `
        <div
          style="pointer-events: none;position: absolute;background-position: center;background-repeat: no-repeat;background-size: contain;width: 568px;height: 330px;background-image: url(https://builder.io/api/v1/image/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2Ffe466c3c1acf48c58d32960128825fd8);top: 43.015625px;left: 50%;margin-left: -269px;"
          builder-responsive-styles="{&quot;large&quot;:{&quot;position&quot;:&quot;absolute&quot;,&quot;backgroundPosition&quot;:&quot;center&quot;,&quot;backgroundRepeat&quot;:&quot;no-repeat&quot;,&quot;backgroundSize&quot;:&quot;contain&quot;,&quot;width&quot;:&quot;568px&quot;,&quot;height&quot;:&quot;330px&quot;,&quot;backgroundImage&quot;:&quot;url(https://builder.io/api/v1/image/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2Ffe466c3c1acf48c58d32960128825fd8)&quot;,&quot;top&quot;:&quot;43.015625px&quot;,&quot;left&quot;:&quot;50%&quot;,&quot;marginLeft&quot;:&quot;-269px&quot;},&quot;medium&quot;:{},&quot;small&quot;:{},&quot;xsmall&quot;:{}}">
        </div>
        <div
          style="pointer-events: none;display: flex;position: absolute;background-size: contain;background-position: center;background-repeat: no-repeat;justify-content: center;text-align: center;background-color: ;top: 167.015625px;left: 50%;margin-left: -140px;width: 318px;height: 83px;font-size: 26px;"
          builder-responsive-styles="{&quot;large&quot;:{&quot;display&quot;:&quot;flex&quot;,&quot;position&quot;:&quot;absolute&quot;,&quot;backgroundSize&quot;:&quot;contain&quot;,&quot;backgroundPosition&quot;:&quot;center&quot;,&quot;backgroundRepeat&quot;:&quot;no-repeat&quot;,&quot;justifyContent&quot;:&quot;center&quot;,&quot;textAlign&quot;:&quot;center&quot;,&quot;backgroundColor&quot;:&quot;&quot;,&quot;top&quot;:&quot;167.015625px&quot;,&quot;left&quot;:&quot;50%&quot;,&quot;marginLeft&quot;:&quot;-140px&quot;,&quot;width&quot;:&quot;318px&quot;,&quot;height&quot;:&quot;83px&quot;,&quot;fontSize&quot;:&quot;26px&quot;},&quot;medium&quot;:{},&quot;small&quot;:{},&quot;xsmall&quot;:{}}">
          You can draw any content you like here!
        </div>
        <div
          style="height: 400px;z-index: 0;position: relative;pointer-events: none;"data-builder-artboard="true"
          data-artboard-heights="{&quot;large&quot;:400,&quot;medium&quot;:null,&quot;small&quot;:null,&quot;xsmall&quot;:null}">
        </div>
      `,
      /* tslint:enable:max-line-length */
    },
  ],
})
export class BuilderCanvasComponent extends React.Component<CanvasProps> {
  render() {
    return (
      <div
        className="builder-content-canvas"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          position: 'relative',
          overflow: 'hidden',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
        }}
        dangerouslySetInnerHTML={{ __html: this.props.html || '' }}
      />
    );
  }
}
