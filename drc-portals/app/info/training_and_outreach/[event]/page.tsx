import { Container, Stack, Typography } from "@mui/material";
import Icon from '@mdi/react';
import { mdiHelpRhombusOutline } from '@mdi/js';

import March2024F2F from "./March2024F2F";


export default async function OutreachEvent ({params}: {
	params: {
		event: string
	}
}) {
	
	if (params.event === "2024-march-all-hands-meeting") {
		return <March2024F2F />
	} else {
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
} 