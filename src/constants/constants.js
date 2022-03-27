const EMOJIS = require('./emojis.js');

module.exports = {
    HEAL : EMOJIS.AMBULANCE,
    TANK : EMOJIS.SHIELD,
    DPS : EMOJIS.SWORDS_CROSS,
    DELETE_REACT : EMOJIS.CROSS,
    COMANDO_DESCRIPCION : '-d',
    COMANDO_TIEMPO : '-t',
    SLASH_TYPE_INPUT : 1,
    SLASH_OPTION_TYPE_STRING : 3,
    SLASH_OPTION_TYPE_INTEGER : 4,
    SLASH_OPTION_TYPE_BOOLEAN : 5,
    SLASH_OPTION_TYPE_USER : 6,
    SLASH_OPTION_TYPE_CHANNEL : 7,
    TEXT_WARNING_DEPRECATE_COMMAND : 'Comandos con `!` están en desuso y se van a eliminar. Intenta usar los nuevos `/`.\n Más información `/help`. \n ' +
                                    'Si no aparecen los nuevos comandos, hace falta volver a invitar el bot.'
}