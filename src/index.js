const { Client, Intents, MessageEmbed, Message, Collection } = require('discord.js');
const { prefix } = require('../config.json');
const fs = require('fs');
require("dotenv").config();
const client = new Client({
	 intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	 partials: ['REACTION', 'MESSAGE'] 
	});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
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

client.once("ready", () => {
	console.log("INICIADO");
	client.user.setActivity('!help', { type: 'WATCHING' });
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
		await command.execute(message, content);
	} catch (e) {
		console.log(e);
		embedError.description= 'Error al crear un comando!';
		await message.channel.send({embeds: [embedError]});
	}
});

client.on('messageReactionAdd', async (reaction, user) => {
	try {
		if(user.bot) return;
		
		if(reaction.message.partial){
			reaction.message.fetch().then(async fullMessage => {
				if (fullMessage.author.bot && fullMessage.embeds !== undefined) {
					var embed = fullMessage.embeds[0];
					const command = client.commands.get(embed.title.toLowerCase());
					if(!command || !command.reactions) return;
					await command.reactionAdd(reaction, user);
				}
			}).catch(e => {
				console.log(e);
				//embedError.description = 'Algo ha ido mal! Error messageReactionAdd';
				//reaction.message.channel.send({embeds: [embedError]});
			});
		}else{
			if(!reaction.message.author.bot) return;
			var embed = reaction.message.embeds[0];
			const command = client.commands.get(embed.title.toLowerCase());
			if(!command || !command.reactions) return;
			await command.reactionAdd(reaction, user);
		}		
	} catch (e) {
		console.log(e);
		//embedError.description = 'Algo ha ido mal! Error messageReactionAdd';
		//await reaction.message.channel.send({embeds: [embedError]});
	}

});

client.on('messageReactionRemove', async (reaction, user) => {
	try {
		if(user.bot) return;

		if (reaction.message.partial) {
			reaction.message.fetch().then(async fullMessage => {
				if (fullMessage.author.bot && fullMessage.embeds !== undefined) {
					var embed = fullMessage.embeds[0];
					const command = client.commands.get(embed.title.toLowerCase());
					if(!command || !command.reactions) return;
					await command.reactionRemove(reaction, user);
				}
			}).catch(e => {
				console.log(e);
				//embedError.description = 'Algo ha ido mal! Error messageReactionRemove';
				//reaction.message.channel.send({ embeds: [embedError] });
			});
		}else{
			if(!reaction.message.author.bot) return;
			var embed = reaction.message.embeds[0];
			const command = client.commands.get(embed.title.toLowerCase());
			if(!command || !command.reactions) return;
			await command.reactionRemove(reaction, user);
		}
	} catch (e) {
		console.log(e);
		//embedError.description ='Algo ha ido mal! Error messageReactionRemove';
		//await reaction.message.channel.send({embeds: [embedError]});
	}
});

function getCommand(content) {
	return content.split(' ')[0];

}

client.login(process.env.TOKEN);