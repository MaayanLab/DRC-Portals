'use client'
import Carousel from 'react-material-ui-carousel'
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import { useWidth } from './helper';
export default function ClientCarousel({children, title}: {children: React.ReactNode, title?: string}) {
  const width = useWidth()
  // console.log(width)
    return (
      <Stack spacing={1} alignItems={"center"}>
        {title && <Typography variant="subtitle2" color="secondary">
          {title}
        </Typography>}
        <div style={{position: "relative"}} className='flex justify-center'>
          <Carousel height={300} 
            sx={{
              minHeight: {xs: 260, sm: 260, md: 400, lg: 400, xl: 400}, 
              width: {xs: 300, sm: 300, md: 450, lg: 650, xl: 650}
            }} indicators={true}
            indicatorContainerProps={{
              style: {
                position: "absolute",
                bottom: "5%", 
                left: "45%",  
                transform: "translate(-50%, -50%)",  
              
              }
            }}
          >
              {children}
          </Carousel>
        </div>
      </Stack>

    )
  }
  