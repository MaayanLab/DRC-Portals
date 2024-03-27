import os
import psycopg
from twikit import Client

client = Client('en-US')

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
    on conflict do update set "value" = EXCLUDED."value";
  ''', (key, value))

with psycopg.connect(os.environ['DATABASE_URL']) as conn:
  with conn.cursor() as cur:
    cookies = kvstore_get(cur, 'twitter-cookies')
    if not cookies:
      client.login(
        auth_info_1=os.environ['TWITTER_USERNAME'],
        auth_info_2=os.environ['TWITTER_EMAIL'],
        password=os.environ['TWITTER_PASSWORD'],
      )
      cookies = client.get_cookies()
      kvstore_upsert(cur, 'twitter-cookies', cookies)
    else:
      client.set_cookies(cookies)
    #
    tweets = [
      tweet._data
      for tweet in client.get_user_by_screen_name(os.environ['TWITTER_TWEETS_FROM']).get_tweets(tweet_type='Tweets')
    ]
    kvstore_upsert(cur, 'twitter-tweets', tweets)
    conn.commit()
