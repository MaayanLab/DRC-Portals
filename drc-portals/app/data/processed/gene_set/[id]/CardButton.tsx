'use client'

import { Card, CardActions, CardContent, CardMedia } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function CardButton({ title, description, icon, children }: React.PropsWithChildren<{ title: React.ReactNode, description: React.ReactNode, icon: React.ReactNode }>) {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardMedia sx={{ display: 'flex', flex: 'column', justifyContent: 'center', paddingTop: '1em' }}>{icon}</CardMedia>
      <CardContent sx={{ flex: '1' }}>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        {children}
      </CardActions>
    </Card>
  )
}
