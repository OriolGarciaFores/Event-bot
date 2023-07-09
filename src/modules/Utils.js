const CONSTANTS = require('../constants/constants.js');
const COLOR = require('../constants/colors.js');
const { Permissions } = require('discord.js');

function progressBar (value, maxValue, size) {
    if(maxValue <= 0) maxValue = 1;

    const percentage = value / maxValue;
    const progress = Math.round((size * percentage));
    const emptyProgress = size - progress;
  
    const progressText = '█'.repeat(progress);
    const emptyProgressText = ' '.repeat(emptyProgress);
    const percentageText = Math.round(percentage * 100) + '%';

    const bar = '|`' + progressText + emptyProgressText + '`| ' + percentageText + '';
    return bar;
  };

  function textNegrita(text){
    return '**' + text + '**'
  }

  async function getOldReactionByUser(reaction, user) {
    let maps = reaction.message.reactions.cache;
    let emoji = reaction.emoji.name;
    let oldReaction;
  
    for (let [key, value] of maps) {
      if (key !== CONSTANTS.DELETE_REACT && key !== emoji && emoji !== CONSTANTS.DELETE_REACT) {
        let users = await value.users.fetch();
        let us = users.get(user.id);
  
        if (us !== undefined) oldReaction = key
      }
    }
  
    return oldReaction;
  }

  function generarMensajeError(mensaje){
    const embedError = {
      color: COLOR.RED,
      title: 'La liaste!',
      description: mensaje,
      timestamp: new Date()
    };

    return embedError;
  }

  function isImage(url){
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  function isUrl(url){
    return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi.test(url);
  }

  function validateMemberPermissionEdit(member){
    return member.permissions.has(['MANAGE_MESSAGES']);
  }

  async function findRol(client, guildId, rolId){
    const guild = await client.guilds.fetch(guildId);
    let role = await guild.roles.cache.find(r => r.id === rolId);

    return role;
  }


module.exports = {progressBar, textNegrita, getOldReactionByUser, generarMensajeError, isImage, isUrl, validateMemberPermissionEdit, findRol}