import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const DrawerInfo = ({assetOptions}: {assetOptions: {
    asset: string;
    description: React.JSX.Element;
    example: React.JSX.Element;
}[]}) => {
    return (
        <Box
      sx={{ width: 300 }}
      role="presentation"
    >
      <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="asset-info">
        {assetOptions.map((asset, index) => (
                  <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                  >
                    <Typography>{asset.asset}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      {asset.description}
                      <br></br>
                      {'Example:'} {asset.example}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
        ))}
      </List>
    </Box>
    )
};


export default function AssetInfoDrawer({assetOptions, buttonText}: {assetOptions: {
    asset: string;
    description: React.JSX.Element;
    example: React.JSX.Element;
}[], buttonText: React.JSX.Element }) {
  const [state, setState] = React.useState(false);

  const toggleDrawer =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState(open);
    };



    return (
        <div>
            <Button color="secondary" onClick={toggleDrawer(true)}>{buttonText}</Button>
              <Drawer
                anchor={'left'}
                open={state}
                onClose={toggleDrawer(false)}
              >
                <DrawerInfo assetOptions={assetOptions}/>
              </Drawer>
        </div>
      );
    }