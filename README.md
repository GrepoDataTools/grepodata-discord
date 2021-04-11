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

Run prod using pm2:

```
pm2 start index.js --name grepodata-discord-prod --interpreter "node@13.8.0" --cwd active/ --max-memory-restart 300M
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
