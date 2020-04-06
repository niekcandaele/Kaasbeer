const path = require('path');
const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const { getAudioDurationInSeconds } = require('get-audio-duration')
const fs = require('fs');

const Recorder = require('./recorder');
const readDir = require('./readDir');
const waitSeconds = require('./waitSeconds');
const { isAvatarTheSame } = require('./checkAvatar');
const TimedConvos = require('./TimedConvos');
const Queue = require('./Queue');
const conversation = require('./conversation');

const token = process.env.KAASBEER_TOKEN;
const kaasbeerUserId = "95592175332495360";
const roleId = "695735993751437342";
const channelId = "695736070586892359";
const guildId = "220555874568110080"

class Kaasbeer {

    _connection;
    _client = new Commando.Client({
        owner: '220554523561820160',
        commandPrefix: '!kaas'
    });

    _guild
    _role
    _voiceChannel
    _kaasbeerChannel
    _kaasbeerUser

    //_timedConvos = new TimedConvos();


    _playQueue = new Queue((_) => this._playSound(_));

    audioFiles = [];

    constructor() {
        this.client.login(token);
        this._recorder = new Recorder(this.client);

        this.client.on('ready', async () => {
            this.audioFiles = (await readDir('../audio')).map(_ => _.replace('.aac', ''));
            console.log(`Loaded audio files: ${this.audioFiles.join(', ')}`);


            this._guild = await this.client.guilds.resolve(guildId);
            this._role = await this._guild.roles.fetch(roleId);
            this._kaasbeerChannel = await this.guild.channels.resolve(channelId);
            this._kaasbeerUser = await this.client.users.fetch(kaasbeerUserId);

            if (this.guild.voice && this.guild.voice.connection) {
                this._connection = this.guild.voice.connection;
                console.log('Detected an existing voice connection');

            }

            this.client.registry
                // Registers your custom command groups
                .registerGroups([
                    ['kaas', 'Commands of cheese'],
                ])
                // Registers all built-in groups, commands, and argument types
                .registerDefaults()
                // Registers all of your commands in the ./commands/ directory
                .registerCommandsIn(path.join(__dirname, '../commands'));

            console.log(`Iemand cs?`);
        });

        this.client.on('message', async (msg) => {
            if (msg.content.toLowerCase().includes('kaasbeer') && msg.author !== this.client.user) {
                await msg.channel.send('EEN KILO KAAS');
            }

            if (msg.content.toLowerCase().includes('kaas') && !msg.content.toLowerCase().includes('kaasbeer') && !msg.content.startsWith(this.client.commandPrefix) && msg.author !== this.client.user) {
                await msg.react('🧀');
            }



        });

        this.client.on('voiceStateUpdate', async (oldVoice, newVoice) => {

            //._timedConvos.handleVoiceUpdate(oldVoice, newVoice);

            if (newVoice.connection) {
                this._connection = newVoice.connection;
                this._voiceChannel = newVoice.channel;
            }

            if (this._voiceChannel) {
                if (this._voiceChannel.members.size === 1 && this._voiceChannel.members.has(this.client.user.id)) {
                    await this.leaveVoice();
                }
            }
        });

        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
            this._handleUser(newMember);
        });
    }

    get connected() {
        return !!this._voiceChannel
    }

    get kaasbeerUser() {
        return this._kaasbeerUser
    }

    get kaasbeerChannel() {
        return this._kaasbeerChannel;
    }

    get guild() {
        return this._guild;
    }

    get role() {
        return this._role;
    }

    get client() {
        return this._client;
    }

    get connection() {
        return this._connection
    }

    set connection(conn) {
        // TODO: type check conn
        this._connection = conn;
    }

    async play(sound) {
        this._playQueue.add(sound)
    }

    async _playSound(sound) {

        if (sound === "convo") {
            return await conversation(this._connection)
        }

        const soundPath = `./audio/${sound}.aac`
        this._connection.play(soundPath);

        const duration = await getAudioDurationInSeconds(soundPath);

        await waitSeconds(duration);
        return;
    }

    async joinVoice(channel) {
        await channel.join();
        return;
    }

    async leaveVoice() {
        await this._voiceChannel.leave();
        return;
    }

    async _handleUser(member) {
        const user = member.user;


        let avatarSimilar = false;
        const avatarUrl = user.avatarURL()
        if (avatarUrl !== null) {
            avatarSimilar = await isAvatarTheSame(avatarUrl, this.kaasbeerUser)
        }

        // Gief role
        if ((member.nickname === "Kaasbeer" || member.user.username === "Kaasbeer") && !member.roles.cache.has(this.role.id) && avatarSimilar) {
            console.log(`Gave ${member.user.username}#${member.user.discriminator} the speshul role!`);
            member.roles.add(this.role);
            this.kaasbeerChannel.send(`<@${member.user.id}> (was ${member.user.username} before his rebirth) is now a Kaasbeer.`)
        }

        // taek role
        if ((!(member.nickname === "Kaasbeer" || member.user.username === "Kaasbeer") || !avatarSimilar) && member.roles.cache.has(this.role.id)) {
            console.log(`${member.user.username}#${member.user.discriminator} is no longer a Bear of Cheese`);
            this.kaasbeerChannel.send(`${member.user.username}#${member.user.discriminator} is a traitor.`)
            member.roles.remove(this.role);
        }
    }



}

module.exports = new Kaasbeer();