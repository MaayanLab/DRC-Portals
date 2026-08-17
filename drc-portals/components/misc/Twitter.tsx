import Typography from '@mui/material/Typography'
import { Card, CardContent, Grid } from '@mui/material'
import TwitterFollowButton from './TwitterFollowButton'
import TwitterFromCache from './TwitterFromCache'

export default function Twitter() {
    return(
                <Grid container spacing={2} justifyContent={"space-between"} alignItems={"center"}>
                    <Grid item>
                        <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", width: 300}}variant="subtitle1">Social Media</Typography>
                    </Grid>
                    <Grid item>
                        <TwitterFollowButton screenName={'CfdeWorkbench'}/>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            Working to improve findability, accessibility, and interoperability of NIH Common Fund data sets and to encourage data reuse.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} className='flex justify-center'>
                        <div className="flex justify-center overflow-hidden" style={{ width: 500, height: 500 }}>
                            <TwitterFromCache
                                screenName="CfdeWorkbench"
                            />
                            {/* <TwitterTimelineEmbed
                                sourceType="profile"
                                screenName="CFDEWorkbench"
                                options={{height: 500, width: 500}}
                            /> */}
                        </div>
                    </Grid>
                </Grid>
            
    )
}