const LITERAL = require('../constants/literals.js');
const CONSTANTS = require('../constants/constants.js');
const COLOR = require('../constants/colors.js');
const utils = require('../modules/Utils.js');
const log = require('../modules/logger');
const { EmbedBuilder, MessageFlags } = require('discord.js');

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
				name: "crear_hilo",
				description: "¿Quieres crear un hilo?",
				type: CONSTANTS.SLASH_OPTION_TYPE_STRING,
				required: true,
				choices: [
					{
						name: 'Si',
						value: 'S'
					},
					{
						name: 'No',
						value: 'N'
					}
				]
			},
			{
				name : "url_img",
				description : "URL para añadir una imagen al evento.",
				type : CONSTANTS.SLASH_OPTION_TYPE_STRING,
				required : false
			},
			{
				name: "menciones",
				description: "Para añadir lista de menciones que notificar (@everyone, @rol, @usuario, etc...).",
				type: CONSTANTS.SLASH_OPTION_TYPE_STRING,
				required: false
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
		const permisoCrearHilo = utils.getBooleanSiNo(options.getString('crear_hilo'));
		let urlImage = options.getString('url_img');
		let menciones = options.getString('menciones');
		let mencionesValidas = "";

		descripcion = descripcion.replaceAll('\\n', '\n');

		if(interaction.guildId === null) return;

		embed.title = titulo;
        embed.description = descripcion;
        embed.fields[0].value = horario;
		if(utils.isImage(urlImage)) embed.image = { url: urlImage};
        embed.footer.text = interaction.user.username;
		embed.footer.iconURL = interaction.user.displayAvatarURL() + '?id=' + interaction.user.id

		if (menciones) {
			const mencionesList = menciones.split(/ +/);

			mencionesValidas = await obtenerListaMenciones(client, mencionesList, interaction.guildId);
		}

		if (mencionesValidas != "") await interaction.reply({embeds: [embed], content: mencionesValidas}); 
        else await interaction.reply({embeds: [embed]});

		const msg = await interaction.fetchReply();

		if (permisoCrearHilo) {
			await msg.startThread({
				name: `${titulo} - ${horario}`,
				reason: 'Hilo para tratar del evento'
			});
		}

        await msg.react(CONSTANTS.TANK);
        await msg.react(CONSTANTS.DPS);
        await msg.react(CONSTANTS.HEAL);
		await msg.react(CONSTANTS.EDIT_REACT);
        await msg.react(CONSTANTS.DELETE_REACT);

		log.info('Se ha generado un /evento.');
	},
	async reactionAdd(reaction, user){
		let embed = EmbedBuilder.from(reaction.message.embeds[0]);
		let username = user.username;
		let creadorEmber = embed.data.footer.icon_url.split('?id=')[1];
		let oldReactionUser = await utils.getOldReactionByUser(reaction, user);
		let emoji = reaction.emoji.name;
		let member = await reaction.message.guild.members.fetch(user.id);
		let fields = embed.data.fields;
		let position = 0;

		if(oldReactionUser !== undefined && emoji !== CONSTANTS.EDIT_REACT) {
			await reaction.message.reactions.resolve(emoji).users.remove(user.id);
			return;
		}

		switch(emoji) {
			case CONSTANTS.DPS:
				position = getPositionField(fields, LITERAL.FIELD_NAME_DPS);
				fields[position] = editarField(fields[position], username);
				fields = calcularParticipantes(fields);

				await reaction.message.edit({ embeds: [embed] });
				break;
			case CONSTANTS.HEAL:
				position = getPositionField(fields, LITERAL.FIELD_NAME_HEAL);
				fields[position] = editarField(fields[position], username);
				fields = calcularParticipantes(fields);

				await reaction.message.edit({ embeds: [embed] });
				break;
			case CONSTANTS.TANK:
				position = getPositionField(fields, LITERAL.FIELD_NAME_TANK);
				fields[position] = editarField(fields[position], username);
				fields = calcularParticipantes(fields);

				await reaction.message.edit({ embeds: [embed] });
				break;
			case CONSTANTS.EDIT_REACT:
				if(user.id != creadorEmber && !utils.validateMemberPermissionEdit(member)) {
					log.debug('Usuario sin permiso de edición.');
					reaction.message.reactions.resolve(emoji).users.remove(user.id);
					return;
				}

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
				const tituloEvento = embed.data.title;
				const image_url = embed.data.image?.url || '\u200B';

				embed.data.description = embed.data.description.replaceAll('\n', '\\n');

				embedInfo.description = 'Ejecuta el comando /edit con el campo messageId: **' + messageId +
					'** el número del campo que deseas editar y el texto que quieras que salga en el canal del evento creado. ' +
					'[' + tituloEvento + '](https://discord.com/channels/' + guildId + '/' + channelId + '/' + messageId + ')';

				embedEditable.fields[0] = { name: '1 - Título', value: '```' + embed.data.title + '```' }
				embedEditable.fields[1] = { name: '2 - Descripción', value: '```' + embed.data.description + '```' }
				embedEditable.fields[2] = { name: '3 - Horario', value: '```' + embed.data.fields[0].value + '```' }
				embedEditable.fields[3] = { name: '4 - Url imagen', value: '```' + image_url + '```' }

				user.send({ embeds: [embedEditable, embedInfo] });
				reaction.message.reactions.resolve(emoji).users.remove(user.id);
				break;
			case CONSTANTS.DELETE_REACT:
				if (user.id === creadorEmber || utils.validateMemberPermissionEdit(member)) {
					let embedInfo = {
						color: COLOR.GREY,
						description: 'description'
					}

					const channelId = reaction.message.channelId;
					const guildId = reaction.message.guildId;
					const messageId = reaction.message.id;
					const tituloEvento = embed.data.title;
					const image_url = embed.data.image?.url || '\u200B';

					embed.data.description = embed.data.description.replaceAll('\n', '\\n');

					embedInfo.description = 'Si quieres eliminar el evento ' + tituloEvento + ' usa **/remove evento** e informar en el campo event_id: **' + messageId +
						'** en el canal del siguiente enlace: [' + tituloEvento + '](https://discord.com/channels/' + guildId + '/' + channelId + '/' + messageId + ')';

					user.send({ embeds: [embedInfo] });
					reaction.message.reactions.resolve(emoji).users.remove(user.id);
				} else {
					reaction.message.reactions.resolve(emoji).users.remove(user.id);
				}
				break;
			default:
				log.warn('/evento Emoji incorrecto');
				return;
		}
	},
	async reactionRemove(reaction, user){
		var embed = EmbedBuilder.from(reaction.message.embeds[0]);
		var fields = embed.data.fields;

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
			default:
				return;
		}

		fields = calcularParticipantes(fields);
		await reaction.message.edit({ embeds: [embed] });
	},
	async edit(interaction, message, campoId, contenido){
		let embed = EmbedBuilder.from(message.embeds[0]);
		let creadorEmber = embed.data.footer.icon_url.split('?id=')[1];
		let user = interaction.user;
		let member = await message.guild.members.fetch(user.id);
		const embedInfo = {
			color: COLOR.GREEN,
			description: 'Mensaje modificado.'
		}

		if(user.id != creadorEmber && !utils.validateMemberPermissionEdit(member) ){
			embedInfo.color = COLOR.RED;
			embedInfo.description = 'No tienes permisos para editar.';
			log.debug('Usuario sin permiso de edición.');
			await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral });
		}else{
			switch (campoId) {
				case '1':
					embed.data.title = contenido;
					editNameThread(message, embed.data);
					break;
				case '2':
					contenido = contenido.replaceAll('\\n', '\n');
					embed.data.description = contenido;
					break;
				case '3':
					embed.data.fields[0].value = contenido;
					editNameThread(message, embed.data);
					break;
				case '4':
					if(utils.isImage(contenido)) embed.data.image = { url: contenido};
					break;
				default:
					log.error('/evento editar -> CAMPO_ID incorrecto.');
					
					embedInfo.color = COLOR.RED;
					embedInfo.description = 'CAMPO_ID incorrecto.';
	
					return await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral});
			}
	
			await message.edit({embeds: [embed]});
			await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral });
			log.info('Se ha modificado un bloque de texto bot.');
		}
	},
	async addUserCustom(message, interaction, nombreUsuario, rol){
		let embed = EmbedBuilder.from(message.embeds[0]);
		let fields = embed.data.fields;
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
			
			await message.edit({ embeds: [embed] });
			await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral});
		}else{
			embedInfo.color = COLOR.RED;
			embedInfo.description = 'Usuario ' + nombreUsuario + ' ya está apuntado!';
			await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral});
		}
	},
	async removeUserCustom(message, interaction, nombreUsuario){
		let embed = EmbedBuilder.from(message.embeds[0]);
		let fields = embed.data.fields;
		const embedInfo = {
            color: COLOR.GREEN,
			description: 'Usuario ' + nombreUsuario + ' retirado.'
        }

		fields = retirarUserField(fields, nombreUsuario, LITERAL.FIELD_NAME_DPS);
		fields = retirarUserField(fields, nombreUsuario, LITERAL.FIELD_NAME_HEAL);
		fields = retirarUserField(fields, nombreUsuario, LITERAL.FIELD_NAME_TANK);

		fields = calcularParticipantes(fields);

		await message.edit({ embeds: [embed] });
		await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral});
	},
	async remove(interaction, message) {
		let embed = EmbedBuilder.from(message.embeds[0]);
		let creadorEmber = embed.data.footer.icon_url.split('?id=')[1];
		let user = interaction.user;
		let member = await message.guild.members.fetch(user.id);

		if(user.id != creadorEmber && !utils.validateMemberPermissionEdit(member)) {
			embedInfo.color = COLOR.RED;
			embedInfo.description = 'No tienes permisos para eliminar.';
			log.debug('Usuario sin permiso de edición.');
			await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral });
			return;
		}

		deleteThreadChannel(message);
		message.delete();

		const embedInfo = {
			color: COLOR.GREEN,
			description: 'El evento ha sido eliminado correctamente.'
		}

		await interaction.reply({embeds: [embedInfo], flags: MessageFlags.Ephemeral });
	}
};

