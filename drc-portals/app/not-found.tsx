import { Typography, Container, Stack } from "@mui/material";
import Icon from '@mdi/react';
import { mdiHelpRhombusOutline } from '@mdi/js';

export default function ComingSoon () {
    return (
        <Container maxWidth="sm" >
            <Stack spacing={5} sx={{marginTop: 10}} alignItems={"center"}>
                <Icon className="text-center" path={mdiHelpRhombusOutline} size={3} />
                <Typography className="text-center" variant="h2">Not Found</Typography>
                <Typography className="text-center" variant="body1">
                    Oops, we did not find that page.
                </Typography>
            </Stack>
        </Container>
        
        
    )
}