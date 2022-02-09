const { Client, Intents, MessageEmbed, Message, Collection } = require('discord.js');
const { prefix } = require('../config.json');
//const fs = require('fs');
const LITERAL = require('./constants/literals.js');
const CONSTANTS = require('./constants/constants.js');
require("dotenv").config();
const client = new Client({
	 intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	 partials: ['REACTION', 'MESSAGE'] 
	});

//client.commands = new Collection();

/*const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}*/

const embed = {
	color: 0x0099ff,
	title: 'EVENTO',
	author: {
		name: 'Event-bot'
	},
	description: 'Ej: El domingo 23 de enero volvemos a intentar hacer grupo para realizar las primeras TRIALS del mapa de Clagorn.',
	fields: [
		{
			name: 'HORARIO',
			value: 'Ej: Dom. 17:00 EU',
		},
		{
			name: LITERAL.FIELD_NAME_PARTICIPANTES,
			value: '0',
		},
		{ name: LITERAL.FIELD_NAME_TANK, value: '\u200B', inline: true },
		{ name: LITERAL.FIELD_NAME_DPS, value: '\u200B', inline: true },
		{ name: LITERAL.FIELD_NAME_HEAL, value: '\u200B', inline: true }
	],
	timestamp: new Date(),
	footer: {
		text: 'Creado por XXX'
	}
};

const embedHelp = {
	color: 0x0099ff,
	title: 'HELP',
	author: {
		name: 'Event-bot'
	},
	description:
	'Comandos principales: \n' +
	'!help: Información de los comandos. \n' +
	'!evento -d <Descripción> -t <horario> \n\n' +
	'Desglose: \n' +
	'!evento: Para crear el evento que distribuye en 3 roles (tank, dps y heal). \n' +
	'-d: Añade la descripción del evento. \n' + 
	'-t: Horario descriptivo de cuando se establece el evento. \n\n' +
	'Ej: !evento -d Vamos ha intentar montar la primera raid/trial/mazmorra/evento, indicar vuestros roles en las distintas reacciones. -t Domingo 23 de Enero a las 17:00, horario España.',
	timestamp: new Date()
};

const embedError = {
	color: 0xff0000,
	title: 'La liaste!',
	author: {
		name: 'Event-bot'
	},
	description: 'Error generic.',
	timestamp: new Date()
};


client.once("ready", () => {
	console.log("INICIADO");
	client.user.setActivity('!help', { type: 'WATCHING' });
});

client.on('messageCreate', async message => {

	if (!message.content.startsWith(prefix)) return;
	if (message.author.bot) return;

	let mensaje = message.content;
	let commandName = getCommand(mensaje);
	
	/*const command = client.commands.get(commandName);

	console.log(command);

	if(!command) return;
	console.log('HOLA');
	await command.execute(message);
*/


	try {
		
		let commandDesc = mensaje.includes(CONSTANTS.COMANDO_DESCRIPCION);
		let commandTime = mensaje.includes(CONSTANTS.COMANDO_TIEMPO);

		
		
		if(commandName === prefix + 'help') return enviarMensajeHelp(message);
		if(commandName !== prefix + 'evento' ) return;

		if (!commandDesc || !commandTime) {
			embedError.description = 'Comando incorrecto !evento -d descripcion -t horario';
			await message.channel.send({embeds: [embedError]});
		} else {
			if (commandName === prefix + 'evento') {
				//message.reply({ embeds: [embed] });
				//message.reply("REPLY");//RESPUESTA
				//message.channel.send("SEND CHANNEL");//MENSAJE AL CANAL
				let descripcion = getPartText(CONSTANTS.COMANDO_DESCRIPCION, mensaje);
				let horario = getPartText(CONSTANTS.COMANDO_TIEMPO, mensaje);

				
				embed.description = descripcion;
				embed.fields[0].value = horario;
				embed.footer.text = LITERAL.FOOTER_TEXT + message.author.username + '#' + message.author.discriminator;
				const msg = await message.channel.send({content: "@everyone", embeds: [embed], fetchReply: true });
				
				msg.react(CONSTANTS.TANK);
				msg.react(CONSTANTS.DPS);
				msg.react(CONSTANTS.HEAL);
				msg.react(CONSTANTS.DELETE_REACT);
			}
		}
	} catch (e) {
		console.log(e);
		embedError.description= 'Error al crear un comando!';
		await message.channel.send({embeds: [embedError]});
	}
});

