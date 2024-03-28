import React from "react";
import prisma from "@/lib/prisma";
import { z } from 'zod'
import { decode as decodeHTMLEntities } from 'html-entities'

const TweetC = z.object({
  core: z.object({
    user_results: z.object({
      result: z.object({
        legacy: z.object({
          name: z.string(),
          screen_name: z.string(),
          profile_image_url_https: z.string(),
        }),
        profile_image_shape: z.enum(["Circle"]),
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
        indices: z.tuple([z.number(), z.number()]),
        display_url: z.string(),
        media_url_https: z.string(),
        expanded_url: z.string(),
        type: z.string(),
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
      urls: z.array(z.object({
        url: z.string(),
        indices: z.array(z.number()),
        display_url: z.string(),
        expanded_url: z.string(),
      })),
    }),
    full_text: z.string(),
    created_at: z.string(),
    favorite_count: z.number(),
    in_reply_to_screen_name: z.string().optional(),
  }),
}).passthrough()

const TweetsC = z.array(z.intersection(TweetC, z.object({ retweeted_tweet: z.optional(TweetC) })))

/**
 * Twitter indexes treat wide characters as 1, deal with this by grouping together wide characters
 */
function codepoints(s: string) {
  const pts: string[] = []
  for (let i = 0; i < s.length; i++) {
    let cp = s.codePointAt(i)
    const j = i
    while (cp && cp >= 65536) {
      cp = s.codePointAt(++i)
    }
    pts.push(s.substring(j, i+1))
  }
  return pts
}

function substring(s: string, i: number, j?: number) {
  return codepoints(s).slice(i, j).join('')
}

function tweet_with_entities(actual_tweet: z.infer<typeof TweetC>) {
  const elements: { start: number, end: number, element: React.ReactElement }[] = []
  // insert the various entities as react elements with their indexes
  for (const hashtag of actual_tweet.legacy.entities.hashtags) {
    elements.push({
      start: hashtag.indices[0],
      end: hashtag.indices[1],
      element: <a className="text-cyan-500 hover:underline" href={`https://twitter.com/hashtag/${hashtag.text}`}>#{hashtag.text}</a>
    })
  }
  for (const url of actual_tweet.legacy.entities.urls) {
    elements.push({
      start: url.indices[0],
      end: url.indices[1],
      element: <a className="text-cyan-500 hover:underline" href={url.expanded_url}>{url.display_url}</a>
    })
  }
  for (const user_mention of actual_tweet.legacy.entities.user_mentions) {
    elements.push({
      start: user_mention.indices[0],
      end: user_mention.indices[1],
      element: <a className="text-cyan-500 hover:underline" href={`https://twitter.com/${user_mention.screen_name}`}>@{user_mention.screen_name}</a>
    })
  }
  if (actual_tweet.legacy.entities.media) {
    for (const medium of actual_tweet.legacy.entities.media) {
      if (medium.type === 'photo') {
        elements.push({
          start: medium.indices[0],
          end: medium.indices[1],
          element: <a href={medium.expanded_url} target="_blank"><img className="rounded-xl my-2" src={medium.media_url_https} width={medium.sizes.small.w} height={medium.sizes.small.h} /></a>
        })
      }
    }
  }
  // add the rest of the text around the inserted entities
  elements.sort((a, b) => a.start - b.start)
  let i = 0
  for (const el of elements) {
    if (i < el.start) {
      elements.push({ start: i, end: el.start, element: <>{decodeHTMLEntities(substring(actual_tweet.legacy.full_text, i, el.start))}</> })
      i = el.end
    } else if (i === el.start) {
      i = el.end
    }
  }
  if (i !== actual_tweet.legacy.full_text.length-1) {
    elements.push({ start: i, end: actual_tweet.legacy.full_text.length, element: <>{decodeHTMLEntities(substring(actual_tweet.legacy.full_text, i))}</> })
  }
  elements.sort((a, b) => a.start - b.start)
  // display it all
  return <div>{elements.map(el => <React.Fragment key={el.start}>{el.element}</React.Fragment>)}</div>
}

export default async function TwitterFromCache(props: { screenName: string }) {
  const record = await prisma.kVStore.findFirst({
    select: {
      value: true,
    },
    where: {
      key: 'twitter-tweets'
    },
  })
  if (!record?.value) return null
  const tweets = TweetsC.safeParse(record.value)
  if (!tweets.success) { console.error(JSON.stringify({TwitterFromCacheError: tweets.error})) }
  return (
    <div className="flex flex-col border rounded-lg overflow-hidden text-sm">
      <div className="flex flex-row border-b my-2 p-2 justify-between items-center">
        <a className="text-xl font-bold hover:underline" href={`https://twitter.com/${props.screenName}`} target="_blank">
          Tweets from @{props.screenName}
        </a>
        <a className="rounded-3xl py-1 px-4 bg-black text-white hover:opacity-85 font-bold" href={`https://twitter.com/intent/follow?screen_name=${props.screenName}`} target="_blank">Follow</a>
      </div>
      <div className="flex flex-col overflow-y-auto">
        {!tweets.success ? (
          <div>Couldn't load twitter feed at this time, try again later.</div>
        ) : tweets.data.map(tweet => {
          const actual_tweet = tweet.retweeted_tweet ? tweet.retweeted_tweet : tweet
          return (
            <div key={tweet.legacy.id_str} className="flex flex-col">
              {tweet.retweeted_tweet ?
                <div className="flex flex-row gap-2 ml-8">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 stroke-gray-300"><g><path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></g></svg>
                  <a className="text-gray-600 hover:underline font-bold" href={`https://twitter.com/${tweet.core.user_results.result.legacy.screen_name}`} target="_blank">{tweet.core.user_results.result.legacy.name} reposted</a>
                </div>
                : null}
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
                  {actual_tweet.legacy.in_reply_to_screen_name ? <span>Replying to <a className="text-cyan-500 hover:underline" href={`https://twitter.com/${actual_tweet.legacy.in_reply_to_screen_name}`} target="_blank">@{actual_tweet.legacy.in_reply_to_screen_name}</a></span> : null}
                  {tweet_with_entities(actual_tweet)}
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
          <a className="rounded-3xl py-1 px-4 bg-sky-500 text-white hover:opacity-100 opacity-85 font-bold" href={`https://twitter.com/${props.screenName}`} target="_blank">View more on Twitter</a>
        </div>
      </div>
    </div>
  )
}