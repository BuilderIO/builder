"use client";
import * as React from "react";
import { useState } from "react";
import Blocks from "../../components/blocks/blocks";
import type { BuilderBlock } from "../../types/builder-block.js";
import type { TabsProps } from "./tabs.types.js";

function Tabs(props: TabsProps) {
  const [activeTab, setActiveTab] = useState(() =>
    props.defaultActiveTab ? props.defaultActiveTab - 1 : 0
  );

  function activeTabContent(active: number) {
    return props.tabs && props.tabs[active].content;
  }

  function getActiveTabStyle(index: number) {
    return activeTab === index ? props.activeTabStyle : {};
  }

  return (
    <div>
      <div
        className="builder-tabs-wrap"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: props.tabHeaderLayout || "flex-start",
          overflow: "auto",
        }}
      >
        {props.tabs?.map((tab, index) => (
          <span
            key={index}
            className={`builder-tab-wrap ${
              activeTab === index ? "builder-tab-active" : ""
            }`}
            style={getActiveTabStyle(index)}
            onClick={(event) => {
              if (index === activeTab && props.collapsible) {
                setActiveTab(-1);
              } else {
                setActiveTab(index);
              }
            }}
          >
            <Blocks
              parent={props.builderBlock.id}
              path={`component.options.tabs.${index}.label`}
              blocks={tab.label}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              linkComponent={props.builderLinkComponent}
            />
          </span>
        ))}
      </div>

      {activeTabContent(activeTab) ? (
        <>
          <div>
            <Blocks
              parent={props.builderBlock.id}
              path={`component.options.tabs.${activeTab}.content`}
              blocks={activeTabContent(activeTab)}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              linkComponent={props.builderLinkComponent}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Tabs;
