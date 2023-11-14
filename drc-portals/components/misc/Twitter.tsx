'use client'
import {TwitterTimelineEmbed} from 'react-twitter-embed'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

export default function Twitter() {
    return(
        <Paper sx={{boxShadow: "none", height: "100%"}}>
            <Typography variant="h2">Social Media</Typography>
            {/* <TwitterFollowButton screenName="CfdeNih"/> */}
            <TwitterTimelineEmbed
                sourceType="profile"
                screenName="CfdeNih"
                options={{height: 500, width: 300}}
            />
        </Paper>
    )
}