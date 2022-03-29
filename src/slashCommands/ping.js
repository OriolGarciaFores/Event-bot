const color = require('../constants/colors.js');
const constant = require('../constants/constants.js');

const TITLE_EMBED = 'PING';

const embed = {
	color: color.BLUE,
	title: TITLE_EMBED,
	description: 'Calculando ping...',
	fields: [],
	timestamp: new Date()
};

module.exports = {
    slash : {
        name : 'ping',
		description : 'Realiza un test de velocidad con la comunicación.',
		type : constant.SLASH_TYPE_INPUT
    },
	reactions: false,
	async execute(interaction,  options, client) {
        embed.timestamp = new Date();
        const msg = await interaction.reply({embeds : [embed], fetchReply: true});
        const pingBot = msg.createdTimestamp - interaction.createdTimestamp;

        let fieldBotPing = {
            name: 'Bot ping',
            value: pingBot + ' ms',
            inline: true
        }

        let fieldApiPing = {
            name: 'Api ping',
            value: client.ws.ping + ' ms',
            inline: true
        }

        embed.description = 'Resultado del test de velocidad.';
        embed.fields[0] = fieldBotPing;
        embed.fields[1] = fieldApiPing;

		await msg.edit({embeds: [embed]});
	}
};