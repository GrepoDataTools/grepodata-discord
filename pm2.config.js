module.exports = {
    apps: [
        {
            name: 'grepodata-bot-prod',
            script: 'index.js',
            cwd: 'active',
            interpreter: 'node@13.8.0',
            max_memory_restart: '500M',
            min_uptime: 5000,
            max_restarts: 50,
            restart_delay: 60000,
            cron: '2 */3 * * *'
        }
    ]
};
