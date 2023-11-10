'use client'
import dynamic from "next/dynamic"
const TwitterTimelineEmbed = dynamic(async ()=>(await import('react-twitter-embed')).TwitterTimelineEmbed, {ssr: false})
const TwitterFollowButton = dynamic(async ()=>(await import('react-twitter-embed')).TwitterFollowButton, {ssr: false})

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