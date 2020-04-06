const { Command } = require('discord.js-commando');

const Kaasbeer = require('../../lib/Kaasbeer');

module.exports = class JoinComand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'kaas',
            memberName: 'play',
            description: 'Play a sound',
            args: [
                {
                    key: 'sound',
                    prompt: 'What sound should I play?',
                    type: 'string',
                    oneOf: Kaasbeer.audioFiles.concat(['convo'])
                },
            ],
        });
    }

    async run(message, { sound }) {

        if (!Kaasbeer.connected) {
            if (message.member.voice && message.member.voice.channel) {
                await Kaasbeer.joinVoice(message.member.voice.channel)
            } else {
                return message.reply('WELK CHANNEL DAN?')
            }
        }

        await Kaasbeer.play(sound);
        return;
    }
};
