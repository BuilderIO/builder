export default function Spacer(props: any) {
  return (
    <div
      {...props.attributes}
      style={{
        ...props.attributes.style,
        alignSelf: 'stretch',
        flexGrow: 1,
        minHeight: 50,
        minWidth: 50,
      }}
    />
  )
}
