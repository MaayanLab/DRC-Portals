import Tooltip from '@mui/material/Tooltip';

import { Typography, Box } from '@mui/material'

interface CustomTooltipProps {
  title: string;
  imgSrc: string;
  imgAlt: string;
  text: string;
  children: React.ReactElement;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ imgSrc, imgAlt, text, children }) => {
  return (
    <Tooltip
      title={
        <Box display="flex" flexDirection="column" alignItems="center" width="100%">
          <img src={imgSrc} alt={imgAlt} style={{ width: '100%', display: 'block', marginBottom: '5px' }} />
          <Typography>{text}</Typography>
        </Box>
      }
      arrow
    >
      {children}
    </Tooltip>
  );
};

export default CustomTooltip
