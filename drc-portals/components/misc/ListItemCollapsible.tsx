'use client'

import React from 'react'
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

export default function ListItemCollapsible({ children, primary, defaultOpen = true }: React.PropsWithChildren<{ primary: React.ReactNode, defaultOpen?: boolean }>) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <>
      <ListItemButton onClick={() => {setOpen(open => !open)}}>
        <ListItemText primary={primary} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  )
}
