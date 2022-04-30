const utils = require('../modules/Utils.js');
const COLOR = require('../constants/colors.js');
const EMOJI = require('../constants/emojis.js');
const CONSTANTS = require('../constants/constants.js');
const LITERAL = require('../constants/literals.js');

const embed = {
	color: COLOR.GREEN,
	title: 'VOTE',
	description: '**¿Pregunta?**',
	fields: [],
	timestamp: new Date(),
	footer: {
		text: 'Creado por XXX'
	}
};

const RESPUESTAS_REACTIONS = [EMOJI.A, EMOJI.B, EMOJI.C, EMOJI.D, EMOJI.E];
const MAX_SIZE_BAR = 20;

module.exports = {
	name: 'vote',
	reactions: true,
	async execute(message, content, client) {
		await message.reply(CONSTANTS.TEXT_WARNING_DEPRECATE_COMMAND);
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

function validarRequisitos(question, respuestas){
	if(respuestas.length > 5 || respuestas.length < 2) return false;
	else {
		for(let i = 0; i < respuestas.length; i++){
			if(respuestas[i].trim() === '') {
				return false;
			}
		}
	}
	if(question === undefined || question.length === 0 || question.trim() === '') return false;

	return true;
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