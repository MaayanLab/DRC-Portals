import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from './CartContext';
import PlotDescriptionEditor from './PlotDescriptionEditor';
import C2M2PieChart from './C2M2PieChart';

interface PieChartModalProps {
  open: boolean;
  onClose: () => void;
  data: { name: string; value: number }[];
  title: string;
  colorMap: Record<string, string>;
}

interface DescriptionResponse {
  description?: string;
  error?: string;
}

const PieChartModal: React.FC<PieChartModalProps> = ({ open, onClose, data, title, colorMap }) => {
  const [plotDescription, setPlotDescription] = useState<string>('');
  const [loadingDescription, setLoadingDescription] = useState<boolean>(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { addToCart, cart } = useCart();
  const descriptionTimeoutId = useRef<NodeJS.Timeout | null>(null);

  // Reset description state when modal opens
  React.useEffect(() => {
    if (open) {
      setPlotDescription('');
      setDescriptionError(null);
      setIsEditing(false);
    }
  }, [open]);

  // LLM prompt generator
  const getChartPrompt = () => {
    return `Generate a concise description for a pie chart titled "${title}". 
Summarize what the segments represent, the data shown, and any clear trends or insights from the pie chart.`;
  };

  const handleGenerateDescription = async () => {
    setLoadingDescription(true);
    setIsEditing(false);
    setDescriptionError(null);
    setPlotDescription('');

    if (descriptionTimeoutId.current) clearTimeout(descriptionTimeoutId.current);

    descriptionTimeoutId.current = setTimeout(() => {
      setLoadingDescription(false);
      setDescriptionError('Description generation took too long. Please fill it in manually.');
      setIsEditing(true);
      setPlotDescription('');
    }, 15000);

    try {
      const prompt = getChartPrompt();

      const res = await fetch('/data/c2m2_summary/getPlotDescFromLLM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const result: DescriptionResponse = await res.json();

      if (descriptionTimeoutId.current) clearTimeout(descriptionTimeoutId.current);

      if (result.error) {
        setDescriptionError(result.error);
        setIsEditing(true);
      } else {
        setPlotDescription(result.description || '');
        setIsEditing(false);
        setDescriptionError(null);
      }
    } catch {
      if (descriptionTimeoutId.current) clearTimeout(descriptionTimeoutId.current);
      setDescriptionError('Failed to generate a description. Please write it manually.');
      setIsEditing(true);
      setPlotDescription('');
    } finally {
      setLoadingDescription(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: uuidv4(),
      chartType: 'pie',
      title,
      data,
      colorMap,
      plotDescription,
    });
  };

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

        {/* Button Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, gap: 2 }}>
          <Button variant="contained" onClick={handleGenerateDescription} disabled={loadingDescription}>
            Generate Description
          </Button>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            disabled={!plotDescription || data.length === 0}
          >
            Add to Cart
          </Button>
          <Badge badgeContent={cart.length} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </Box>

        {/* Description */}
        {loadingDescription && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Generating description... please wait</Typography>
          </Box>
        )}

        {descriptionError && (
          <Alert severity="error" sx={{ mt: 2 }}>{descriptionError}</Alert>
        )}

        {/* Show description or editor */}
        {plotDescription && !isEditing && (
          <Box sx={{ mt: 3, whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1">Plot Description</Typography>
            <Typography sx={{ mt: 1 }}>{plotDescription}</Typography>
            <Button variant="outlined" onClick={() => setIsEditing(true)}>Edit</Button>
          </Box>
        )}
        {isEditing && (
          <PlotDescriptionEditor
            initialValue={plotDescription}
            onSave={(val) => {
              setPlotDescription(val);
              setIsEditing(false);
              setDescriptionError(null);
            }}
            onCancel={() => {
              setIsEditing(false);
              setDescriptionError(null);
            }}
            error={!!descriptionError}
            helperText={descriptionError || 'Please enter the description manually.'}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PieChartModal;
