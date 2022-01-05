import { useTheme, alpha } from '@mui/material'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import Typography from '@mui/material/Typography'

interface HeroProps {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle: string
}

export default function Hero(props: HeroProps) {
  const theme = useTheme()
  return (
    <Grid
      component="section"
      container
      sx={{
        position: `relative`,
        height: '100%',
        width: `100%`,
        minHeight: 400,
        overflow: `hidden`,
      }}
    >
      <Image
        src={props.imageSrc}
        alt={props.imageAlt}
        layout="fill"
        objectFit="cover"
      />
      <Grid
        container
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: alpha(theme.palette.common.white, 0.15),
        }}
      />
      <Grid
        container
        item
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          zIndex: 100,
        }}
      >
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            color: 'primary.main',
            fontWeight: 400,
          }}
        >
          {props.title}
        </Typography>
        <Typography
          component="p"
          variant="h6"
          align="center"
          color="common.white"
          sx={{
            mb: 10,
          }}
        >
          {props.subtitle}
        </Typography>
      </Grid>
    </Grid>
  )
}
