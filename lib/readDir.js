const path = require('path');
const fs = require('fs');


module.exports = function (dirname) {
    const directoryPath = path.join(__dirname, dirname);

    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, function (err, files) {
            if (err) {
                reject(err);
            }
            resolve(files)
        });
    })

}

