'use client'
import {TwitterTimelineEmbed, TwitterFollowButton} from 'react-twitter-embed'
import Typography from '@mui/material/Typography'
import { Card, CardContent, Grid } from '@mui/material'

export default function Twitter() {
    return(
        <Card sx={{minHeight: 620}}>
            <CardContent sx={{padding: 3}}>
                <Grid container spacing={2} justifyContent={"space-between"} alignItems={"center"}>
                    <Grid item>
                        <Typography variant="h2" color="secondary">Social Media</Typography>
                    </Grid>
                    <Grid item>
                        <TwitterFollowButton screenName={'CFDEWorkbench'}/>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            Working to improve findability, accessibility, and interoperability of NIH Common Fund data sets and to encourage data reuse.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} className='flex justify-center'>
                        <div>
                            <TwitterTimelineEmbed
                                sourceType="profile"
                                screenName="CFDEWorkbench"
                                options={{height: 500, width: 500}}
                            />
                        </div>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}