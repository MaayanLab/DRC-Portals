'use client'
import Carousel from 'react-material-ui-carousel'
import Typography from "@mui/material/Typography"


export default function ClientCarousel({children}: {children: React.ReactNode}) {
    return (
      <div className='flex flex-col text-center'>
        <Carousel sx={{minHeight: 400, width:400}} indicators={true}>
            {children}
        </Carousel>
        <Typography variant="subtitle1" color="secondary">
          PRODUCTS & PARTNERSHIPS
        </Typography>
      </div>

    )
  }
  