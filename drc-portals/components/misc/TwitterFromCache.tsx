import prisma from "@/lib/prisma";
import { z } from 'zod'

const TweetC = z.object({
  core: z.object({
    user_results: z.object({
      result: z.object({
        id: z.string(),
        legacy: z.object({
          name: z.string(),
          entities: z.object({
            description: z.object({
              urls: z.array(z.object({
                url: z.string(),
                indices: z.array(z.number()),
                display_url: z.string(),
                expanded_url: z.string(),
              })),
            }),
          }),
          location: z.string(),
          verified: z.boolean(),
          created_at: z.string(),
          media_count: z.number(),
          screen_name: z.string(),
          listed_count: z.number(),
          can_media_tag: z.boolean(),
          friends_count: z.number(),
          statuses_count: z.number(),
          followers_count: z.number(),
          favourites_count: z.number(),
          profile_banner_url: z.string(),
          profile_image_url_https: z.string(),
        }),
        rest_id: z.string(),
        is_blue_verified: z.boolean(),
        profile_image_shape: z.enum(["Circle"]),
        has_graduated_access: z.boolean(),
      }),
    }),
  }),
  legacy: z.object({
    id_str: z.string(),
    entities: z.object({
      hashtags: z.array(z.object({
        text: z.string(),
        indices: z.tuple([z.number(), z.number()]),
      })),
      user_mentions: z.array(z.object({
        name: z.string(),
        screen_name: z.string(),
        indices: z.tuple([z.number(), z.number()]),
      })),
    }),
    full_text: z.string(),
    created_at: z.string(),
    retweet_count: z.number(),
  }),
})

const TweetsC = z.array(z.intersection(TweetC, z.object({ retweeted_tweet: z.optional(TweetC) })))

export default async function TwitterFromCache() {
  const record = await prisma.kVStore.findFirst({
    select: {
      value: true,
    },
    where: {
      key: 'twitter-tweets'
    },
  })
  console.log(JSON.stringify(record))
  if (!record?.value) return null
  const tweets = TweetsC.parse(record.value)
  return (
    <div className="flex flex-col gap-2 border rounded-md p-4">
      <h1>Tweets from @CfdeWorkbench</h1>
      <div className="flex flex-col">
      {tweets.map(tweet => {
        const actual_tweet = tweet.retweeted_tweet ? tweet.retweeted_tweet : tweet
        return (
          <div key={tweet.core.user_results.result.id} className="flex flex-col">
            <div className="flex flex-col border border-x-0 border-t-0 pb-2 mt-2 border-gray-300">
              {tweet.retweeted_tweet ? <span className="text-gray-600">CFDE Workbench reposted</span> : null}
              <span className="font-bold">{actual_tweet.core.user_results.result.legacy.name} @{actual_tweet.core.user_results.result.legacy.screen_name} {actual_tweet.core.user_results.result.legacy.created_at}</span>
              <span>{actual_tweet.legacy.full_text}</span>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}