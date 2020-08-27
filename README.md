# Introduction
GrepoData Discord Bot was built using Discord.js library.

For development you need Nodejs version >= 9.0.0.

## Running bot
To run bot you need to create .env file.
To do so, simply run
```sh
cp .env.example .env
```
then in your .env file specify environment, which can be either `production` or `development` and bot token.

Run prod using pm2:
```
pm2 start index.js --name grepodata-discord-prod --interpreter "node@13.8.0" --cwd active/ --max-memory-restart 300M
```

Run acc using pm2:
```
pm2 start index.js --name grepodata-discord-acc --interpreter "node@13.8.0" --cwd active/
```
