'use client'
import Carousel from 'react-material-ui-carousel'



export default function ClientCarousel({children}: {children: React.ReactNode}) {
    return (
      <Carousel sx={{height: 400, width:400}}>
          {children}
      </Carousel>
    )
  }
  