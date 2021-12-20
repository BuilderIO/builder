import React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Image } from '@builder.io/react'

export default function DoubleColumns(props: { columns: any[] }) {
  const { columns } = props
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
      {columns.slice(0, 4).map((col, index) => (
        <Grid key={index} sx={styles.col} item md={4}>
          <Card sx={styles.card}>
            {/* Builder optimized image with srcset, picture tags, aspect ratio, lazy loading etc */}
            <Box
              sx={{
                position: 'relative',
              }}
            >
              <Image lazy aspectRatio={1} sx={styles.media} image={col.image} />
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
