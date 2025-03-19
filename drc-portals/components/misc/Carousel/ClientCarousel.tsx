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
            duration={2000}
            sx={{
              position: 'relative',
              minHeight: {xs: 260, sm: 260, md: 400, lg: 600, xl: 600}, 
              width: {xs: 300, sm: 300, md: 450, lg: 800, xl: 800}
            }} indicators={true}
            indicatorContainerProps={{
              style: {
                  position: "absolute",
                  bottom: width === "sm" ? "15%": "10%",
                  paddingRight:  ['sm', 'md', 'xs'].indexOf(width) > -1 ? "0": "30px",
              }
            }}
          >
              {children}
          </Carousel>
        </div>
      </Stack>

    )
  }
  