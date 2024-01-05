const constant = require('../constants/constants.js');
const COLOR = require('../constants/colors.js');
const fs = require('fs');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const { Collection } = require('discord.js');

//const player = createAudioPlayer();
//player.colaSongs = new Collection();
const queue = new Map();

const SUB_COMMAND_PLAY_SONG = 'play-song';
const SUB_COMMAND_PLAY_LIST = 'playlist';

const embedUserNotChannel = {
	color: COLOR.RED,
	title: 'ATENCIÓN!',
	description: 'No estas conectado a un canal de voz.'
};

const embedFinishPlayList = {
	color: COLOR.GREEN,
	title: 'Se ha terminado la playlist!'
};

module.exports = {
	slash: {
		name: 'music',
		description: 'Comando de música.',
		options: [
			{
				name: SUB_COMMAND_PLAY_SONG,
				description: 'Añade una canción para sonar.',
				type: constant.SLASH_TYPE_SUB_COMMAND,
				options: [
					{
						name: "song_id",
						description: "Identificador de la música disponible que se desea escuchar.",
						type: constant.SLASH_OPTION_TYPE_INTEGER,
						required: true
					}
				]
			},
			{
				name: SUB_COMMAND_PLAY_LIST,
				description: 'Lista de canciones.',
				type: constant.SLASH_TYPE_SUB_COMMAND,
				options: [
					{
						name: "option",
						description: "Elige una opción.",
						type: constant.SLASH_OPTION_TYPE_INTEGER,
						required: true,
						choices: [
							{
								name: 'play',
								value: 1
							},
							{
								name: 'show',
								value: 2
							}
						]
					}
				]


			}
		]
	},
	reactions: false,
	async execute(interaction, options, client) {
		if (!interaction.member.voice.channelId) return await interaction.reply({ embeds: [embedUserNotChannel], ephemeral: true });

		const serverQueue = queue.get(interaction.guildId);
		const songs = [];
		let embed = initEmbed();

		if (options.getSubcommand() === SUB_COMMAND_PLAY_LIST) {
			let opcion = options.getInteger('option');

			if (opcion == 1) {
				fs.readdirSync('./src/music').forEach(file => {
					let song = {
						title: file,
						url: `./src/music/${file}`
					};
	
					songs.push(song);
				});
	
				embed.title = 'Se ha añadido la playlist a la cola';
			} else {
				embed.title = 'Playlist';
				embed.fields = [];
				let i = 0;
				let playlist = '';

				fs.readdirSync('./src/music').forEach(file => {
					let song = i + ' - ' + file + ' \n';
					playlist = playlist + song;
					i++;
				});

				console.log(playlist);

				let field = {
					name : playlist,
					value: '\u200b'
				}

				embed.fields.push(field);

				return await interaction.reply({ embeds: [embed] });
			}
		} else {
			let songId = options.getInteger('song_id');
			let listaSongs = new Map();
			let i = 0;

			fs.readdirSync('./src/music').forEach(file => {
				let song = {
					title: file,
					url: `./src/music/${file}`
				};
				listaSongs.set(i, song);
				i++;
			});

			let song = {
				title: listaSongs.get(songId).title,
				url: listaSongs.get(songId).url
			};

			embed.description = song.title;
			songs.push(song);
		}

		if (!serverQueue) {
			const queueContruct = {
				voiceChannel: interaction.member.voice.channelId,
				connection: null,
				songs: [],
				playing: true
			};

			queue.set(interaction.guildId, queueContruct);

			songs.forEach(song => {
				queueContruct.songs.push(song);
			});
			
			try {
				var connection = joinVoiceChannel({
					channelId: interaction.member.voice.channelId,
					guildId: interaction.guildId,
					adapterCreator: interaction.guild.voiceAdapterCreator,
				});

				queueContruct.connection = connection;

				play(interaction.guildId, queueContruct.songs[0], interaction.channel);

				return await interaction.reply({ embeds: [embed], ephemeral: true });
			} catch (err) {
				console.log(err);
				queue.delete(interaction.guildId);
				return;
			}
		} else {
			songs.forEach(song => {
				serverQueue.songs.push(song);
			});

			return await interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
};

function initEmbed(){
	let embed = {
		color: COLOR.GREEN,
		title: 'Canción añadida a la cola!'
	};

	return embed;
}



function play(guildId, song, channel) {
	const serverQueue = queue.get(guildId);

	if (!song) {
		serverQueue.connection.destroy();
		queue.delete(guildId);
		return channel.send({ embeds : [embedFinishPlayList] });
	}

	const player = createAudioPlayer();
	const resource = createAudioResource(song.url);

	serverQueue.connection.subscribe(player);
	player.play(resource);

	player.on(AudioPlayerStatus.Idle, () => {
		serverQueue.songs.shift();
		play(guildId, serverQueue.songs[0], channel);
	});
}