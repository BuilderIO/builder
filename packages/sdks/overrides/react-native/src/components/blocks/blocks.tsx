import React, {memo, useContext} from 'react';
import {
    FlatList
  } from "react-native";

import BuilderContext from "../../context/builder.context";
import ComponentsContext from "../../context/components.context";
import Block from "../block/block";
import BlocksWrapper from "./blocks-wrapper";
import type { BlocksProps } from "./blocks.types";

type RenderBlockProps = {
    item: any;  // Replace 'any' with your block type
    linkComponent?: React.ComponentType<any>;
    context?: any;  // Replace with your context type
    registeredComponents?: any;  // Replace with your components type
  };
  
  // Moved outside and memoized
  const RenderBlock = memo(({ 
    item: block,
    linkComponent,
    context,
    registeredComponents 
  }: RenderBlockProps) => (
    <Block
      key={block.id}
      block={block}
      linkComponent={linkComponent}
      context={context}
      registeredComponents={registeredComponents}
    />
  ));
  
  // Optional: Give the component a display name for better debugging
  RenderBlock.displayName = 'RenderBlock';
  
  function Blocks(props: BlocksProps) {
    const builderContext = useContext(BuilderContext);
    const componentsContext = useContext(ComponentsContext);
  
    // Memoize renderItem function to prevent unnecessary recreations
    const renderItem = React.useCallback(({ item }: { item: any }) => (
      <RenderBlock
        item={item}
        linkComponent={props.linkComponent}
        context={props.context || builderContext}
        registeredComponents={
          props.registeredComponents || componentsContext?.registeredComponents
        }
      />
    ), [
      props.linkComponent,
      props.context,
      props.registeredComponents,
      builderContext,
      componentsContext?.registeredComponents
    ]);
  
    // Memoize keyExtractor
    const keyExtractor = React.useCallback((item: any) => 
      item.id.toString()
    , []);
  
    return (
      <BlocksWrapper
        blocks={props.blocks}
        parent={props.parent}
        path={props.path}
        styleProp={props.styleProp}
        classNameProp={props.className}
        BlocksWrapper={
          props.context?.BlocksWrapper || builderContext?.BlocksWrapper
        }
        BlocksWrapperProps={
          props.context?.BlocksWrapperProps || builderContext?.BlocksWrapperProps
        }
      >
        {props.blocks ? (
          <FlatList 
            data={props.blocks}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            // Optional: Add these props for better performance
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={5}
          />
        ) : null}
      </BlocksWrapper>
    );
  }
  
  // Memoize the entire Blocks component
  export default memo(Blocks);