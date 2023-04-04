import 'masonry-layout/dist/masonry.pkgd.min.js'
// these elements needs to be migrated from @builder.io/sdks
import { BuilderElement } from '../../../types/element';
import RenderBlocks from '../../render-blocks.lite';
import RenderBlock from '../../render-block.lite';
import BuilderContext from '../../../context';
import { Show, For, useContext } from '@builder.io/mitosis';

type BuilderBlockType = BuilderElement;

interface MasonryProps {
    tiles: Array<
     { content: BuilderBlockType[] } /* BuilderBlock <- export this type */
    >;
    builderBlock: BuilderBlockType;
    useChildrenForTiles?: boolean;
    gutterSize?: string;
    columnWidth?: string;
}

export default function MasonryComponent(props : MasonryProps){
    const context = useContext(BuilderContext)
    //TODO: layoutComplete state 

    return (
        <div> 
            <div className="grid" data-masonry={`{ "columnWidth": ${props.columnWidth}, "itemSelector": ".grid-item" }`}>
                {
                    props.useChildrenForTiles ? 
                    <Show when={props.builderBlock && props.builderBlock.children }>
                        <For each={props.builderBlock.children}>
                            {(block:BuilderElement, index : number) => (
                                <div 
                                key = {index}
                                className='grid-item' style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    width: props.columnWidth,
                                }}>
                                    <RenderBlock 
                                        block = {block}
                                        context = {context}
                                        id = {block.id}
                                    />
                                </div>
                            )}
                        </For>
                    </Show> : 
                    <Show when={props.tiles}>
                        <For each = {props.tiles}>
                            {(tile, index) => (
                                <div  
                                key = {index}
                                className='grid-item' style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    width: props.columnWidth,
                                }}>
                                    <RenderBlocks 
                                        blocks = {(tile as any).content || tile}
                                        path = {`component.options.tiles.${index}.content`}
                                        parent = {props.builderBlock && props.builderBlock.id}
                                    />
                                </div>
                            )}
                        </For>
                    </Show>
                }
            </div>
        </div>
 );
}