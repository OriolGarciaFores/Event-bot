const LITERAL = require('../constants/literals.js');
const CONSTANTS = require('../constants/constants.js');
const COLOR = require('../constants/colors.js');
const utils = require('../modules/Utils.js');
const log = require('../modules/logger');
const fs = require('fs');

const TITLE_EMBED = 'EVENTO';

module.exports = {
	slash : {
        name : 'evento',
		description : 'Para crear el evento que distribuye en 3 roles (tank, dps y heal).',
		type : CONSTANTS.SLASH_TYPE_INPUT,
        options : [
			{
                name : "titulo",
                description : "Título del evento.",
                type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
				required: true
            },
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
            },
			{
				name : "url_img",
				description : "URL para añadir una imagen al evento.",
				type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
				required : false
			}
        ]
    },
	reactions: true,
	editable: true,
	async execute(interaction, options, client) {
		let embed = initEmbed();
		let titulo = options.getString('titulo');
        let descripcion = options.getString('description');
        let horario = options.getString('horario');
		let urlImage = options.getString('url_img');

		descripcion = descripcion.replaceAll('\\n', '\n');

		if(interaction.guildId === null) return;

		embed.title = TITLE_EMBED + ' - ' + titulo;
        embed.description = descripcion;
        embed.fields[0].value = horario;
		if(utils.isImage(urlImage)) embed.image = { url: urlImage};
        embed.footer.text = LITERAL.FOOTER_TEXT + interaction.user.username + '#' + interaction.user.discriminator;

        const msg = await interaction.reply({embeds: [embed], fetchReply: true });

        msg.react(CONSTANTS.TANK);
        msg.react(CONSTANTS.DPS);
        msg.react(CONSTANTS.HEAL);
		msg.react(CONSTANTS.EDIT_REACT);
        msg.react(CONSTANTS.DELETE_REACT);

		guardarCache(msg);

		log.info('Se ha generado un /evento.');
	},
	async reactionAdd(reaction, user){
		let embed = reaction.message.embeds[0];
		let username = user.username;
		let userId = username + '#' + user.discriminator;
		let creadorEmber = embed.footer.text.split(LITERAL.FOOTER_TEXT)[1];
		let oldReactionUser = await utils.getOldReactionByUser(reaction, user);
		let emoji = reaction.emoji.name;
		let member = await reaction.message.guild.members.fetch(user.id);

		if (emoji === CONSTANTS.DELETE_REACT){
			if(userId === creadorEmber) reaction.message.delete();
			else reaction.message.reactions.resolve(emoji).users.remove(user.id);
		}

		if(emoji === CONSTANTS.EDIT_REACT){
			if(userId != creadorEmber && !utils.validateMemberPermissionEdit(member) ){
				log.debug('Usuario sin permiso de edición.');
				reaction.message.reactions.resolve(emoji).users.remove(user.id);
				return;
			}
		}

		if(oldReactionUser !== undefined && emoji !== CONSTANTS.EDIT_REACT) {
			await reaction.message.reactions.resolve(emoji).users.remove(user.id);
			return;
		}

		if (emoji !== CONSTANTS.DELETE_REACT) {
			if(emoji !== CONSTANTS.EDIT_REACT){
				let fields = embed.fields;
				let position = 0;
	
				switch (emoji) {
					case CONSTANTS.DPS:
						position = getPositionField(fields, LITERAL.FIELD_NAME_DPS);
						fields[position] = editarField(fields[position], username);
						break;
					case CONSTANTS.HEAL:
						position = getPositionField(fields, LITERAL.FIELD_NAME_HEAL);
						fields[position] = editarField(fields[position], username);
						break;
					case CONSTANTS.TANK:
						position = getPositionField(fields, LITERAL.FIELD_NAME_TANK);
						fields[position] = editarField(fields[position], username);
						break;
				}
	
				fields = calcularParticipantes(fields);
				embed.setFields(fields);
				await reaction.message.edit({ embeds: [embed] });
			}else{
				let embedInfo = {
					color: COLOR.GREY,
					description: 'description'
				}
				let embedEditable = {
					color: COLOR.GREY,
					title: 'Escoge el número del campo que quieras modificar',
					fields: []
				}
				const channelId = reaction.message.channelId;
				const guildId = reaction.message.guildId;
				const messageId = reaction.message.id;
				const tituloEvento = embed.title;
				const image_url = embed.image !== null ? embed.image.url : '\u200B';

				embedInfo.description = 'Ejecuta el comando /edit con el campo messageId: **' + messageId +
					'** el número del campo que deseas editar y el texto que quieras que salga en el canal del evento creado. ' +
					'[' + tituloEvento + '](https://discord.com/channels/' + guildId + '/' + channelId + '/' + messageId + ')';

				embedEditable.fields[0] = { name: '1 - Título', value: '```' + embed.title + '```' }
				embedEditable.fields[1] = { name: '2 - Descripción', value: '```' + embed.description + '```' }
				embedEditable.fields[2] = { name: '3 - Horario', value: '```' + embed.fields[0].value + '```' }
				embedEditable.fields[3] = { name: '4 - Url imagen', value: '```' + image_url + '```' }

				user.send({ embeds: [embedEditable, embedInfo] });
				reaction.message.reactions.resolve(emoji).users.remove(user.id);
			}
		}
	},
	async reactionRemove(reaction, user){
		var embed = reaction.message.embeds[0];
		var fields = embed.fields;

		switch (reaction.emoji.name) {
			case CONSTANTS.DPS:
				fields = retirarUserField(fields, user.username, LITERAL.FIELD_NAME_DPS);
				break;
			case CONSTANTS.HEAL:
				fields = retirarUserField(fields, user.username, LITERAL.FIELD_NAME_HEAL);
				break;
			case CONSTANTS.TANK:
				fields = retirarUserField(fields, user.username, LITERAL.FIELD_NAME_TANK);
				break;
		}

		fields = calcularParticipantes(fields);
		embed.setFields(fields);
		await reaction.message.edit({ embeds: [embed] });
	},
	async edit(interaction, message, campoId, contenido){
		let embed = message.embeds[0];
		let creadorEmber = embed.footer.text.split(LITERAL.FOOTER_TEXT)[1];
		let user = interaction.user;
		let userNameNumber = user.username + '#' + user.discriminator;
		let member = await message.guild.members.fetch(user.id);
		const embedInfo = {
			color: COLOR.GREEN,
			description: 'Mensaje modificado.'
		}

		if(userNameNumber != creadorEmber && !utils.validateMemberPermissionEdit(member) ){
			embedInfo.color = COLOR.RED;
			embedInfo.description = 'No tienes permisos para editar.';
			log.debug('Usuario sin permiso de edición.');
			await interaction.reply({embeds: [embedInfo], ephemeral: true });
		}else{
			switch (campoId) {
				case '1':
					embed.title = embed.title.split(' - ')[0] + ' - ' + contenido;
					break;
				case '2':
					embed.description = contenido;
					break;
				case '3':
					embed.fields[0].value = contenido;
					break;
				case '4':
					if(utils.isImage(urlImage)) embed.image = { url: contenido};
					break;
				default:
					log.error('/evento editar -> CAMPO_ID incorrecto.');
					
					embed.color = COLOR.RED;
					embed.description = 'CAMPO_ID incorrecto.';
	
					return await interaction.reply({embeds: [embedInfo], ephemeral: true});
			}
	
			await message.edit({embeds: [embed]});
			await interaction.reply({embeds: [embedInfo], ephemeral: true });
			log.info('Se ha modificado un bloque de texto bot.');
		}
	},
	async addUserCustom(message, interaction, nombreUsuario, rol){
		let embed = message.embeds[0];
		let fields = embed.fields;
		let position = 0;
		let existe = false;
		const typeFields = [LITERAL.FIELD_NAME_TANK, LITERAL.FIELD_NAME_DPS, LITERAL.FIELD_NAME_HEAL];
		const embedInfo = {
            color: COLOR.GREEN
        }

		for(let f = 0; f < typeFields.length; f++){
			for (let i = 0; i < fields.length; i++) {
				if (fields[i].name.includes(typeFields[f])) {
					let listUsers = fields[i].value.split('\n');

					if(listUsers.includes(nombreUsuario)){
						existe = true;
						break;
					}
				}
			}
		}

		if(!existe){
			embedInfo.description = 'Usuario ' + nombreUsuario + ' añadido como rol ' + rol;

			switch (rol) {
				case CONSTANTS.DPS:
					position = getPositionField(fields, LITERAL.FIELD_NAME_DPS);
					fields[position] = editarField(fields[position], nombreUsuario);
					break;
				case CONSTANTS.HEAL:
					position = getPositionField(fields, LITERAL.FIELD_NAME_HEAL);
					fields[position] = editarField(fields[position], nombreUsuario);
					break;
				case CONSTANTS.TANK:
					position = getPositionField(fields, LITERAL.FIELD_NAME_TANK);
					fields[position] = editarField(fields[position], nombreUsuario);
					break;
			}
	
			fields = calcularParticipantes(fields);
			embed.setFields(fields);
			
			await message.edit({ embeds: [embed] });
			await interaction.reply({embeds: [embedInfo], ephemeral: true});
		}else{
			embedInfo.color = COLOR.RED;
			embedInfo.description = 'Usuario ' + nombreUsuario + ' ya está apuntado!';
			await interaction.reply({embeds: [embedInfo], ephemeral: true});
		}
	},
	async removeUserCustom(message, interaction, nombreUsuario){
		let embed = message.embeds[0];
		let fields = embed.fields;
		const embedInfo = {
            color: COLOR.GREEN,
			description: 'Usuario ' + nombreUsuario + ' retirado.'
        }

		fields = retirarUserField(fields, nombreUsuario, LITERAL.FIELD_NAME_DPS);
		fields = retirarUserField(fields, nombreUsuario, LITERAL.FIELD_NAME_HEAL);
		fields = retirarUserField(fields, nombreUsuario, LITERAL.FIELD_NAME_TANK);

		fields = calcularParticipantes(fields);
		embed.setFields(fields);

		await message.edit({ embeds: [embed] });
		await interaction.reply({embeds: [embedInfo], ephemeral: true});
	}
};

