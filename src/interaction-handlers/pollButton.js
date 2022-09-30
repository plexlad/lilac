const { InteractionHandler, InteractionHandlerTypes } = require("@sapphire/framework"),
    { isMessageInstance } = require('@sapphire/discord.js-utilities'),
    { db } = require('../utils/database');

class ButtonHandler extends InteractionHandler {
    constructor(context, options) {
        super(context, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    parse(interaction) {
        // If the button's custom id starts with poll, it will go to run()
        if (interaction.customId.split('-')[0] == 'poll') return this.some();
        return this.none();
    }

    async run(interaction) {
        let msg = await interaction.reply({ content: 'Submission sent', ephemeral: true, fetchReply: true});

        // Splits the custom id by the dashes
        let indexes = interaction.customId.split('-');
        // Gets the poll collection from the db
        let pollsdb = db.getCollection('poll');
        // The query is used as a base and for saving
        let pollQuery = pollsdb.findOne({ name: 'main'});
        let pollData = pollQuery.data[parseInt(indexes[1])]

        // Checks if someone has voted before
        if (pollData.options[parseInt(indexes[2])].entries.includes(interaction.member.id)) {
            return interaction.editReply(`Can't vote more than once.`);
        // If it passes the first test, now it double checks that the reply exists
        } else if (isMessageInstance(msg)) {
            pollData.options[parseInt(indexes[2])].entries.push(interaction.member.id);
            pollQuery.data[parseInt(indexes[1])] = pollData;
            pollsdb.update(pollQuery);
            db.saveDatabase();
            return interaction.editReply(`Your vote was "${pollData.options[parseInt(indexes[2])].name}"`);
        }

        return interaction.editReply('Submission failed.');
    }
}

module.exports = {
    ButtonHandler
}