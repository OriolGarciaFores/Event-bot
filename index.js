const { Client, Intents, MessageEmbed, Message } = require('discord.js');
const { prefix } = require('./config.json');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
const HEAL = '🚑';
const TANK = '🛡️';
const DPS = '⚔️';
const COMANDO_DESCRIPCION = '-d';
const COMANDO_TIEMPO = '-t';
const FIELD_NAME_TANK = 'TANK';
const FIELD_NAME_DPS = 'DPS';
const FIELD_NAME_HEAL = 'HEAL';
const FIELD_NAME_PARTICIPANTES = 'PARTICIPANTES';

const embed = {
	color: 0x0099ff,
	title: 'RAID',
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
			name: FIELD_NAME_PARTICIPANTES,
			value: '0',
		},
		{ name: FIELD_NAME_TANK, value: '\u200b', inline: true },
		{ name: FIELD_NAME_DPS, value: '\u200b', inline: true },
		{ name: FIELD_NAME_HEAL, value: '\u200b', inline: true }
	],
	timestamp: new Date()
};

const embedError = {
	color: 0x0099ff,
	title: 'La liaste!',
	author: {
		name: 'Event-bot'
	},
	description: 'Error generic.',
	timestamp: new Date()
};


client.once("ready", () => {
	console.log("INICIADO");
});

client.on('messageCreate', async message => {
	try {
		let mensaje = message.content;
		let commandName = getCommand(mensaje);
		let commandDesc = mensaje.includes(COMANDO_DESCRIPCION);
		let commandTime = mensaje.includes(COMANDO_TIEMPO);
		

		if (message.author.bot) return;
		if(commandName !== prefix + 'raid' ) return;

		if (!commandDesc || !commandTime) {
			embedError.description = 'Comando incorrecto !raid -d descripcion -t horario';
			message.channel.send({embeds: [embedError]});
		} else {
			if (commandName === prefix + 'raid') {
				//message.reply({ embeds: [embed] });
				//message.reply("REPLY");//RESPUESTA
				//message.channel.send("SEND CHANNEL");//MENSAJE AL CANAL
				let descripcion = getPartText(COMANDO_DESCRIPCION, mensaje);
				let horario = getPartText(COMANDO_TIEMPO, mensaje);

				embed.description = descripcion;
				embed.fields[0].value = horario;
				const msg = await message.channel.send({ embeds: [embed], fetchReply: true });

				msg.react(HEAL);
				msg.react(TANK);
				msg.react(DPS);

			}
		}
	} catch (e) {
		embedError.description= 'Error al crear un comando!';
		message.channel.send({embeds: [embedError]});
	}
});

client.on('messageReactionAdd', async (reaction, user) => {
	try {
		if (!user.bot) {
			var embed = reaction.message.embeds[0];
			var fields = embed.fields;
			let position = 0;

			switch (reaction.emoji.name) {
				case DPS:
					position = getPositionField(fields, FIELD_NAME_DPS);
					fields[position] = editarField(fields[position], user);
					break;
				case HEAL:
					position = getPositionField(fields, FIELD_NAME_HEAL);
					fields[position] = editarField(fields[position], user);
					break;
				case TANK:
					position = getPositionField(fields, FIELD_NAME_TANK);
					fields[position] = editarField(fields[position], user);
					break;
			}

			fields = calcularParticipantes(fields);

			embed.setFields(fields);

			reaction.message.edit({ embeds: [embed] });
		}

	} catch (e) {
		embedError.description = 'Algo ha ido mal! Error messageReactionAdd';
		reaction.message.channel.send({embeds: [embedError]});
	}

});

client.on('messageReactionRemove', (reaction, user) => {
	try {
		if (!user.bot) {
			var embed = reaction.message.embeds[0];
			var fields = embed.fields;

			switch (reaction.emoji.name) {
				case DPS:
					fields = retirarUserField(fields, user, FIELD_NAME_DPS);
					break;
				case HEAL:
					fields = retirarUserField(fields, user, FIELD_NAME_HEAL);
					break;
				case TANK:
					fields = retirarUserField(fields, user, FIELD_NAME_TANK);
					break;
			}

			fields = calcularParticipantes(fields);
			embed.setFields(fields);
			reaction.message.edit({ embeds: [embed] });
		}
	} catch (e) {
		embedError.description ='Algo ha ido mal! Error messageReactionRemove';
		reaction.message.channel.send({embeds: [embedError]});
	}
});


function calcularParticipantes(fields) {
	let posicionDps = getPositionField(fields, FIELD_NAME_DPS);
	let posicionHeal = getPositionField(fields, FIELD_NAME_HEAL);
	let posicionTank = getPositionField(fields, FIELD_NAME_TANK);
	let posicionParticipantes = getPositionField(fields, FIELD_NAME_PARTICIPANTES);
	
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

	myArray = myArray.filter(e => e !== user.username);

	if (myArray.length == 0) {
		fields[position].value = '\u200b';
	} else {
		for (let value in myArray) {
			fields[position].value = fields[position].value + '\n' + value;
		}
	}

	return fields;
}

//client.login(process.env.TOKEN);  
client.login("OTMzNzMwMjM2NDgxMjkwMjcw.YelyDA.kPSsgZOiPdq56cSUCD1LcUkhR4w");