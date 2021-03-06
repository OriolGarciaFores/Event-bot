const color = require('../constants/colors.js');
const constant = require('../constants/constants.js');

const TITLE_EMBED = 'PING';

module.exports = {
    slash : {
        name : 'ping',
		description : 'Realiza un test de velocidad con la comunicación.',
		type : constant.SLASH_TYPE_INPUT
    },
	reactions: false,
	async execute(interaction,  options, client) {
        let embed = initEmbed();
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

function initEmbed(){
    let embed = {
        color: color.GREY,
        title: TITLE_EMBED,
        description: 'Calculando ping...',
        fields: [],
        timestamp: new Date()
    };

    return embed;
}