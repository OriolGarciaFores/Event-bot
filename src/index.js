const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const { prefix } = require('../config.json');
const log = require('./modules/logger');

require("./deploySlashCommands.js");
require("dotenv").config();

const client = new Client({
	 intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
	 partials: ['REACTION', 'MESSAGE'] 
	});

client.commands = new Collection();
client.slashCommands = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const slashCommandFiles = fs.readdirSync('./src/slashCommands').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
	const moduleSlash = require(`./slashCommands/${file}`);
	const slash = moduleSlash.slash;

	client.slashCommands.set(slash.name, moduleSlash);
}

const embedError = {
	color: 0xff0000,
	title: 'La liaste!',
	author: {
		name: 'Event-bot'
	},
	description: 'Error generic.',
	timestamp: new Date()
};

const embedWelcome = {
	color: 0xfbfaff,
	title: '¿¿QUIEN OSA ENTRAR EN NUESTROS DOMINIOS??'
};

const TYPE_REACTION_ADD = 'messageReactionAdd';
const TYPE_REACTION_REMOVE = 'messageReactionRemove';

client.once("ready", () => {
	log.info("INICIADO");
	client.user.setActivity('!help - V.1.2.0', { type: 'WATCHING' });
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName, options } = interaction;
	const command = client.slashCommands.get(commandName);

	if(!command) return;

	try {
		await command.execute(interaction, options, client);
	} catch (e) {
		log.error(e);
	}
});

client.on('messageCreate', async message => {
	if (!message.content.startsWith(prefix)) return;
	if (message.author.bot) return;

	try {
		let content = message.content;
		content = content.substring(1);
		let commandName = getCommand(content);
		const command = client.commands.get(commandName);
		if(!command) return;
		await command.execute(message, content, client);
	} catch (e) {
		console.log(e);
		embedError.description= 'Error al crear un comando!';
		await message.channel.send({embeds: [embedError]});
	}
});

client.on('messageReactionAdd', async (reaction, user) => {
	try {
		messageReaction(TYPE_REACTION_ADD, reaction, user);
	} catch (e) {
		log.error(e);
	}

});

client.on('messageReactionRemove', async (reaction, user) => {
	try {
		messageReaction(TYPE_REACTION_REMOVE, reaction, user);
	} catch (e) {
		log.error(e);
	}
});

client.on('guildMemberAdd', async member => {
	try {
		member.guild.channels.cache.get(member.guild.systemChannelId).send({embeds: [embedWelcome]});
	} catch (e) {
		log.error("Error guildMemberAdd: " + e);
	}
});

function getCommand(content) {
	return content.split(' ')[0];

}

async function messageReaction(type, reaction, user){
	if (user.bot) return;

	if (reaction.message.partial) {
		reaction.message.fetch().then(async fullMessage => {
			reactions(type, fullMessage, reaction, user);
		}).catch(e => {
			log.error(e);
		});
	} else {
		reactions(type, reaction.message, reaction, user);
	}
}

async function reactions(type, message, reaction, user) {
	try {
		if(!message.author.bot || message.author.id !== client.user.id) return;

		let embed = message.embeds[0];
		let command;

		if (message.interaction !== null && message.interaction.type === 'APPLICATION_COMMAND')
			command = client.slashCommands.get(embed.title.toLowerCase().split(' ')[0]);
		else command = client.commands.get(embed.title.toLowerCase());

		if (!command || !command.reactions) return;

		if (type === TYPE_REACTION_ADD) await command.reactionAdd(reaction, user);
		if (type === TYPE_REACTION_REMOVE) await command.reactionRemove(reaction, user);
	} catch (e) {
		log.error(e);
	}

}

client.login(process.env.TOKEN);