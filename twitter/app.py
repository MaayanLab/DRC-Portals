import os
import json
import psycopg2
from urllib.parse import urlparse, parse_qsl
import twikit

client = twikit.Client('en-US')

# Expected environment variables:

# DATABASE_URL: a postgresql:// url
# TWITTER_USERNAME: The username we log in to access twitter
# TWITTER_EMAIL: The email we log in to access twitter
# TWITTER_PASSWORD: The password we log in to access twitter
# TWITTER_TWEETS_FROM: url query string encoded twitter accounts to get tweets from
#   example: screen_name=SomeUsername&screen_name=SomeOtherUsername&list=12345&user=54321

def kvstore_get(cur, key):
  cur.execute('''
    select "key", "value"
    from "kvstore"
    where "key" = %s;
  ''', (key,))
  row = cur.fetchone()
  if row is None: return None
  _key, value = row
  return value

def kvstore_upsert(cur, key, value):
  cur.execute('''
    insert into "kvstore" ("key", "value")
    values (%s, %s)
    on conflict ("key") do update set "value" = EXCLUDED."value";
  ''', (key, json.dumps(value)))

type_to_tweets = {
  'screen_name': lambda client, screen_name: client.get_user_by_screen_name(screen_name).get_tweets(tweet_type='Tweets', count=20),
  'list': lambda client, list_id: client.get_list_tweets(list_id, count=20),
  'user': lambda client, user_id: client.get_user_tweets(user_id, 'Tweets', count=20),
}

def get_tweets(client):
  tweets = sorted({
    tweet.retweeted_tweet.id if tweet.retweeted_tweet else tweet.id: tweet
    for type, id in parse_qsl(os.environ['TWITTER_TWEETS_FROM'])
    for tweet in type_to_tweets[type](client, id)
  }.values(), key=lambda tweet: tweet.created_at_datetime)
  return [
    dict(tweet._data, retweeted_tweet=tweet.retweeted_tweet._data) if tweet.retweeted_tweet else tweet._data
    for tweet in tweets
  ]

uri = urlparse(os.environ['DATABASE_URL'])
conn = psycopg2.connect(
  database = uri.path[1:],
  user = uri.username,
  password = uri.password,
  host = uri.hostname,
  port = uri.port
)

with conn.cursor() as cur:
  cookies = kvstore_get(cur, 'twitter-cookies')
  try:
    if not cookies: raise twikit.errors.Unauthorized
    else: client.set_cookies(cookies)
    tweets = get_tweets(client)
  except twikit.errors.Unauthorized:
    client = twikit.Client('en-US')
    client.login(
      auth_info_1=os.environ['TWITTER_USERNAME'],
      auth_info_2=os.environ['TWITTER_EMAIL'],
      password=os.environ['TWITTER_PASSWORD'],
    )
    cookies = client.get_cookies()
    kvstore_upsert(cur, 'twitter-cookies', cookies)
    tweets = get_tweets(client)
  #
  print(f"{tweets} tweets saved")
  kvstore_upsert(cur, 'twitter-tweets', tweets)
  conn.commit()
