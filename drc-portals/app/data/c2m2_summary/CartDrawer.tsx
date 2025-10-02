'use client';

import React from 'react';
import { Box, Drawer, Typography, Button, List, ListItem, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { saveReport } from '../c2m2_report/reportStorage';
import { generateChartTitle } from './_utils/chartUtils'; // <--- updated import

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const handleGenerateReport = () => {
    const id = uuidv4();
    saveReport(id, cart);
    clearCart();
    onClose();
    router.push(`/data/c2m2_report/${id}`);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6">Saved Charts</Typography>
        <List>
          {cart.length === 0 && (
            <ListItem>
              <Typography color="text.secondary">Cart is empty.</Typography>
            </ListItem>
          )}

          {cart.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Typography variant="subtitle2" noWrap>
                {generateChartTitle(item)}
              </Typography>
            </ListItem>
          ))}
        </List>

        <Button
          fullWidth
          variant="contained"
          disabled={cart.length === 0}
          sx={{ mt: 2 }}
          onClick={handleGenerateReport}
        >
          Generate Report
        </Button>

        {cart.length > 0 && (
          <Button onClick={clearCart} fullWidth variant="outlined" sx={{ mt: 1 }}>
            Clear Cart
          </Button>
        )}
      </Box>
    </Drawer>
  );
};
