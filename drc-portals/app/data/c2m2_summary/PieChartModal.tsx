import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import C2M2PieChart from './C2M2PieChart';

interface PieChartModalProps {
  open: boolean;
  onClose: () => void;
  data: { name: string; value: number }[];
  title: string;
  colorMap: Record<string, string>;
}

const PieChartModal: React.FC<PieChartModalProps> = ({ open, onClose, data, title, colorMap }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <C2M2PieChart data={data} colorMap={colorMap} />
      </DialogContent>
    </Dialog>
  );
};

export default PieChartModal;
