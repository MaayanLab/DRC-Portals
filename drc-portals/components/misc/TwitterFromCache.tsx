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
      media: z.array(z.object({
        url: z.string(),
        display_url: z.string(),
        media_url_https: z.string(),
        expanded_url: z.string(),
        type: z.enum(['photo']),
        sizes: z.object({
          large: z.object({
            h: z.number(),
            w: z.number(),
            resize: z.enum(['fit', 'crop']),
          }),
          medium: z.object({
            h: z.number(),
            w: z.number(),
            resize: z.enum(['fit', 'crop']),
          }),
          small: z.object({
            h: z.number(),
            w: z.number(),
            resize: z.enum(['fit', 'crop']),
          }),
          thumb: z.object({
            h: z.number(),
            w: z.number(),
            resize: z.enum(['fit', 'crop']),
          }),
        }),
      })).optional(),
    }),
    full_text: z.string(),
    created_at: z.string(),
    retweet_count: z.number(),
    favorite_count: z.number(),
  }),
}).passthrough()

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
  if (!record?.value) return null
  const tweets = TweetsC.parse(record.value)
  return (
    <div className="flex flex-col border rounded-lg overflow-hidden text-sm">
      <div className="flex flex-row border-b my-2 px-4 py-2 justify-around items-center">
        <a className="text-xl font-bold hover:underline" href="https://twitter.com/CfdeWorkbench" target="_blank">
          Tweets from @CfdeWorkbench
        </a>
        <a className="rounded-3xl py-1 px-4 bg-black text-white hover:opacity-85 font-bold" href="https://twitter.com/intent/follow?screen_name=CfdeWorkbench" target="_blank">Follow</a>
      </div>
      <div className="flex flex-col overflow-y-scroll">
        {tweets.map(tweet => {
          const actual_tweet = tweet.retweeted_tweet ? tweet.retweeted_tweet : tweet
          return (
            <div key={tweet.legacy.id_str} className="flex flex-col">
              <div className="flex flex-row gap-2 ml-8">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 stroke-gray-300"><g><path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></g></svg>
                {tweet.retweeted_tweet ? <a className="text-gray-600 hover:underline" href="https://twitter.com/CfdeWorkbench" target="_blank">CFDE Workbench reposted</a> : null}
              </div>
              <div className="flex flex-row border-b py-2 mb-2 px-4">
                <div className="w-16 flex-shrink-0 flex justify-center">
                  <a href={`https://twitter.com/${actual_tweet.core.user_results.result.legacy.screen_name}`} target="_blank">
                    <div className="flex relative rounded-full overflow-hidden opacity-90 hover:opacity-100 place-content-center">
                      <img src={actual_tweet.core.user_results.result.legacy.profile_image_url_https} />
                    </div>
                  </a>
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="flex flex-row gap-2">
                    <a className="font-bold hover:underline" href={`https://twitter.com/${actual_tweet.core.user_results.result.legacy.screen_name}`} target="_blank">{actual_tweet.core.user_results.result.legacy.name}</a>
                    <a className="text-gray-500" href={`https://twitter.com/${actual_tweet.core.user_results.result.legacy.screen_name}`} target="_blank">@{actual_tweet.core.user_results.result.legacy.screen_name}</a>
                    <a className="text-gray-500 hover:underline whitespace-nowrap" href={`https://twitter.com/${actual_tweet.core.user_results.result.legacy.screen_name}/status/${actual_tweet.legacy.id_str}`} target="_blank">{(new Date(actual_tweet.legacy.created_at)).toLocaleDateString('en-us', {month: 'short', day: 'numeric'})}</a>
                  </div>
                  <div>{actual_tweet.legacy.full_text}</div>
                  {actual_tweet.legacy.entities.media?.map((medium, i) => (
                    <a key={i} href={medium.expanded_url} target="_blank">
                      {medium.type === 'photo' ? (
                        <img className="rounded-xl" src={medium.media_url_https} width={medium.sizes.small.w} height={medium.sizes.small.h} />
                      ) : null}
                    </a>
                  ))}
                  <div className="flex flex-row gap-4">
                    <div className="w-8 h-8 rounded-full hover:bg-blue-100 flex place-items-center place-content-center"><a className="w-4" href={`https://twitter.com/intent/post?in_reply_to=${actual_tweet.legacy.id_str}`} target="_blank"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg></a></div>
                    <div className="flex flex-row hover:text-red-400 items-center">
                      <div className="w-8 h-8 rounded-full hover:bg-red-100 flex place-items-center place-content-center">
                        <a className="w-4" href={`https://twitter.com/intent/like?tweet_id=${actual_tweet.legacy.id_str}`} target="_blank"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg></a>
                      </div>
                      {actual_tweet.legacy.favorite_count}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div className="flex justify-center m-4 mb-6">
          <a className="rounded-3xl py-1 px-4 bg-sky-500 text-white hover:opacity-100 opacity-85 font-bold" href="https://twitter.com/CfdeWorkbench" target="_blank">View more on Twitter</a>
        </div>
      </div>
    </div>
  )
}