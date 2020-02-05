#! /bin/bash
timestamp=$(date +%y%m%d_%H%M%S)

# Make dir
dirname="dist_v${timestamp}"
echo "=== Creating new directory: ${dirname}"
mkdir "$dirname"
chown vps:vps "$dirname"

# Clone repo
echo "=== Cloning grepodata-discord to directory: ${dirname}"
cd "$dirname"
#sudo -u vps git clone git@github.com:CamielK/grepodata-discord.git .
sudo -u vps git clone git@github.com:grepodata/grepodata-discord.git .
git log -1

# npm install
echo "=== Running npm install"
source ~/.nvm/nvm.sh;
npm install

# Update active
echo "=== Updating active syslink to: ${dirname}"
cd /home/vps/gd-discord
rm active
ln -s "$dirname" active

# Restart app
echo "=== Restarting app"
pm2 reload gd-discord
#pm2 stop gd-discord
#pm2 start active/bot.js --name gd-discord -i 1
pm2 save
pm2 list

echo "=== Done!"
exit