client.on('messageReactionAdd', async (reaction, user) => {
	try {
		if(user.bot) return;
		if(reaction.message.partial){
			reaction.message.fetch().then(fullMessage => {
				if (fullMessage.author.bot && fullMessage.embeds !== undefined) {
					var embed = fullMessage.embeds[0];
					var userId = user.username + '#' + user.discriminator;
					var creadorEmber = embed.footer.text.split(LITERAL.FOOTER_TEXT)[1];
	
					if (reaction.emoji.name === CONSTANTS.DELETE_REACT && userId === creadorEmber) reaction.message.delete();
					if (reaction.emoji.name !== CONSTANTS.DELETE_REACT) {
						var fields = embed.fields;
						let position = 0;
	
						switch (reaction.emoji.name) {
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
						reaction.message.edit({ embeds: [embed] });
					}
				}else{
					return;
				}
			}).catch(e => {
				console.log(e);
				//embedError.description = 'Algo ha ido mal! Error messageReactionAdd';
				//reaction.message.channel.send({embeds: [embedError]});
			});
		}else{
			if(!reaction.message.author.bot) return;
			var embed = reaction.message.embeds[0];
			var userId = user.username + '#' + user.discriminator;
			var creadorEmber = embed.footer.text.split(LITERAL.FOOTER_TEXT)[1];

			if (reaction.emoji.name === CONSTANTS.DELETE_REACT && userId === creadorEmber) reaction.message.delete();
			if (reaction.emoji.name !== CONSTANTS.DELETE_REACT) {
				var fields = embed.fields;
				let position = 0;

				switch (reaction.emoji.name) {
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
		}
		
	} catch (e) {
		console.log(e);
		//embedError.description = 'Algo ha ido mal! Error messageReactionAdd';
		//await reaction.message.channel.send({embeds: [embedError]});
	}

});

client.on('messageReactionRemove', async (reaction, user) => {
	try {
		if (!user.bot) {
			if (reaction.message.partial) {
				reaction.message.fetch().then(fullMessage => {
					if (fullMessage.author.bot && fullMessage.embeds !== undefined) {
						var embed = fullMessage.embeds[0];
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
						reaction.message.edit({ embeds: [embed] });
					} else {
						return;
					}
				}).catch(e => {
					console.log(e);
					//embedError.description = 'Algo ha ido mal! Error messageReactionRemove';
					//reaction.message.channel.send({ embeds: [embedError] });
				});
			}else{
				if(!reaction.message.author.bot) return;
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
		}
	} catch (e) {
		console.log(e);
		//embedError.description ='Algo ha ido mal! Error messageReactionRemove';
		//await reaction.message.channel.send({embeds: [embedError]});
	}
});

function enviarMensajeHelp(message){
	return message.channel.send({embeds: [embedHelp]});;
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
	
	fields[posicionParticipantes].value = participantes.length + '';
	return fields;
}

function getCommand(content) {
	return content.split(' ')[0];

}

function listaToText(lista) {
	let text = '';

	for (let i = 0; i < lista.length; i++) {
		text = text + lista[i] + " ";

	}

	return text;
}

function getPartText(command, mensaje) {
	switch (command) {
		case '-d':
			if (mensaje.includes('-t')) {
				return mensaje.substring(mensaje.indexOf(command) + 2, mensaje.indexOf('-t'));
			} else {
				return mensaje = mensaje.substring(0, mensaje.indexOf(command) + 2);
			}
			break;

		case '-t':
			return mensaje = mensaje.substring(mensaje.indexOf(command) + 2);
			break;

	}

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

function getPositionField(fields, id) {
	for (let i = 0; i < fields.length; i++) {
		if (fields[i].name === id) return i;
	}

	return;
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

client.login(process.env.TOKEN);