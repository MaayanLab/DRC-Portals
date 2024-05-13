'use client'
import { Fade, Box, Fab } from "@mui/material"
import { KeyboardArrowUp } from "@mui/icons-material"
import { useScrollTrigger } from "@mui/material"

export default function ScrollToTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100
  })
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor')
    if (anchor) {
      anchor.scrollIntoView({
        block: 'center'
      })
    }
  }
  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </Box>
    </Fade>
  )
}