import { Container, Stack, Typography } from "@mui/material";
import Icon from '@mdi/react';
import { mdiHelpRhombusOutline } from '@mdi/js';

import March2024F2F from "./March2024F2F";
import CFDEWebinarSeries from "./CFDEWebinarSeries";
import FOG from './FOG.mdx'
import Fall2024 from './Fall2024.mdx'
import ASHG2024 from './ASHG2024.mdx'
export default async function OutreachEvent ({params}: {
	params: {
		event: string
	}
}) {
	if (params.event === "2024-march-all-hands-meeting") {
		return <March2024F2F />
	} else if (params.event === "cfde-webinar-series") {
		return <CFDEWebinarSeries />
	} else if (params.event === "festival-of-genomics") {
		return <FOG />
	}else if (params.event === "cfde-fall-2024") {
		return <Fall2024 />
	}else if (params.event === "ashg-2024") {
		return <ASHG2024 />
	}
	else {
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