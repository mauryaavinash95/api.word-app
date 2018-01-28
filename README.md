## Word-App backend

### Things working
1. Index, Login, SignUp
2. Find, History
3. Save

MongoDB constraints to make username and email unique: `db.users.createIndex({username: 1, email: 1}, {unique:true});`

### How it works
1. Signup: The usual process of most web-apps, it takes username, email and password and responds with error if username or email exists, else responds with username, userId and token. (`shortid` package is used to generate userId and token).
2. Login: Takes username and password as input and returns username, userId and token. Future work: This token needs to be updated after some interval.
3. Find: Takes userId, token and word as input and fetches the word from local mongoDB, if not present, it tries to fetch from Oxford Dictionary API(ODA). If ODA responds with success, the word is sent to the user and is also stored in local mongoDB, else it responds with error word not found.
4. History: Upserts userId, word and time into the history collection. After every find, it saves the word in user's history as well.
5. Save: Upserts userId, word and time into save collection. Before saving, it calls `getWord(userId, word)` to check if word exists.
