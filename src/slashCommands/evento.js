const LITERAL = require('../constants/literals.js');
const CONSTANTS = require('../constants/constants.js');
const COLOR = require('../constants/colors.js');
const utils = require('../modules/Utils.js');

const embed = {
	color: COLOR.BLUE,
	title: 'EVENTO',
	description: 'Ej: El domingo 23 de enero volvemos a intentar hacer grupo para realizar las primeras TRIALS del mapa de Clagorn.',
	fields: [
		{
			name: LITERAL.TITLE_HORARIO,
			value: 'Ej: Dom. 17:00 EU',
		},
		{
			name: LITERAL.FIELD_NAME_PARTICIPANTES,
			value: LITERAL.FIELD_PARTICIPANTES_TOTAL + '0',
		},
		{ name: LITERAL.FIELD_NAME_TANK + ' - 0', value: '\u200B', inline: true },
		{ name: LITERAL.FIELD_NAME_DPS + ' - 0', value: '\u200B', inline: true },
		{ name: LITERAL.FIELD_NAME_HEAL + ' - 0', value: '\u200B', inline: true },
		{ name: '\u200b', value: '\u200b' }
	],
	timestamp: new Date(),
	footer: {
		text: 'Creado por XXX'
	}
};

module.exports = {
	slash : {
        name : 'evento',
		description : 'Para crear el evento que distribuye en 3 roles (tank, dps y heal).',
		type : CONSTANTS.SLASH_TYPE_INPUT,
        options : [
            {
                name : "description",
                description : "Descripción del evento",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
                required : true
            },
            {
                name : "horario",
                description : "Horario del evento",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
                required : true
            }
        ]
    },
	reactions: true,
	async execute(interaction, options, client) {
        let descripcion = options.getString('description');
        let horario = options.getString('horario');

        embed.description = descripcion;
        embed.fields[0].value = horario;
        embed.footer.text = LITERAL.FOOTER_TEXT + interaction.user.username + '#' + interaction.user.discriminator;

        const msg = await interaction.reply({ content: "@everyone", embeds: [embed], fetchReply: true });

        msg.react(CONSTANTS.TANK);
        msg.react(CONSTANTS.DPS);
        msg.react(CONSTANTS.HEAL);
        msg.react(CONSTANTS.DELETE_REACT);
	},
	async reactionAdd(reaction, user){
		let embed = reaction.message.embeds[0];
		let userId = user.username + '#' + user.discriminator;
		let creadorEmber = embed.footer.text.split(LITERAL.FOOTER_TEXT)[1];
		let oldReactionUser = await utils.getOldReactionByUser(reaction, user);
		let emoji = reaction.emoji.name;

		if(oldReactionUser !== undefined) {
			await reaction.message.reactions.resolve(emoji).users.remove(user.id);
			return;
		}
		
		if (emoji === CONSTANTS.DELETE_REACT){
			if(userId === creadorEmber) reaction.message.delete();
			else reaction.message.reactions.resolve(emoji).users.remove(user.id);
		}
		if (emoji !== CONSTANTS.DELETE_REACT) {
			let fields = embed.fields;
			let position = 0;

			switch (emoji) {
				case CONSTANTS.DPS:
					position = getPositionField(fields, LITERAL.FIELD_NAME_DPS);
					fields[position] = editarField(fields[position], user);
					break;
				case CONSTANTS.HEAL:
					position = getPositionField(fields, LITERAL.FIELD_NAME_HEAL);
					fields[position] = editarField(fields[position], user);
					break;
				case CONSTANTS.TANK:
					position = getPositionField(fields, LITERAL.FIELD_NAME_TANK);
					fields[position] = editarField(fields[position], user);
					break;
			}

			fields = calcularParticipantes(fields);
			embed.setFields(fields);
			await reaction.message.edit({ embeds: [embed] });
		}
	},
	async reactionRemove(reaction, user){
		var embed = reaction.message.embeds[0];
		var fields = embed.fields;

		switch (reaction.emoji.name) {
			case CONSTANTS.DPS:
				fields = retirarUserField(fields, user, LITERAL.FIELD_NAME_DPS);
				break;
			case CONSTANTS.HEAL:
				fields = retirarUserField(fields, user, LITERAL.FIELD_NAME_HEAL);
				break;
			case CONSTANTS.TANK:
				fields = retirarUserField(fields, user, LITERAL.FIELD_NAME_TANK);
				break;
		}

		fields = calcularParticipantes(fields);
		embed.setFields(fields);
		await reaction.message.edit({ embeds: [embed] });
	}
};

function getPositionField(fields, id) {
	for (let i = 0; i < fields.length; i++) {
		if (fields[i].name.includes(id)) return i;
	}

	return;
}

function editarField(field, user) {
	if (field.value === '' || field.value === '\u200b') field = {
		name: field.name,
		value: user.username,
		inline: true
	};
	else
		field.value = field.value + '\n' + user.username;

	return field;
}
function calcularParticipantes(fields) {
	let posicionDps = getPositionField(fields, LITERAL.FIELD_NAME_DPS);
	let posicionHeal = getPositionField(fields, LITERAL.FIELD_NAME_HEAL);
	let posicionTank = getPositionField(fields, LITERAL.FIELD_NAME_TANK);
	let posicionParticipantes = getPositionField(fields, LITERAL.FIELD_NAME_PARTICIPANTES);
	
	let participantes = [];

	let dps = fields[posicionDps].value.split('\n');
	let heal = fields[posicionHeal].value.split('\n');
	let tank = fields[posicionTank].value.split('\n');

	dps = dps.filter(item => item !== '\u200b');
	heal = heal.filter(item => item !== '\u200b');
	tank = tank.filter(item => item !== '\u200b');

	for(let i = 0; i <  dps.length; i++){
		if(!participantes.includes(dps[i])) participantes.push(dps[i]);
	}

	for(let i = 0; i <  heal.length; i++){
		if(!participantes.includes(heal[i])) participantes.push(heal[i]);
	}

	for(let i = 0; i <  tank.length; i++){
		if(!participantes.includes(tank[i])) participantes.push(tank[i]);
	}

	participantes = participantes.filter(item => item !== '\u200b');
	
	fields[posicionParticipantes].value = LITERAL.FIELD_PARTICIPANTES_TOTAL + participantes.length + '';
	fields[posicionDps].name = LITERAL.FIELD_NAME_DPS + ' - ' + dps.length;
	fields[posicionTank].name = LITERAL.FIELD_NAME_TANK + ' - ' + tank.length;
	fields[posicionHeal].name = LITERAL.FIELD_NAME_HEAL + ' - ' + heal.length;
	return fields;
}

function retirarUserField(fields, user, nameField) {
	let position = getPositionField(fields, nameField);
	let myArray = fields[position].value.split("\n");
	let participantes = '';

	myArray = myArray.filter(e => e !== user.username);

	if (myArray.length == 0) {
		fields[position].value = '\u200b';
	} else {
		for (let i = 0; i < myArray.length; i++) {
			if(participantes === '') participantes = myArray[i];
			else
			participantes = participantes + '\n' + myArray[i];
		}
		fields[position].value = participantes;
	}

	return fields;
}