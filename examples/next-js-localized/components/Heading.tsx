import { Builder } from '@builder.io/react'

export const Heading = (props: { title: string }) => {
  return (
    <div style={{ width: '50vw' }}>
      <h1>{props.title}</h1>
    </div>
  )
}

Builder.registerComponent(Heading, {
  name: 'Heading',
  inputs: [
    {
      localized: true,
      name: 'title',
      type: 'text',
      defaultValue: 'I am a heading!',
    },
  ],
})
