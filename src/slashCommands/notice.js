const color = require('../constants/colors.js');
const constant = require('../constants/constants.js');
const utils = require('../modules/Utils.js');
const log = require('../modules/logger');

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
                name : "menciones",
                description : "Para añadir lista de menciones que notificar (@everyone, @rol, @usuario, etc...).",
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
        let menciones = options.getString('menciones');
        const mencionesList = menciones.split(/ +/);

        if(titulo == undefined && descripcion == undefined){
            await interaction.reply({content : 'Requiere informar minimo un título o descripción.', ephemeral: true});
        }else{
            if(descripcion != undefined) 
                descripcion = descripcion.replaceAll('\\n', '\n');
                
            embed.title = titulo;
            embed.description = descripcion;
            embed.author.name = interaction.user.username;
            embed.author.icon_url = interaction.user.displayAvatarURL();

            let mencionesValidas = await obtenerListaMenciones(client, mencionesList, interaction.guildId);

            if(utils.isImage(urlImage)) embed.image = { url: urlImage};
            if(utils.isUrl(urlTitle)) embed.url = urlTitle;

            await interaction.reply({embeds: [embed], content: mencionesValidas});
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

async function obtenerListaMenciones(client, mencionesList, guildId){
    let mencionesValidas = "";

    for(let i = 0; i < mencionesList.length; i++){
        if(mencionesList[i].includes('@')){
            if(mencionesList[i] === '@everyone'){
                mencionesValidas = mencionesValidas === "" ?  mencionesList[i] : mencionesValidas + " " + mencionesList[i];
            }else{
                let mencionId = mencionesList[i].replace(/[^0-9 ]/g, "").trim();

                if(mencionId === "") continue;

                let rol = await utils.findRol(client, guildId, mencionId);
                let member = await client.users.fetch(mencionId).catch(err => log.debug('No se encuentra el usuario ' + mencionId));

                if(rol){
                    mencionesValidas = mencionesValidas === "" ?  mencionesList[i] : mencionesValidas + " " + mencionesList[i];
                }
                
                if(member){
                    mencionesValidas = mencionesValidas === "" ?  mencionesList[i] : mencionesValidas + " " + mencionesList[i];
                }
            }
        }
    }

    return mencionesValidas;
}