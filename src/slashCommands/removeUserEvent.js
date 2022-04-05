const constant = require('../constants/constants.js');
const log = require('../modules/logger');

module.exports = {
    slash : {
        name : 'removeuser',
		description : 'Comando para eliminar un usuario inexistinte en un evento existente.',
        options : [
            {
                name: 'event',
                description: 'evento',
                type: constant.SLASH_TYPE_SUB_COMMAND,
                options : [
                    {
                        name : "event_id",
                        description : "Identificador del evento.",
                        type : constant.SLASH_OPTION_TYPE_STRING,
                        required : true
                    },
                    {
                        name : "user_name",
                        description : "Nombre del usuario.",
                        type : constant.SLASH_OPTION_TYPE_STRING,
                        required : true
                    }
                ]
            }
        ]
    },
	reactions: false,
	async execute(interaction,  options, client) {
        const eventId = options.getString('event_id');
        const nombreUsuario = options.getString('user_name');
        const message = await client.channels.cache.get(interaction.channelId).messages.fetch(eventId);
        const embed = message.embeds[0];
        const type = embed.title.toLowerCase().split(' - ')[0];
        const command = client.slashCommands.get(type);

        if(type === 'evento'){
            await command.removeUserCustom(message, interaction, nombreUsuario);
            log.info('Se ha retirado un usuario de un evento. Usuario retirado: ' + nombreUsuario);
        }else{
            await interaction.reply({constent: 'Error, no es posible retirar el usuario en este tipo de evento.', ephemeral: true});
            log.error('Error, no es posible retirar el usuario en este tipo de evento.');
        }

	}
};