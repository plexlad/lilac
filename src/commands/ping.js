const { Command } = require('@sapphire/framework');
const { isMessageInstance } = require('@sapphire/discord.js-utilities');

class NewCommand extends Command {
    constructor(context, options) {
        super(context, {...options, name: 'ping', description: 'Test command for the bot'});
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder.setName(this.name).setDescription(this.description);
        })
    }

    async chatInputRun(interaction) {
        const msg = await interaction.reply({ content: 'Ping?', ephemeral: true, fetchReply: true });

        if (isMessageInstance(msg)) {
            let diff = msg.createdTimestamp - interaction.createdTimestamp;
            return interaction.editReply(`Pong! Round trip was ${diff}ms`);
        }

        return interaction.editReply('Failed to retrive ping');
    }
}

module.exports = {
    NewCommand
}