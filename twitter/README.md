# Twitter Cron Job

This uses the `twikit` package to access twitter via API. Designed to be run periodically, it stores the login session and gets tweets for a particular user. Both of these things are stored in a postgres table `kvstore` which is just an arbitrary string key, json value store. In the future we could store tweets in the database the normal way.
