import * as HTTPUtils from '../utils/http.utils';
import VLabDOM from './vlab.dom';
import VLabSceneDispatcher from './vlab.scene.dispatcher';

/**
 * VLab base class.
 * @class
 * @classdesc VLab base class serves infrastructure for elements in any VLab, creating for them common context.
 */
class VLab {
    /**
     * VLab constructor.
     * @constructor
     * @param {Object} initObj                      - Initialization Object
     * @param {string} initObj.name                 - VLab name
     * @param {string} initObj.natureURL            - VLab nature JSON file URL
     */
    constructor(initObj = {}) {
        this.initObj = initObj;

        this.initObj.naturePassphrase = '<!--VLAB NATURE PASSPHRASE-->';
    }
    /**
     * VLab initializer.
     * * Verifies initObj
     * * Loads VLab nature JSON file
     * * Instantiates VLabDOM object
     *
     * @async
     * @memberof VLab
     * @property {Object} nature                       - VLab nature from JSON file
     * @property {string} nature.name                  - VLab name
     */
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
                    this.vLabDOM = new VLabDOM(this);
                    this.vLabSceneDispatcher = new VLabSceneDispatcher(this);
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
    /**
     * Actually loads, decrypts if configured in GULP, nature JSON file.
     *
     * @async
     * @memberof VLab
     */
    getNatureFromURL(url, passphrase) {
        return HTTPUtils.getJSONFromURL(url, passphrase.length > 0 ? passphrase : undefined);
    }
}
export default VLab;