const constant = require('../constants/constants.js');
const literal = require('../constants/literals.js');
const log = require('../modules/logger.js');
const { MessageFlags } = require('discord.js');

module.exports = {
    slash: {
        name: 'remove',
        description: 'Comando para eliminar eventos creados con /evento.',
        type: constant.SLASH_TYPE_INPUT,
        options: [
            {
                name: 'evento',
                description: 'eliminar evento',
                type: constant.SLASH_TYPE_SUB_COMMAND,
                options: [
                    {
                        name: "event_id",
                        description: "Identificador del evento.",
                        type: constant.SLASH_OPTION_TYPE_STRING,
                        required: true
                    }
                ]
            }
        ]
    },
    reactions: false,
    async execute(interaction,  options, client) {
        const eventId = options.getString('event_id');
        const message = await client.channels.cache.get(interaction.channelId).messages.fetch(eventId);
        const type = message.interaction.commandName;
        const command = client.slashCommands.get(type);

        if(type === 'evento') {
            await command.remove(interaction, message);
            log.info('Se ha eliminado un /evento');
        } else {
            await interaction.reply({constent: literal.ERROR_REMOVE, flags: MessageFlags.Ephemeral});
            log.error(literal.ERROR_REMOVE);
        }
    }
};