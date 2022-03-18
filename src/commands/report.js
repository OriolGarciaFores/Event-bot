const COLOR = require('../constants/colors.js');
const constants = require('../constants/constants.js');

const embedError = {
	color: COLOR.RED,
	title: 'La liaste!',
	description: 'El mensaje está vacio. El comando es !report <descripción>'
};

const embedInfo = {
	color: COLOR.BLUE,
	title: 'Exito!',
	description: 'Mensaje reportado.'
};

const embedReport = {
	color: COLOR.BLUE,
	title: 'Report - ',
	description: 'Error generic.'
};


module.exports = {
	name: 'report',
	reactions: false,
	async execute(message, content, client) {
        const user = await client.users.fetch(process.env.ID_OWNER);
        content = deleteComand(content);
        
        if(content === ''){ 
            await message.channel.send({embeds: [embedError]});
            return;
        }
        else {
            let remitente = message.author.username + '#' + message.author.discriminator;
            embedReport.title = 'Report - ' + remitente;
            embedReport.description = content;
            user.send({embeds: [embedReport]});
        }

        await message.channel.send({content: constants.TEXT_WARNING_DEPRECATE_COMMAND,embeds: [embedInfo]});;
	}
};


function deleteComand(content){
    return content.substring(getCommand(content).length);
}

function getCommand(content) {
	return content.split(' ')[0];

}