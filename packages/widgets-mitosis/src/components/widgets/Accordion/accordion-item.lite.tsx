import {  Show, useStore } from "@builder.io/mitosis"
// these elements needs to be migrated from @builder.io/sdks
import { BuilderElement } from "../../../types/element"
import RenderBlocks from "../../render-blocks.lite"


export interface AccordionItem{
    state : any,
    titleBlocks: BuilderElement[],
    detailBlocks: BuilderElement[],
    index: number,
    openGridItemOrder: number | null,
    onlyOneAtATime: boolean,
    // fromChildren = false
}

export default function AccordionItem(props : any){
    const state = useStore({
        isOpen : props.state.open.indexOf(props.index) !== -1
    })
     return (
        <div key={props.index}>
            <div
                className={`builder-accordion-title builder-accordion-title-${
                    state.isOpen ? 'open' : 'closed'
                }`}
                css={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    // ...(props.grid && {
                    //     width: props.gridRowWidth,
                    //     ...(typeof props.openGridItemOrder === 'number' && {
                    //         order:
                    //             props.index < props.openGridItemOrder
                    //                 ? props.index
                    //                 : props.index + 1,
                    //     }),
                    // }),
                }}
                data-index={props.index}
                onClick={() => {
                    if (state.isOpen) {
                        props.state.open = props.onlyOneAtATime ? [] : props.state.open.filter((item:any) => item !== props.index)
                    } else {
                        props.state.open = props.onlyOneAtATime ? [props.index] : props.state.open.concat(props.index)
                    }
                }}
                 >
                  <RenderBlocks
                        blocks={props.titleBlocks}
                        path={`items.${props.index}.title`}
                    />
            </div>
            <Show when={state.isOpen}>
                <div
                    className={`builder-accordion-detail builder-accordion-detail-${
                            state.isOpen ? 'open' : 'closed'
                        }`}
                    // css={{
                    //     order:
                    //         typeof props.openGridItemOrder === 'number'
                    //             ? props.openGridItemOrder
                    //             : undefined,
                    //     ...(props.grid && {
                    //         width: '100%',
                    //     }),
                    // }}
                    >
                   <RenderBlocks
                        blocks={props.detailBlocks}
                        path={`items.${props.index}.detail`}
                    />
                </div>
            </Show>
        </div>
    )
}
