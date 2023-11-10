'use client'
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { PrismaClient } from "@prisma/client"

const Grid = dynamic(()=>import('@mui/material/Grid'))
const Container = dynamic(()=>import('@mui/material/Container'))
const Stack = dynamic(()=>import('@mui/material/Stack'))
const Typography = dynamic(()=>import('@mui/material/Typography'))
const Button = dynamic(()=>import('@mui/material/Button'))
const Paper = dynamic(()=>import('@mui/material/Paper'))
const Carousel = dynamic(()=>import('react-material-ui-carousel'))

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
  