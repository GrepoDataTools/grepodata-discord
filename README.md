# Introduction

GrepoData Discord Bot was built using Discord.js library.

## Building

Required dependencies:

-   Node >= 9.0.0
-   Python 2.7
-   Visual Studio C++ build tools

### Installing

```
npm install --python=PATH_TO_PYTHON\python27\python.exe
```

### Rebuilding

You may have to rebuild if you get a sqlite3 error: 'Error: Could not locate the bindings file'

```
npm rebuild --python=PATH_TO_PYTHON\python27\python.exe
```

## Running bot

To run the bot you need to create .env file.
To do so, simply run

```sh
cp .env.example .env
```

then in your .env file specify environment, which can be either `production` or `development` and bot token.

### Production

Run prod using pm2 ecosystem file:

1. Move pm2.config.js to the production root
2. Run the following command

```
pm2 start pm2.config.js
```

### Acceptance

Run acc using pm2:

```
pm2 start index.js --name grepodata-discord-acc --interpreter "node@13.8.0" --cwd active/
```

### Local

Run acc locally:

```
node index.js
```

## Reset session

If the daily connection limit is exceeded due to excessive pm2 restarts, reset the session by running the reset_session.mjs script:

```
node reset_session.mjs
```

To check if the session start limit is depleted, make a GET call to https://discord.com/api/v8/gateway/bot

### discord.js v12 hotfix:

edit the file node_modules\discord.js\src\client\actions\MessageCreate.js and change if (channel) to if (channel && channel.messages) in line 10. Therefore, the bot can't receive messages from the voice chat channel. Obviously, it is better to migrate to a maintained version of discord.js but for now, it is more trouble than it's worth.
