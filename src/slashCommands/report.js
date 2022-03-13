const COLOR = require('../constants/colors.js');
const constant = require('../constants/constants.js');

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
	slash : {
        name : 'report',
		description : 'Votación de 2-5 respuestas posibles.',
		type : constant.SLASH_TYPE_INPUT,
        options : [
            {
                name : "description",
                description : "Descripción del mensaje a enviar.",
                type : constant.SLASH_OPTION_TYPE_STRING,
                required : true
            },
        ],
    },
	reactions: false,
	async execute(interaction, options, client) {
        const user = await client.users.fetch(process.env.ID_OWNER);
        let remitente = interaction.user.username + '#' + interaction.user.discriminator;

        embedReport.title = 'Report - ' + remitente;
        embedReport.description = options.getString("description");

        user.send({ embeds: [embedReport] });

        await interaction.reply({embeds: [embedInfo]});;
	}
};