'use client'
import Image from "next/image"
import Paper from '@mui/material/Paper'
import Carousel from 'react-material-ui-carousel'

export default function LandingCarousel() {
    const items = [
      {
          name: "Playbook Workflow",
          description: "Playbook Partnership",
          icon: "/img/Playbook.png"
      },
      {
          name: "Reprotox KG",
          description: "Toxicology Partnership",
          icon: "/img/Reprotox.png"
      }
    ]
    return (
      <Carousel sx={{height: 400, width:400}}>
          {
              items.map( (item, i) => (
                <Paper key={i} sx={{height: 400, width:400}}>
                  <Image src={item.icon} alt={item.name} width={400} height={400}/>
                </Paper>
              ))
          }
      </Carousel>
    )
  }
  