const { Command } = require('discord.js-commando');

const Kaasbeer = require('../../lib/Kaasbeer');

module.exports = class LeaveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'kaas',
            memberName: 'leave',
            description: 'leave a voice channel',
        });
    }

    async run(message, { voice }) {
        try {
            await Kaasbeer.leaveVoice();
        } catch (error) {
            console.log(error);
            return message.reply('Ik versta je niet kut Belg')
        }
    }
};
