import React, { useState } from 'react';
import { Typography, IconButton, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export const ExpandableDescriptionAnimated = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box sx={{ 
      position: 'relative',
      p: 2,
    }}>
      <Box sx={{
        position: 'relative',
        '&::after': !isExpanded ? {
          content: '""',
          position: 'absolute',
        
        } : {}
      }}>
        <Typography 
          color="textSecondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            pr: 4
          }}
        >
          {text}
        </Typography>
      </Box>
      <IconButton
        onClick={() => setIsExpanded(!isExpanded)}
        size="small"
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          color: 'text.secondary',
          padding: '4px',
          '&:hover': {
            bgcolor: 'grey.100'
          }
        }}
      >
        {isExpanded ? (
          <RemoveIcon sx={{ fontSize: 20 }} />
        ) : (
          <AddIcon sx={{ fontSize: 20 }} />
        )}
      </IconButton>
    </Box>
  );
};