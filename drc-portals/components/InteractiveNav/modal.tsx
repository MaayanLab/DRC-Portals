'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Fab from '@mui/material/Fab';
import Image from 'next/image';
import usePathname from '@/utils/pathname';

const FabComponent = ({children, ...props}: {children: React.ReactNode}) => (
	<Fab {...props} sx={{
		position: 'fixed',
		bottom: 50,
		right: 50,
		height: 70,
		width: 70,
		backgroundColor: '#FFF',
		padding: 0
	}}>{children}</Fab>
)

export default function InteractiveNavModal({children, fab}: {children: React.ReactNode, fab?: boolean}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const Wrapper = fab ? FabComponent: Button
  const pathname = usePathname()
  React.useEffect(()=>(handleClose()),[pathname])
  if (fab && pathname === "/info") return null
  return (
    <div>
      <Wrapper onClick={handleOpen}>
		<Image src="/img/interactive/cfde_unified_icon.svg" alt={'nav-but'} width={120} height={120}/>
	  </Wrapper>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          {children}
        </Box>
      </Modal>
    </div>
  );
}

