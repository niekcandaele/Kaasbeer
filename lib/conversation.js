const waitSeconds = require('./waitSeconds');

module.exports = async function executeConvo(connection) {

    if (!connection) {
        throw new ReferenceError('connection must be defined and have an active connection.')
    }

    connection.play('./audio/hgh.aac')
    await waitSeconds(3);
    connection.play('./audio/iemandcs.aac')
    await waitSeconds(5);
    connection.play('./audio/bruh.aac');
    await waitSeconds(2);
    await connection.disconnect();
    return;
}