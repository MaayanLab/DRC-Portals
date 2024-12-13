import React from 'react';
import { Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

const PublicationSearch = ({ 
  searchTerm, 
  setSearchTerm 
}: { 
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <CustomWidthTooltip 
        title="Search title, authors, journal, DCCs, Centers and keywords"
        placement="top-start"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -10],
                },
              },
            ],
          },
        }}
       >
      <TextField
        fullWidth
        size="small"
        placeholder="Search publications "
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      </CustomWidthTooltip>
    </Box>
  );
};

export default PublicationSearch;