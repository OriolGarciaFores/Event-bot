const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const log = require('./modules/logger');
const slashDisabled = [];

module.exports = {
	slashDisabled
}

require("dotenv").config();

const commands = []
const commandFiles = fs.readdirSync('./src/slashCommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./slashCommands/${file}`);

	if (slashDisabled.indexOf(command.slash.name) != 0) { 
		commands.push(command.slash);
		log.info(`Slash deployed: ${command.slash.name}`);
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);


//applicationGuildCommands -> Solo para un server especifico, se añade inmediato
/*
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID_DEV), { body: commands })
	.then(() => log.correct('Successfully registered application commands.'))
	.catch(console.error);
*/

//applicationCommands -> GLOBAL Tarda 1 hora al añadirse a los servers.
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then(() => log.correct('Successfully registered application commands.'))
	.catch(console.error);