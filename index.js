const { Client, GatewayIntentBits } = require('discord.js');
const bot = require('./bot');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

bot(client);

client.once('ready', () => {
    console.log('Bot iniciado correctamente.');
});

client.login(config.token);





