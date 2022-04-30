const EMOJIS = require('./emojis.js');

module.exports = {
    HEAL : EMOJIS.AMBULANCE,
    TANK : EMOJIS.SHIELD,
    DPS : EMOJIS.SWORDS_CROSS,
    DELETE_REACT : EMOJIS.CROSS,
    EDIT_REACT : EMOJIS.NOTEPAD,
    COMANDO_DESCRIPCION : '-d',
    COMANDO_TIEMPO : '-t',
    SLASH_TYPE_INPUT : 1,
    SLASH_TYPE_SUB_COMMAND_GROUP : 2,
    SLASH_TYPE_SUB_COMMAND : 1,
    SLASH_OPTION_TYPE_STRING : 3,
    SLASH_OPTION_TYPE_INTEGER : 4,
    SLASH_OPTION_TYPE_BOOLEAN : 5,
    SLASH_OPTION_TYPE_USER : 6,
    SLASH_OPTION_TYPE_CHANNEL : 7,
    TEXT_WARNING_DEPRECATE_COMMAND : '⚠️⚠️⚠️Comandos con `!` no están soportados por Discord y se han a eliminado. Intenta usar los nuevos `/`.\n Más información `/help`. \n ' +
                                    'Si no aparecen los nuevos comandos en la barra de texto de Discord, hace falta volver a invitar el bot.'
}