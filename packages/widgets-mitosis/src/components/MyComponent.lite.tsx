import { useStore, Show, For } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const state = useStore({
    numbers : [1,2,3,4,5],
    vowels : ['a', 'e', 'i', 'o', 'u'],
  })
  if(state.numbers){
    console.log(state.numbers)
  }
  return (
    <div>
      <Show when={state.numbers && state.numbers.length}>
        <For each={state.numbers}>
          {(number) => <h1>number : {number}</h1>}
        </For>
      </Show>
    </div>
  );
}