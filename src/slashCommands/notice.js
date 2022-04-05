const color = require('../constants/colors.js');
const constant = require('../constants/constants.js');
const utils = require('../modules/Utils.js');

module.exports = {
	slash : {
        name : 'notice',
		description : 'Para anunciar un mensaje importante.',
		type : constant.SLASH_TYPE_INPUT,
        options : [
            {
                name : "title",
                description : "Título del mensaje.",
                type : constant.SLASH_OPTION_TYPE_STRING,
                required : false
            },
            {
                name : "description",
                description : "Descripción del mensaje a enviar.",
                type : constant.SLASH_OPTION_TYPE_STRING,
                required : false
            },
            {
				name : "url_title",
				description : "URL para añadir un enlace al titulo.",
				type : constant.SLASH_OPTION_TYPE_STRING,
				required : false
			},
			{
				name : "url_img",
				description : "URL para añadir una imagen al evento.",
				type : constant.SLASH_OPTION_TYPE_STRING,
				required : false
			}
        ],
    },
	reactions: true,
	async execute(interaction, options, client) {
        let embed = initEmbed();
        let titulo = options.getString('title');
        let descripcion = options.getString('description');
        let urlTitle = options.getString('url_title');
        let urlImage = options.getString('url_img');

        if(titulo == undefined && descripcion == undefined){
            await interaction.reply({content : 'Requiere informar minimo un titulo o descripción.', ephemeral: true});
        }else{
            if(descripcion != undefined) 
                descripcion = descripcion.replaceAll('\\n', '\n');
                
            if(titulo != undefined) embed.title = 'NOTICE - ' + titulo;
            else embed.title = 'NOTICE';

            embed.description = descripcion;
            embed.author.name = interaction.user.username;
            embed.author.icon_url = interaction.user.displayAvatarURL();

            if(utils.isImage(urlImage)) embed.image = { url: urlImage};
            if(utils.isUrl(urlTitle)) embed.url = urlTitle;
    
            await interaction.reply({embeds: [embed]});
        }
	},
	async reactionAdd(reaction, user){
        let embed = reaction.message.embeds[0];
		let userId = user.username;
		let creadorEmber = embed.author.name;
        let emoji = reaction.emoji.name;

        if (emoji === constant.DELETE_REACT){
			if(userId === creadorEmber) reaction.message.delete();
			else reaction.message.reactions.resolve(emoji).users.remove(user.id);
		}
	},
	async reactionRemove(reaction, user){
		return;
	} 
};

function initEmbed(){
    let embed = {
        color: color.GREY,
        author : {
            name : 'name',
            icon_url: 'https://i.imgur.com/AfFp7pu.png'
        }
    }
    return embed;
}