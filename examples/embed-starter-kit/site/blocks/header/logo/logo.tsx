export default function Logo(props: any) {
  return (
    <img
      // Grab dynamically from merchant's predefined logo
      src={
        props.image ||
        'https://cdn.builder.io/api/v1/image/assets%2Fe7eb284a1bc549c8856f32d1fc7a44cf%2F77b22e5949524b3190561953907db4e7'
      }
      style={{
        height: 75,
        width: 230,
        objectFit: 'contain',
        objectPosition: 'center',
      }}
    />
  )
}
