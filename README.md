# Introduction

GrepoData Discord Bot was built using Discord.js library.

## Building

Required dependencies:

-   Node >= 18.16.0
-   Visual Studio C++ build tools

### Installing

```
npm install
```

### Rebuilding

```
npm rebuild
```

## Deploying Discord commands
If you made changes to the command definitions in commands/*.js, then you should redeploy the commands via the Discord API.

```
node deploy-commands.js
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
pm2 start index.js --name grepodata-discord-acc --interpreter "node@18.16.0" --cwd active/
```

### Local

Run acc locally:

```
node index.js
```
