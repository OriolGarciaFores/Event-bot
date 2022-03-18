const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const log = require('./modules/logger');

require("dotenv").config();


/*

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
*/

const commands = []

const commandFiles = fs.readdirSync('./src/slashCommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./slashCommands/${file}`);
	commands.push(command.slash);
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

//applicationCommands -> GLOBAL Tarda 1 hora al añadirse a los servers.
//applicationGuildCommands -> Solo para un server especifico, se añade inmediato
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID), { body: commands })
	.then(() => log.correct('Successfully registered application commands.'))
	.catch(console.error);