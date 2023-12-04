import { Typography, Container, Stack } from "@mui/material";
import Icon from '@mdi/react';
import { mdiProgressWrench } from '@mdi/js';

export default function ComingSoon () {
    return (
        <Container maxWidth="sm" >
            <Stack spacing={1} sx={{marginTop: 15}} alignItems={"center"}>
                <Icon className="text-center" path={mdiProgressWrench} size={3} />
                <Typography className="text-center" variant="h2">COMING SOON</Typography>
                <Typography className="text-center" variant="body1">
                    We are currently working on this feature. Stay tuned for more updates.
                </Typography>
            </Stack>
        </Container>
        
        
    )
}