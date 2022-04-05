const constant = require('../constants/constants.js');
const utils = require('../modules/Utils.js');
const log = require('../modules/logger');

module.exports = {
    slash : {
        name : 'edit',
		description : 'Comando para editar bloques de texto del bot.',
		type : constant.SLASH_TYPE_INPUT,
        options : [
			{
                name : "message_id",
                description : "Identificador del mensaje.",
                type : constant.SLASH_OPTION_TYPE_STRING,
				required: true
            },
            {
                name : "campo_id",
                description : "El numero del campo que se va a modificar.",
                type : constant.SLASH_OPTION_TYPE_STRING,
                required : true
            },
            {
                name : "contenido",
                description : "Contenido con el que se va a rellenar el campo.",
                type : constant.SLASH_OPTION_TYPE_STRING,
                required : true
            }
        ]
    },
	reactions: false,
	async execute(interaction,  options, client) {
        const messageId = options.getString('message_id');
        const campoId = options.getString('campo_id');
        const contenido = options.getString('contenido');
        const message = await client.channels.cache.get(interaction.channelId).messages.fetch(messageId);
        const embed = message.embeds[0];
        const type = embed.title.toLowerCase().split(' - ')[0];
        const command = client.slashCommands.get(type);

        if (!command || !command.editable) {
            await interaction.reply({content: 'No se puede modificar.', fetchReply: true, ephemeral: true });
            log.warn('No se ha podido modificar un bloque de texto bot.');
        }else{
            await command.edit(interaction, message, campoId, contenido);
        }
	}
};