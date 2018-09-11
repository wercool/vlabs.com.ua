import * as HTTPUtils from '../utils/http.utils';

export default class VLab {

    constructor(initObj = {}) {
        this.initObj = initObj;

        this.initObj.naturePassphrase = '<!--VLAB NATURE PASSPHRASE-->';
    }

    initialize() {
        return new Promise((resolve, reject) => {
            let initObjAbnormals = [];
            if (this.initObj.name == undefined)      initObjAbnormals.push('this.initObj.name is not set');
            if (this.initObj.natureURL == undefined) initObjAbnormals.push('this.initObj.natureURL is not set');
            if (initObjAbnormals.length == 0) {
                this.getNatureFromURL(this.initObj.natureURL, this.initObj.naturePassphrase)
                .then((nature) => {
                    delete this.initObj.naturePassphrase;
                    this.nature = nature;
                    resolve({});
                })
                .catch((error) => { reject(error); });
            } else {
                if (initObjAbnormals.length > 0) {
                    console.error('VLab incorrectly initialized!');
                    console.log(initObjAbnormals);
                }
            }
        });
    }

    getNatureFromURL(url, passphrase) {
        return HTTPUtils.getJSONFromURL(url, passphrase.length > 0 ? passphrase : undefined);
    }

}