function initEmbed(){
	let embed = {
		color: COLOR.GREY,
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
			text: 'Creado por XXX',
			iconURL: ''
		}
	};

	return embed;
}

function guardarCache(message){
	serviceGuild.findById(message.guildId).then(guild => {
		if(guild){
			if(!guild.channelsId.includes(message.channelId)){
				guild.channelsId.push(message.channelId);
				
				serviceGuild.updateChannelsId(guild.id, guild.channelsId);
			}
		}else{
			guild = {
				id: message.guildId,
				channelsId: [message.channelId]
			};

			serviceGuild.create(guild);
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

async function deleteThreadChannel(message) {
	try {
    let threadsActives = await message.channel.threads.fetchActive();
    let thread = threadsActives.threads.get(message.id);

    if (!thread) {
      const threadsArchived = await message.channel.threads.fetchArchived();
      thread = threadsArchived.threads.get(message.id);
    }

    if (thread) {
      await thread.delete();
    }
  } catch (err) {
    log.error('Error al borrar hilo:', err);
  }
}

async function editNameThread(message, data) {
	if (message.thread) {
		try {
			let titulo = data.title;
			let horario = data.fields[0].value;

			await message.thread.setName(`${titulo} - ${horario}`);
		} catch (error) {
			log.error('No se ha podido renombrar el thread asociado al mensaje');
			console.error(error);
		}
	}
}

async function obtenerListaMenciones(client, mencionesList, guildId) {
	let mencionesValidas = "";

	for (let i = 0; i < mencionesList.length; i++) {
		if (mencionesList[i].includes('@')) {
			if (mencionesList[i] === '@everyone') {
				mencionesValidas = mencionesValidas === "" ? mencionesList[i] : mencionesValidas + " " + mencionesList[i];
			} else {
				let mencionId = mencionesList[i].replace(/[^0-9 ]/g, "").trim();

				if (mencionId === "") continue;

				let rol = await utils.findRol(client, guildId, mencionId);
				let member = await client.users.fetch(mencionId).catch(err => log.debug('No se encuentra el usuario ' + mencionId));

				if (rol) {
					mencionesValidas = mencionesValidas === "" ? mencionesList[i] : mencionesValidas + " " + mencionesList[i];
				}

				if (member) {
					mencionesValidas = mencionesValidas === "" ? mencionesList[i] : mencionesValidas + " " + mencionesList[i];
				}
			}
		}
	}

	return mencionesValidas;
}