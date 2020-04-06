module.exports = async function waitSeconds(seconds) {
    return new Promise(resolve => {
        setInterval(() => { resolve() }, seconds * 1000)
    })
}