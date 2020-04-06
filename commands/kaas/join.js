const { Command } = require('discord.js-commando');

const Kaasbeer = require('../../lib/Kaasbeer');

module.exports = class JoinComand extends Command {
    constructor(client) {
        super(client, {
            name: 'join',
            aliases: ['voice'],
            group: 'kaas',
            memberName: 'join',
            description: 'Join a voice channel',
            args: [
                {
                    default: 'default-channel',
                    key: 'voice',
                    prompt: 'What voice channel should I join',
                    type: 'string',
                },
            ],
        });
    }

    async run(message, { voice }) {

        if (voice === 'default-channel') {
            const member = message.member;
            await Kaasbeer.joinVoice(member.voice.channel);
            return;
        }

        try {
            const channel = await this.client.channels.fetch(voice);

            if (channel) {
                const connection = await Kaasbeer.joinVoice(channel)
                return;
            }
        } catch (error) {
            return message.reply('Ik versta je niet kut Belg')
        }

        return message.reply('Ik versta je niet kut Belg')

    }
};
