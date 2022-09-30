const config = require('../config.json'),
    { Precondition } = require('@sapphire/framework');

class ModPermsPrecondition extends Precondition {
    async chatInputRun(interaction) {
        return this.checkPerms(interaction);
    }

    async contextMenuRun(interaction) {
        return this.checkPerms(interaction);
    }

    async checkPerms(interaction) {
        let validId = config.roles.admin;
        let roles = interaction.member.roles.cache;

        if (roles.has(validId)) {
            return this.ok();
        } else {
            return this.error({ message: 'Only mods and higher can use this command!'});
        }
    }
}

module.exports = {
    ModPermsPrecondition
}