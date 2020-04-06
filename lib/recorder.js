const fs = require('fs')
const lame = require('lame');
const { getAudioDurationInSeconds } = require('get-audio-duration')

module.exports = class Recorder {

    client;

    constructor(client) {
        this.client = client;
        client.on('voiceStateUpdate', async (oldVoice, newVoice) => {
            console.log(`Voice state update`);

            if (newVoice.connection) {
                this._voiceChannel = newVoice.channel;
                this._connection = newVoice.connection;

                for (const member of this._voiceChannel.members.array()) {
                    if (member.user.id !== this.client.user.id) {
                        try {
                            await this._createRecording(member.user);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
        });

    }

    async _createRecording(user) {
        console.log(`Creating a new recording for user ${user.username}#${user.discriminator}`);

        await this._ensureDirectoryExists(user);
        const filePath = `${this._genFilePath(user)}/${Date.now()}`

        const audio = await this._connection.receiver.createStream(user, { mode: 'pcm' });
        const writeFile = fs.createWriteStream(filePath + '.pcm')
        audio.pipe(writeFile);

        writeFile.on('close', () => {
            this._convertRawDataToPlayable(filePath)

            if (this._connection) {
                console.log(`Finished recording ${user.username}`);
                this._createRecording(user);

            }
        })
    }

    _ensureDirectoryExists(user) {
        return new Promise((resolve, reject) => {
            fs.mkdir(this._genFilePath(user), (err) => {
                //if (err) reject(err)
                resolve();
            })
        })
    }

    _genFilePath(user) {
        return `./recordings/${user.username}-${user.discriminator}`;
    }

    _convertRawDataToPlayable(pathToData) {

        return new Promise((resolve, reject) => {
            const inputPath = `${pathToData}.pcm`;
            const outputPath = `${pathToData}.mp3`;
            var encoder = new lame.Encoder({
                // input
                channels: 2,        // 2 channels (left and right)
                bitDepth: 16,       // 16-bit samples
                sampleRate: 44100,  // 44,100 Hz sample rate

                // output
                bitRate: 256,
                outSampleRate: 44100,
                mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
            });

            const readFile = fs.createReadStream(inputPath);
            const writeStream = fs.createWriteStream(outputPath);

            readFile.pipe(encoder);
            encoder.pipe(writeStream);

            readFile.on('close', async () => {
                const duration = await getAudioDurationInSeconds(outputPath)
                console.log(`Final length: ${duration}`);
                fs.unlink(inputPath, () => {
                    resolve();
                })
            });
        })
    }
}