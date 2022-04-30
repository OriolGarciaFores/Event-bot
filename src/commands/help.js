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
			'**!vote <pregunta> -r <respuesta_1> -r <respuesta_2> :** Genera un questionario mediante votos entre 2-5 respuestas. \n' +
			'**!evento -d <Descripción> -t <horario>:** Para crear el evento que distribuye en 3 roles (tank, dps y heal).'
		},
		{
			name: '**__Desglose:__** ', 
			value: '**!evento:** Identificador del comando. \n' +
			'**-d:** Añade la descripción del evento. \n' + 
			'**-t:** Horario descriptivo de cuando se establece el evento.'
		},
		{
			name: '**__Ejemplos:__** ', 
			value: '**!evento -d** Vamos ha intentar montar la primera raid/trial/mazmorra/evento, indicar vuestros roles en las distintas reacciones. **-t** Domingo 23 de Enero a las 17:00, horario España. \n' +
			'**!report** Tengo un error al reaccionar o al ejecutar un comando del bot. \n' +
			'**!vote** ¿Comida favorita? **-r** Pasta **-r** Carne **-r** Arroz **-r** Pollo **-r** Pescado'
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
		await message.reply(CONSTANTS.TEXT_WARNING_DEPRECATE_COMMAND);
	},
	async reactionAdd(reaction, user){
		await reaction.message.reactions.resolve(EMOJIS.RELOAD).users.remove(user.id);
		await reaction.message.edit({content: CONSTANTS.TEXT_WARNING_DEPRECATE_COMMAND,embeds: [embedHelp] });
	},
	async reactionRemove(reaction, user){
		return;
	}
};