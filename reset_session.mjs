import { WebSocket } from 'ws';

import dotenv from 'dotenv';
dotenv.config();

const ws = new WebSocket('wss://gateway.discord.gg?v=10');
ws.on('message', (m) => {
    m = JSON.parse(m);
    console.log(m);
    if (m.op == 10)
        ws.send(
            JSON.stringify({
                op: 2,
                d: {
                    token: process.env.BOT_TOKEN,
                    intents: 0,
                    properties: { os: process.platform, browser: 'reset', device: 'reset' }
                }
            })
        );
});
ws.on('close', (c, r) => console.log('closed with', c, r));
