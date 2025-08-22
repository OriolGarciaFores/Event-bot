const { Client, Collection, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
const fs = require('fs');
const config = require('../config');
const log = require('./modules/logger');

const {slashDisabled} = require("./deploySlashCommands.js");
require("dotenv").config();

const client = new Client({
	 intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers
		],
	 partials: [
		Partials.Reaction, 
		Partials.Message,
		Partials.Reaction
	] 
});

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

client.slashCommands = new Collection();

const init = async () => {
    const slashCommandFiles = fs.readdirSync('./src/slashCommands').filter(file => file.endsWith('.js'));
	
	for (const file of slashCommandFiles) {
		const moduleSlash = require(`./slashCommands/${file}`);
		const slash = moduleSlash.slash;

		if (slashDisabled.indexOf(slash.name) > -1) {
			log.warn(`Disabled SlashCommand: ${file}`);
		} else {
			log.info(`Loading... SlashCommand: ${file}`);
			client.slashCommands.set(slash.name, moduleSlash);
			log.correct(`Loaded /${slash.name} OK`);
		}
	}

	client.login(config.token);
}

init();

client.once("clientReady", () => {
	log.info("INICIADO");
	client.user.setActivity(config.status.description + config.status.version, { type: ActivityType.Playing });
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

async function loadCache(){
	let guilds = await serviceGuild.findAll();

	if(guilds.length != 0){
		for (let i = 0; i < guilds.length; i++){
			const guild = await client.guilds.fetch(guilds[i].id);

			if(guild == undefined){
				log.warn("No se ha encontrado la guild en cache.");
			}else{
				let channels = guilds[i].channelsId;

				for(let id = 0; id < channels.length; id++){
					const channel = guild.channels.cache.get(channels[id]);

					if(channel == undefined){
						log.warn("No se ha encontrado el channel en cache.");
					}else{
						await channel.messages.fetch();
					}
				}
			}
		}

		log.info("Carga cache de las Guilds.");	
	}else{
		log.info("No hay guilds para cargar en cache.");
	}
}

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
		if(user.bot) return;

		let command = client.slashCommands.get(message.interaction.commandName);

		if (!command || !command.reactions) return;

		if (type === TYPE_REACTION_ADD) await command.reactionAdd(reaction, user);
		if (type === TYPE_REACTION_REMOVE) await command.reactionRemove(reaction, user);
	} catch (e) {
		log.error(e);
	}

}