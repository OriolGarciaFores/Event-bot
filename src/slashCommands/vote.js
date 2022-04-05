const utils = require('../modules/Utils.js');
const COLOR = require('../constants/colors.js');
const EMOJI = require('../constants/emojis.js');
const CONSTANTS = require('../constants/constants.js');
const LITERAL = require('../constants/literals.js');

const RESPUESTAS_REACTIONS = [EMOJI.A, EMOJI.B, EMOJI.C, EMOJI.D, EMOJI.E];
const MAX_SIZE_BAR = 20;

module.exports = {
	slash : {
        name : 'vote',
		description : 'Votación de 2-5 respuestas posibles.',
		type : CONSTANTS.SLASH_TYPE_INPUT,
        options : [
            {
                name : "pregunta",
                description : "¿Pregunta?",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
                required : true
            },
            {
                name : "respuesta_1",
                description : "Respuesta 1",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
                required : true
            },
            {
                name : "respuesta_2",
                description : "Respuesta 2",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
                required : true
            },
            {
                name : "respuesta_3",
                description : "Respuesta 3 (Opcional)",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING
            },
            {
                name : "respuesta_4",
                description : "Respuesta 4 (Optcional)",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING
            },
            {
                name : "respuesta_5",
                description : "Respuesta 5 (Opcional)",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING
            }

        ]
    },
	reactions: true,
	async execute(interaction, options, client) {
		let embed = initEmbed();
        let question = options.getString("pregunta");
        let bar = utils.progressBar(0, 1, MAX_SIZE_BAR);
        let respuestas = [];

		if(interaction.guildId === null) return;

        for (let i = 1; i < 6; i++) {
            let optionName = "respuesta_" + i;
            let value = options.getString(optionName);

            if (value !== null) respuestas.push(value);
        }

        embed.fields = [];
        embed.description = utils.textNegrita(question);

        for (let i = 0; i < respuestas.length; i++) {
            let field = {
                name: RESPUESTAS_REACTIONS[i] + ' ' + respuestas[i],
                value: bar + ' V: 0'
            }

            embed.fields[i] = field;
        }

        embed.footer.text = LITERAL.FOOTER_TEXT + interaction.user.username + '#' + interaction.user.discriminator;
		embed.timestamp = new Date();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        for (let i = 0; i < respuestas.length; i++) {
            msg.react(RESPUESTAS_REACTIONS[i]);
        }

        msg.react(CONSTANTS.DELETE_REACT);
	},
	async reactionAdd(reaction, user) {
		const OPERATION = '+';
		var embed = reaction.message.embeds[0];
		let fields = embed.fields;
		var userId = user.username + '#' + user.discriminator;
		var creadorEmber = embed.footer.text.split(LITERAL.FOOTER_TEXT)[1];
		let oldReactionUser = await utils.getOldReactionByUser(reaction, user);
		let emoji = reaction.emoji.name;
		let totalVotos = 0;

		if(!validarRespuestas(fields.length, emoji) && emoji !== CONSTANTS.DELETE_REACT) return;

		if (oldReactionUser !== undefined) {
			await reaction.message.reactions.resolve(emoji).users.remove(user.id);
			return;
		}

		if (emoji === CONSTANTS.DELETE_REACT) {
			if (userId === creadorEmber) reaction.message.delete();
			else await reaction.message.reactions.resolve(emoji).users.remove(user.id);
		} else {
			let position = 0;

			position = buscarPosicionRespuesta(emoji, position);
			totalVotos = calcularTotalVotos(fields, totalVotos);

			totalVotos++;

			updateFields(fields, position, totalVotos, OPERATION)

			embed.setFields(fields);

			await reaction.message.edit({ embeds: [embed] });
		}
	},
	async reactionRemove(reaction, user) {
		const OPERATION = '-';
		var embed = reaction.message.embeds[0];
		let emoji = reaction.emoji.name;
		let totalVotos = 0;
		let fields = embed.fields;
		let position = 0;

		if (emoji === CONSTANTS.DELETE_REACT || !validarRespuestas(fields.length, emoji)) return;
		let oldReactionUser = await utils.getOldReactionByUser(reaction, user);
		
		if(oldReactionUser !== undefined) return;

		position = buscarPosicionRespuesta(emoji);
		totalVotos = calcularTotalVotos(fields);

		totalVotos--;

		updateFields(fields, position, totalVotos, OPERATION)

		embed.setFields(fields);

		await reaction.message.edit({ embeds: [embed] });
	}
};

function initEmbed(){
	let embed = {
		color: COLOR.GREEN,
		title: 'VOTE',
		description: '**¿Pregunta?**',
		fields: [],
		timestamp: new Date(),
		footer: {
			text: 'Creado por XXX'
		}
	};

	return embed;
}

function validarRespuestas(cantidadRespuestas, emoji){
	for(let i = 0; i < cantidadRespuestas; i++){
		if(emoji === RESPUESTAS_REACTIONS[i]) return true;
	}

	return false;
}

function buscarPosicionRespuesta(emoji) {
	for (let i = 0; i < RESPUESTAS_REACTIONS.length; i++) {
		if (emoji === RESPUESTAS_REACTIONS[i]) {
			return i;
		}
	}
}

function calcularTotalVotos(fields) {
	let totalVotos = 0;

	for (let i = 0; i < fields.length; i++) {
		totalVotos += parseInt(fields[i].value.split('V: ')[1]);
	}

	return totalVotos;
}


function updateFields(fields, position, totalVotos, operation) {
	for (let i = 0; i < fields.length; i++) {
		let bar;
		let votos = fields[i].value.split('V: ')[1];

		votos = parseInt(votos);

		if (operation === '-') {
			if (i === position && votos > 0) {
				votos--;
				bar = utils.progressBar(votos, totalVotos, MAX_SIZE_BAR);
			} else {
				bar = utils.progressBar(votos, totalVotos, MAX_SIZE_BAR);
			}
		} else {
			if (i === position) {
				votos++;
				bar = utils.progressBar(votos, totalVotos, MAX_SIZE_BAR);
			} else {
				bar = utils.progressBar(votos, totalVotos, MAX_SIZE_BAR);
			}
		}

		fields[i].value = bar + ' V: ' + votos;
	}

}