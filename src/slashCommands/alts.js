const path = require('node:path');
const constant = require('../constants/constants.js');

module.exports = {
    slash : {
        name : 'alts',
        description : 'Envia la imagen de alts.',
        type : constant.SLASH_TYPE_INPUT
    },
    reactions: false,
    async execute(interaction,  options, client) {
        const filePath = path.join(__dirname, '..', 'assets', 'alts.webp');
        
        await interaction.reply({files: [filePath]});
    }
};