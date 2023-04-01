// npm install @glidejs/glide
import Glide from '@glidejs/glide/dist/glide.modular.esm'
import '@glidejs/glide/dist/css/glide.core.min.css'
import { For, onMount , Show, useStore} from '@builder.io/mitosis'

export interface SliderProps {
    slides: any[],
    prevArrow : any,
    frontArrow : any,
    dots : boolean,
    autoplay : boolean,
    autoplaySpeed : number,
}

export default function Slider(props : SliderProps) {
    const store = useStore({
        glide : new Glide('.glide', {
            type: 'slider',
            startAt: 0,
            autoplay: props.autoplay ? props.autoplaySpeed*1000 : undefined,
        }),
        prevArrowFn : () => {
            store.glide.go('<')
        },
        nextArrowFn : () => {
            store.glide.go('>')
        }
    })
   
    onMount(() => {
        store.glide.on('mount:after', () => {
            console.log('slider mounted!')
        })
        store.glide.mount()
    })
    return (
        <div className="glide">
            {/* SLIDES */}
             <div className="glide__track" data-glide-el="track">
                <div className="glide__slides">
                    <For each = {props.slides}>
                        {(slide, index) => (
                            <div className="glide__slide" key={index}>
                                {slide}
                            </div>
                        )}
                    </For>
                </div>
            </div>
            {/* DOTS */}
            <Show when={props.dots}>
                <div class="glide__bullets" data-glide-el="controls[nav]">
                    <For each={props.slides}>
                        {(_, index) => (
                            <button class="glide__bullet" onClick={() => store.glide.index = index }></button>
                        )}
                    </For>
                </div>
            </Show>
           {/* CONTROLS */}
            <div data-glide-el="controls">
                <div onClick={store.prevArrowFn}>{props.prevArrow}</div>
                <div onClick={store.nextArrowFn}>{props.frontArrow}</div>
            </div>
        </div>
    )
}