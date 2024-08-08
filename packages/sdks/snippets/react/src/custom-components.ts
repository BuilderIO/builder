/* add comment for the filename*/

import { RegisteredComponent } from "@builder.io/sdk-react";
import CustomTabs from "./components/CustomTabs";

export const customComponents: RegisteredComponent[] = [
    {
      component: CustomTabs,
      name: "TabFields",
      /** add comments */
      canHaveChildren: true,
       /** add comments */
      shouldReceiveBuilderProps: {
        builderBlock: true,  /** to access in parent, we use props.builderblock.id */
      },
      inputs: [
        {
          name: "tabList",
          type: "list",
  
          subFields: [
            {
              name: "tabName",
              type: "string",
            },
            {
              name: "children",
              type: "uiBlocks",
              hideFromUI: true,
              defaultValue: [
                {
                  "@type": "@builder.io/sdk:Element",
                  component: {
                    name: "Text",
  
                    options: {
                      text: "This is editable block within the builder editor",
                    },
                  },
                  responsiveStyles: {
                    large: {
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      flexShrink: "0",
                      boxSizing: "border-box",
                      marginTop: "8px",
                      lineHeight: "normal",
                      height: "200px",
                      textAlign: "left",
                      minHeight: "200px",
                    },
                    small: {
                      height: "200px",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    }
  ]
  
  