function initEmbed(){
	let embed = {
		color: COLOR.GREY,
		title: TITLE_EMBED,
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

	return embed;
}

function guardarCache(message){
	fs.readFile('./src/resources/cache/guildsMessages.json', async (err, data) => {
		if (err) log.error(err);
		if (data.length != 0) {
			let dataCache = JSON.parse(data);
			let guildsCache = dataCache.guilds;
			let guildId = message.guildId;
			let channelId = message.channelId;
			let guildExist = false;
			let channelExist = false;

			for (const guildCache of guildsCache){
				if(guildCache.guildId == guildId){
					let channels = guildCache.channelsId;
					guildExist = true;

					if(channels.includes(channelId)){
						channelExist = false;
						break;
					}else{
						guildCache.channelsId.push(channelId);
						break;
					}
				}else{

				}
			}

			if(!guildExist){
				let guild = {
					"guildId" : guildId,
					"channelsId" : [channelId]
				}

				guildsCache.push(guild);
			}

			let guilds = {
				"guilds": guildsCache
			}
			

			if(!guildExist || !channelExist){
				let dataJson = JSON.stringify(guilds);
				fs.writeFileSync('./src/resources/cache/guildsMessages.json', dataJson);
			}

		} else {
			log.info("No hay cache.");
		}
	});

	 
	
}



function getPositionField(fields, id) {
	for (let i = 0; i < fields.length; i++) {
		if (fields[i].name.includes(id)) return i;
	}

	return;
}

function editarField(field, username) {
	if (field.value === '' || field.value === '\u200b') field = {
		name: field.name,
		value: username,
		inline: true
	};
	else
		field.value = field.value + '\n' + username;

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

function retirarUserField(fields, username, nameField) {
	let position = getPositionField(fields, nameField);
	let myArray = fields[position].value.split("\n");
	let participantes = '';

	myArray = myArray.filter(e => e !== username);

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