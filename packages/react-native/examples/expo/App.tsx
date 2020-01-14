import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { builder, BuilderComponent } from '@builder.io/react-native';
builder.init('YJIGb4i01jvw0SRdL5Bt');
builder.setUserAttributes({
  // urlPath: '/header',
});

export default function App() {
  return (
    <ScrollView>
      <Text style={{ marginTop: 20 }}>Hello: {typeof Proxy}</Text>
      <BuilderComponent content={smallContent} model="symbol" />
    </ScrollView>
  );
}

const smallContent = {
  data: {
    blocks:
    [
      {
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "responsiveStyles": {
          "large": {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "stretch",
            "position": "relative",
            "flexShrink": "0",
            "boxSizing": "border-box",
            "marginTop": "0px",
            "paddingLeft": "20px",
            "paddingRight": "20px",
            "paddingTop": "50px",
            "paddingBottom": "50px",
            "width": "100vw",
            "marginLeft": "calc(50% - 50vw)"
          }
        },
        "children": [
          {
            "@type": "@builder.io/sdk:Element",
            "@version": 2,
            "responsiveStyles": {
              "large": {
                "textAlign": "center"
              }
            },
            "id": "builder-b946e3aae2e14fccb962231201203f85",
            "layerLocked": false,
            "groupLocked": false,
            "component": {
              "name": "Text",
              "options": {
                "text": "<p><b>I am a section! My content keeps from getting too wide, so that it's easy to read even on big screens.</b></p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>"
              }
            }
          }
        ],
        "id": "builder-5db728f2a05347fb949d08726dd56d70",
        "layerLocked": false,
        "groupLocked": false,
        "component": {
          "name": "Core:Section",
          "options": {
            "maxWidth": 1200
          }
        }
      },
      {
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "responsiveStyles": {
          "large": {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "stretch",
            "position": "relative",
            "flexShrink": "0",
            "boxSizing": "border-box",
            "marginTop": "20px",
            "lineHeight": "normal",
            "height": "auto",
            "textAlign": "center"
          }
        },
        "id": "builder-a2ee88ea5176484099034e9b28b4d735",
        "layerLocked": false,
        "groupLocked": false,
        "component": {
          "name": "Text",
          "options": {
            "text": "<p>Hello</p>"
          }
        }
      },
      {
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "responsiveStyles": {
          "large": {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "stretch",
            "position": "relative",
            "flexShrink": "0",
            "boxSizing": "border-box",
            "marginTop": "20px",
            "minHeight": "20px",
            "minWidth": "20px",
            "overflow": "hidden"
          }
        },
        "id": "builder-8db902e83f9a44509306e4c72f74bd49",
        "layerLocked": false,
        "groupLocked": false,
        "component": {
          "name": "Image",
          "options": {
            "image": "https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d",
            "backgroundSize": "cover",
            "backgroundPosition": "center",
            "aspectRatio": 0.7041
          }
        }
      },
      {
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "responsiveStyles": {
          "large": {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "stretch",
            "position": "relative",
            "flexShrink": "0",
            "boxSizing": "border-box",
            "marginTop": "20px",
            "lineHeight": "normal",
            "height": "auto",
            "textAlign": "center"
          }
        },
        "id": "builder-63d5ad1447414be181183384d6dbb1c3",
        "layerLocked": false,
        "groupLocked": false,
        "component": {
          "name": "Text",
          "options": {
            "text": "<p>Enter some text...</p>"
          }
        }
      }
    ]
  }
}

