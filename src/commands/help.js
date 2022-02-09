const CONSTANTS = require('../constants/constants.js');
const embedHelp = {
	color: 0x0099ff,
	title: 'HELP',
	author: {
		name: 'Event-bot'
	},
	description:
	'Lista de comandos disponibles del bot. Cualquier duda o sugerencia contactar con **Tebrase#5760**. ',
	fields: [
		{
			name: '**__Comandos principales:__**', 
			value: '**!help:** Información de los comandos. \n' + '**!evento -d <Descripción> -t <horario>**'
		},
		{
			name: '**__Desglose:__** ', 
			value: '**!evento:** Para crear el evento que distribuye en 3 roles (tank, dps y heal). \n' +
			'**-d:** Añade la descripción del evento. \n' + 
			'**-t:** Horario descriptivo de cuando se establece el evento.'
		},
		{
			name: '**__Ejemplo:__** ', 
			value: '**!evento -d** Vamos ha intentar montar la primera raid/trial/mazmorra/evento, indicar vuestros roles en las distintas reacciones. **-t** Domingo 23 de Enero a las 17:00, horario España.'
		},
		{
			name: '**__Evento:__** ', 
			value: 'Dispondrá de 3 roles **TANK, DPS y HEAL**. Para apuntarse o desapuntarse hay que reaccionar a los distintos emojis con su respectivo rol. \n' +
			CONSTANTS.TANK + ' **TANK** ' + '\n' +
			CONSTANTS.DPS + ' **DPS** ' +  '\n' +
			CONSTANTS.HEAL +' **HEAL** ' +  '\n' +
			'Para eliminar el evento, solo lo puede hacer el creador del evento reaccionando a ' + CONSTANTS.DELETE_REACT + ' o bien un admin/mod eliminando el mensaje entero.'
		}
	],
	timestamp: new Date()
};


module.exports = {
	name: 'help',
	reactions: false,
	async execute(message) {
		return message.channel.send({embeds: [embedHelp]});;
	},
};