import Child from './Child'
import FContext from './FContext'

export default function Foo(props: { content: number }) {
  return (
    <FContext.Provider value={props.content}>
      <Child />
    </FContext.Provider>
  )
}
