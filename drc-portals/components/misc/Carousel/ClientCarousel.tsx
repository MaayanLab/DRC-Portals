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
        <Carousel 
          sx={{minHeight: 400, width:640}} indicators={true}
        //   indicatorIconButtonProps={{
        //     style: {
        //         padding: '10px',    // 1
        //         color: 'blue'       // 3
        //     }
        // }}
        >
            {children}
        </Carousel>
      </Stack>

    )
  }
  