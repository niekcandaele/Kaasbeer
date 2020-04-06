const Blockhash = require('blockhash-core');
const Hamming = require('hamming-distance');
const fs = require('fs');
const PNG = require('png-js');
const { ImageData } = require('canvas')
const sharp = require('sharp');
const request = require('request-promise-native');

let kaasbeerHash;

function isAvatarTheSame(avatarUrl, kaasbeer) {
    return new Promise(async resolve => {
        let blockhashOriginal = await getKaasbeerHash(kaasbeer);
        const hash = await getHash(avatarUrl);

        const distance = Hamming(blockhashOriginal, hash);
        resolve(distance <= 10)
    });
}

function download(url) {
    return new Promise(async (resolve, reject) => {

        request.get(url, { encoding: null }).then(async res => {
            await sharp(res).joinChannel(Buffer.alloc(128 * 128, 255), {
                raw: {
                    width: 128,
                    height: 128,
                    channels: 1
                }
            }).png().toFile(avatarUrlToPath(url))
            return resolve()
        })
    })
}

function avatarUrlToPath(url) {
    return `./img/${url.split('/').join('-')}.png`
}

function calcBlockHash(url) {
    return new Promise((resolve, reject) => {
        PNG.decode(avatarUrlToPath(url), function (pixels) {
            const uintArray = Uint16Array.from([...pixels])
            const data = new ImageData(uintArray, 184, 184)
            resolve(Blockhash.bmvbhash(data, 16));
        });
    })
}

async function getHash(avatarUrl) {
    await download(avatarUrl);
    const hash = await calcBlockHash(avatarUrl);
    removeTempImg(avatarUrl);
    return hash;
}

function removeTempImg(url) {
    return fs.unlinkSync(avatarUrlToPath(url));
}

async function getKaasbeerHash(kaasbeer) {
    if (kaasbeerHash) {
        return kaasbeerHash
    } else {
        kaasbeerHash = await getHash(kaasbeer.avatarURL());
        return kaasbeerHash;
    }
}

module.exports = { isAvatarTheSame }
