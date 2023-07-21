#!/bin/bash
timestamp=$(date +%y%m%d_%H%M%S)

# Make dir
cd "/home/vps/grepodata/production/grepodata-discord"
dirname="dist_v${timestamp}"
echo "=== Creating new directory: ${dirname}"
mkdir "$dirname" || exit 1

# Clone repo
echo "=== Cloning grepodata-discord to directory: ${dirname}"
cd "$dirname"
git init .
git remote add -t \* -f origin https://github.com/grepodata/grepodata-discord/ || exit "$?"
git checkout master || exit "$?"
git log -1

# npm install
echo "=== Running npm install"
source /home/vps/.nvm/nvm.sh;
nvm use 16.20.1
npm install || exit "$?"

# Update active
echo "=== Updating active syslink to: ${dirname}"
cd "/home/vps/grepodata/production/grepodata-discord"
cp .env "$dirname/.env" || exit "$?"
rm active
ln -s "$dirname" active

# Restart app
echo "=== Restarting app"
pm2 reload "grepodata-discord-prod"
#pm2 stop gd-discord
#pm2 start index.js --name grepodata-discord-prod --interpreter "node@16.20.1" --cwd active/
#pm2 save
#pm2 list

echo "=== Done!"
exit
