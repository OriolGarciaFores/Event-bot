const CONSTANTS = require('../constants/constants.js');
const {MessageFlags } = require('discord.js');
const schedule = require('node-schedule');

module.exports = {
    slash : {
        name : 'remember',
        description : 'Te crea un recordatorio que te mandará por DM.',
        type : CONSTANTS.SLASH_TYPE_INPUT
    },
    reactions: false,
    async execute(interaction,  options, client) {
        //const date = new Date(2025, 7, 25, 23, 36, 0);
        const now = new Date();
        const testDate = new Date(now.getTime() + 2 * 60 * 1000);//+2 min
        console.log(testDate.toLocaleTimeString());
        addReminder(client, interaction.user.id, interaction.channelId, 'PRUEBA', testDate);
        await interaction.reply({content: 'Recordatorio programado', flags: MessageFlags.Ephemeral});
    }
};

function addReminder(client, userId, channelId, message, remindAt) {
  const date = new Date(remindAt);

  schedule.scheduleJob(date, async () => {
    try {
      const user = await client.users.fetch(userId);
      await user.send(`🔔 Recordatorio: ${message}`);
    } catch (err) {
      console.error(`No se pudo enviar DM a ${userId}`, err);
   
      if (channelId) {
        const channel = await client.channels.fetch(channelId);

        if (channel) {
          channel.send(`<@${userId}> 🔔 Recordatorio (no pude mandarte DM): ${message}`);
        }
      }
    }
  });
}