'use client'
import Carousel from 'react-material-ui-carousel'
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"


export default function ClientCarousel({children}: {children: React.ReactNode}) {
    return (
      <Stack spacing={1} alignItems={"center"}>
        <Typography variant="subtitle2" color="secondary">
          PRODUCTS & PARTNERSHIPS
        </Typography>
        <div style={{position: "relative"}}>
          <Carousel height={400} 
            sx={{minHeight: 400, width:640}} indicators={true}
            indicatorContainerProps={{
              style: {
                  position: "absolute",
                  bottom: "10%",
                  right: "40%"
              }
      
          }}
          >
              {children}
          </Carousel>
        </div>
      </Stack>

    )
  }
  