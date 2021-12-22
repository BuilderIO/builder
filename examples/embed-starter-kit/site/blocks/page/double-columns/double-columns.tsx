import React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Image } from '@builder.io/react'

export default function DoubleColumns(props: any) {
  const { image1, image2, text1, text2 } = props
  const styles = {
    card: {
      boxShadow: 'none',
    },
    root: {
      padding: '30px',
    },
    col: {
      minWidth: 500,
    },
    media: {
      height: 600,
    },
  }
  return (
    <Grid
      component="section"
      container
      justifyContent="center"
      spacing={3}
      sx={{ p: 4 }}
    >
      {[
        { img: image1, text: text1 },
        { img: image2, text: text2 },
      ].map((col, index) => (
        <Grid key={index} sx={styles.col} item md={4}>
          <Card sx={styles.card}>
            {/* Builder optimized image with srcset, picture tags, aspect ratio, lazy loading etc */}
            <Box
              sx={{
                position: 'relative',
              }}
            >
              <Image lazy aspectRatio={1} sx={styles.media} image={col.img} />
            </Box>
            <CardContent>
              <Typography variant="h5" color="secondary" component="p">
                {col.text}
              </Typography>
              <Button size="small" color="secondary">
                Learn More {'>'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
