const constant = require('../constants/constants.js');
const color = require('../constants/colors.js');
const emoji = require('../constants/emojis.js');
const embedHelp = {
	color: color.BLUE,
	title: 'HELP',
	description:
	'Lista de comandos disponibles del bot. Cualquier duda o sugerencia contactar con **Tebrase#5760**. ',
	thumbnail: {
		url: 'https://cdn2.iconfinder.com/data/icons/app-types-in-grey/512/info_512pxGREY.png',
	},
	fields: [
		{
			name: '**__Comandos principales:__**', 
			value: '**/help:** Información de los comandos. \n' +
			'**/report:** Para enviar un mensaje privado informando de tu duda o problema con el bot. Destinatario, **Tebrase#5760** \n' +
			'**/vote:** Genera un questionario mediante votos entre 2-5 respuestas. \n' +
			'**/evento:** Para crear el evento que distribuye en 3 roles (tank, dps y heal). \n' +
			'**/ping:** Realiza un test de velocidad.'
		},
		{
			name: '**__Ejemplos:__** ', 
			value: '**/evento titulo:** RAID TRAINING **description:** Vamos ha intentar montar la primera raid/trial/mazmorra/evento, indicar vuestros roles en las distintas reacciones. **horario:** Domingo 23 de Enero a las 17:00, horario España. \n' +
			'**/report description:** Tengo un error al reaccionar o al ejecutar un comando del bot. \n' +
			'**/vote pregunta:** ¿Comida favorita? **respuesta_1:** Pasta **respuesta_2:** Carne **respuesta_3:** Arroz **respuesta_4:** Pollo **respuesta_5:** Pescado'
		},
		{
			name: '**__Evento:__** ', 
			value: 'Dispondrá de 3 roles **TANK, DPS y HEAL**. Para apuntarse o desapuntarse hay que reaccionar a los distintos emojis con su respectivo rol. \n' +
			constant.TANK + ' **TANK** ' + '\n' +
			constant.DPS + ' **DPS** ' +  '\n' +
			constant.HEAL +' **HEAL** ' +  '\n' +
			constant.DELETE_REACT + ' Para eliminar el evento. Solo lo puede hacer el creador del evento o bien un admin/mod eliminando el mensaje entero.'
		}
	],
	timestamp: new Date()
};


module.exports = {
    slash : {
        name : 'help',
		description : 'Comando de ayuda.',
		type : constant.SLASH_TYPE_INPUT
    },
	reactions: true,
	async execute(interaction,  options, client) {
		embedHelp.timestamp = new Date();
		await interaction.reply({embeds: [embedHelp]});
	},
	async reactionAdd(reaction, user){
		embedHelp.timestamp = new Date();
		await reaction.message.reactions.resolve(emoji.RELOAD).users.remove(user.id);
		await reaction.message.edit({ embeds: [embedHelp] });
	},
	async reactionRemove(reaction, user){
		return;
	}
};