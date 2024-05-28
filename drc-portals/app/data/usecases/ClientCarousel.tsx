'use client'
import Carousel from 'react-material-ui-carousel'
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
export default function ClientCarousel({children, title, height}: {children: React.ReactNode, title?: string, height?: number}) {
    return (
      <Stack spacing={1} alignItems={"center"}>
        {title && <Typography variant="subtitle2" color="secondary">
          {title}
        </Typography>}
        <div style={{position: "relative"}}>
          <Carousel height={height || 370} 
            sx={{minHeight: {xs: 800, sm: 800, md: 350, lg: 350, xl: 350}, width:'100vw', }} indicators={true}
            
          >
              	{children}
          </Carousel>
        </div>
      </Stack>

    )
  }
  