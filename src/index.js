const { SapphireClient } = require('@sapphire/framework')
    config = require('./config.json');

const client = new SapphireClient({ intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT', 'GUILD_MEMBERS', 'DIRECT_MESSAGES'] });
    
(async () => {
    await client.login(config.TOKEN);
    await client.user.setPresence({ activities: [{ name: 'anonymous messages', type: 'LISTENING' }], status: 'online' });
})();