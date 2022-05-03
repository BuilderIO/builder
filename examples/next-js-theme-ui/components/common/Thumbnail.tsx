/** @jsxImportSource theme-ui */
import Image from 'next/image'

export interface ThumbnailProps {
  src: any // for now;
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  onHover?: React.MouseEventHandler<HTMLButtonElement>
  name?: string
  width: number
  height: number
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  src,
  onClick,
  onHover,
  name,
  width,
  height,
}) => {
  return (
    <button
      name={name}
      sx={{
        cursor: 'pointer',
        border: '1px solid gray',
        padding: 1,
        '&:focus': {
          outline: 'none',
          borderColor: 'black',
        },
      }}
      onMouseOver={onHover}
      onClick={onClick}
    >
      <Image src={src} width={width} height={height} loading="eager" />
    </button>
  )
}

export default Thumbnail
