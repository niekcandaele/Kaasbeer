/**
 * When user joins empty channel => start timer
 * When channel empties => Destroy timer
 * 
 * Array<{voiceChannelId, dateScheduled}> -> Check FIFO
 * 
 * Queue to prevent multiple channels firing at same time
 */


const conversation = require('./conversation');
const Queue = require('./Queue');

class TimedConvos {

    scheduledConvos = new Queue(this._executeConvo, {
        continueCheck: _ => {
            if (_) {
                return _.runAt < Date.now()
            } else {
                return false;
            }

        },
    });
    constructor() {
    }


    handleVoiceUpdate(oldVoiceState, voiceState) {

        if (voiceState.guild && voiceState.channelID) {
            const newVoiceChannel = voiceState.guild.channels.resolve(voiceState.channelID);
            this._checkIfChannelInit(newVoiceChannel)

            if (oldVoiceState.guild && oldVoiceState.channelID) {
                const oldVoiceChannel = oldVoiceState.guild.channels.resolve(oldVoiceState.channelID);
                this._checkIfChannelEmptied(newVoiceChannel, oldVoiceChannel);
            }
        }
    }

    async _checkIfChannelInit(newVoiceChannel) {
        if (newVoiceChannel.members.size === 1) {
            console.log(`Channel init: ${newVoiceChannel.name}`);
            // push to queue
            const runAt = Math.floor(Date.now() + (Math.random() * 1000 * 60 * 60));
            console.log(new Date(runAt));

            this.scheduledConvos.add({ voiceChannel: newVoiceChannel, runAt }, { dontExecute: true })
        }
    }


    async _checkIfChannelEmptied(oldVoiceChannel) {

        if (oldVoiceChannel.members.size === 0) {
            console.log(`Channel empty: ${oldVoiceChannel.name}`);
            // delete from queue
        }
    }

    async _executeConvo(data) {
        const conn = await data.voiceChannel.join();
        await conversation(conn);
    }
}

module.exports = TimedConvos