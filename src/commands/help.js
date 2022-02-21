const CONSTANTS = require('../constants/constants.js');
const COLOR = require('../constants/colors.js');
const EMOJIS = require('../constants/emojis.js');
const embedHelp = {
	color: COLOR.BLUE,
	title: 'HELP',
	description:
	'Lista de comandos disponibles del bot. Cualquier duda o sugerencia contactar con **Tebrase#5760**. ',
	thumbnail: {
		url: 'https://cdn2.iconfinder.com/data/icons/app-types-in-grey/512/info_512pxGREY.png',
	},
	fields: [
		{
			name: '**__Comandos principales:__**', 
			value: '**!help:** Información de los comandos. \n' +
			'**!report <descripción>:** Para enviar un mensaje privado informando de tu duda o problema con el bot. Destinatario, **Tebrase#5760** \n' +
			'**!evento -d <Descripción> -t <horario>**'
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
			CONSTANTS.DELETE_REACT + ' Para eliminar el evento. Solo lo puede hacer el creador del evento o bien un admin/mod eliminando el mensaje entero.'
		}
	],
	timestamp: new Date()
};


module.exports = {
	name: 'help',
	reactions: true,
	async execute(message,  content, client) {
		return message.channel.send({embeds: [embedHelp]});;
	},
	async reactionAdd(reaction, user){
		await reaction.message.reactions.resolve(EMOJIS.RELOAD).users.remove(user.id);
		await reaction.message.edit({ embeds: [embedHelp] });
	},
	async reactionRemove(reaction, user){
		return;
	}
};