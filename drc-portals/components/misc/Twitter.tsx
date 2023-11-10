'use client'
import {TwitterTimelineEmbed, TwitterFollowButton} from 'react-twitter-embed'

export default function Twitter() {
    return(
        <div className="flex flex-col items-center justify-center space-y-2 mt-5">
        <TwitterFollowButton screenName="CfdeNih"/>
        <TwitterTimelineEmbed
            sourceType="profile"
            screenName="CfdeNih"
            options={{height: 500, width: 300}}
          />
        </div>
    )
}