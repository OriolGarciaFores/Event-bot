const constant = require('../constants/constants.js');
const color = require('../constants/colors.js');

module.exports = {
    slash : {
        name : 'adduser',
		description : 'Comando para añadir un usuario en un evento existente.',
        options : [
            {
                name: 'evento',
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
                    },
                    {
                        name : "rol",
                        description : "Rol (TANK, DPS, HEAL).",
                        type : constant.SLASH_OPTION_TYPE_STRING,
                        required : true,
                        choices : [
                            {
                                name: constant.TANK + ' TANK',
                                value: constant.TANK
                            },
                            {
                                name: constant.DPS + ' DPS',
                                value: constant.DPS
                            },
                            {
                                name: constant.HEAL + ' HEAL',
                                value: constant.HEAL
                            }
                        ]
                    }
                ]
            }
        ]
    },
	reactions: false,
	async execute(interaction,  options, client) {
        const eventId = options.getString('event_id');
        const nombreUsuario = options.getString('user_name');
        const rol = options.getString('rol');
        const message = await client.channels.cache.get(interaction.channelId).messages.fetch(eventId);
        const embed = message.embeds[0];
        const type = embed.title.toLowerCase().split(' - ')[0];
        const command = client.slashCommands.get(type);
        

        if(type === 'evento'){
            await command.addUserCustom(message, interaction, nombreUsuario, rol);
        }else{
            await interaction.reply({constent: 'Error, no es posible añadir el usuario en este tipo de evento.', ephemeral: true});
        }        
	}
};