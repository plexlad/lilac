const { Command } = require('@sapphire/framework'),
    config = require('../config.json'),
    { db } = require('../utils/database'),
    { isMessageInstance } = require('@sapphire/discord.js-utilities');

class NewCommand extends Command {
    constructor(context, options) {
        super(context, 
            {
                ...options,
                name: 'poll',
                description: 'Create a simple poll that will be posted in the dedicated poll channel.',
                preconditions: ['ModPerms']
            })
    }

    // Slash command with question entry and 5 options
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option.setName('question')
                        .setDescription('Poll question')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('option_a')
                        .setDescription('Option'))
                .addStringOption(option =>
                    option.setName('option_b')
                        .setDescription('Option'))
                .addStringOption(option =>
                    option.setName('option_c')
                        .setDescription('Option'))
                .addStringOption(option =>
                    option.setName('option_d')
                        .setDescription('Option'))
                .addStringOption(option =>
                    option.setName('option_e')
                        .setDescription('Option'))
        });
    }

    // The code that creates the polls
    async chatInputRun(interaction) {
        await interaction.reply({ content: 'Poll?', ephemeral: true, fetchReply: true });

        let channel = await interaction.client.channels.fetch(config.channels.poll);  // The channel to send polls to
        let data = interaction.options.data;  // Data taken from the slash command
        let polldb = db.getCollection('poll');  // Gets the database for the polls

        let optionData = data.filter((v) => { return v.name != 'question' });  // Filters the question out so only options are left
        let buttonComponents = []  // Later used to add button components to depending on the options
        
        let pollData = polldb.findOne({ name: 'main' });
        let index = pollData.data.length;  // Creates an index for the new poll in the database
        console.log(index);

        // If the database is not empty, no need to initialize because the data will be overridden
        if (index == 0) {
            pollData.data.push({  // Creates the default for the poll in the database
                question: data[0].value,
                options: [],
                messageId: ''
            });
            polldb.update(pollData);
            db.saveDatabase();
        }
        
        // Checks if the optionData is valid
        if (optionData.length > 0) {
            // Goes through the optionData and parses it into buttons and adds them to the database
            for (let i in optionData) {
                // Button created is a basic style with custom id of poll-(index of poll)-(index of option)
                buttonComponents.push({
                    style: 1,
                    label: optionData[i].value,
                    custom_id: `poll-${index}-${i}`,
                    disabled: false,
                    type: 2
                });

                // Adds options related to button for future reference in the interaction-handler (./src/interaction-handlers/poll.js)
                // Includes custom_id and label text from button. Entries is used in the interaction-handler 
                pollData.data[index].options.push({
                    name: optionData[i].value,
                    buttonId: `poll-${index}-${i}`,
                    entries: []
                });
            }
        }

        // Sends the poll to the designated poll channel from the config (./src/config.json)
        let poll = await channel.send({
            embeds: [
                {
                    color: '#c8a2c8',
                    author: interaction.user,
                    title: data[0].value  // Sets the title to the question
                }
            ],
            components: [
                {
                    type: 1,
                    components: buttonComponents
                }
            ]
        });

        // Checks if the poll message was sent to the chat 
        if (isMessageInstance(poll)) {
            // Adds the message id to the database in the case it needs to be edited
            pollData.data[index].messageId = poll.id;
            // Adds the message id to an array in the database
            pollData.messageIds.push(poll.id);
            // Updates and saves the edited data to the db
            polldb.update(pollData);
            db.saveDatabase();

            // Finishes the interaction if successful
            return interaction.editReply(`Poll posted in <#${channel.id}>`);
        }

        // If the poll message was not sent, data is not saved to the db
        return interaction.editReply('Poll post failed');
    }
}

module.exports = {
    NewCommand
}