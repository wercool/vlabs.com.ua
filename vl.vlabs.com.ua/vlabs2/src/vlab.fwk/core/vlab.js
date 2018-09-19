import * as THREE from 'three';
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

        this.clock = new THREE.Clock();

        this.getNaturePassphrase        = () => { return  '<!--VLAB NATURE PASSPHRASE-->' };
        this.getProdMode                = () => { return  '<!--VLAB PROD MODE-->' == 'true' };
        console.log('THREE.WebGLRenderer', THREE.REVISION);
    }
    /**
     * VLab initializer.
     * * Verifies initObj
     * * Loads VLab nature
     * * Instantiates VLabDOM
     * * Instantiates VLabSceneDispatcher
     *
     * @async
     * @memberof VLab
     *
     */
    initialize() {
        return new Promise((resolve, reject) => {
            let initObjAbnormals = [];
            if (this.initObj.name == undefined)      initObjAbnormals.push('this.initObj.name is not set');
            if (this.initObj.natureURL == undefined) initObjAbnormals.push('this.initObj.natureURL is not set');
            if (initObjAbnormals.length == 0) {
                this.getNatureFromURL(this.initObj.natureURL, this.getNaturePassphrase())
                .then((nature) => {
                    /**
                     * VLab nature
                     * @inner
                     * @property {Object} nature                       - VLab nature from JSON file from constructor initObj.natureURL
                     * @property {string} nature.name                  - VLab name
                     * @property {Object} nature.styles                - VLab DOM CSS styles
                     * @property {string} nature.styles.global         - global CSS, overrides /vlab.assets/css/global.css
                     */
                    this.nature = nature;
                    /**
                     * VLab DOM manager
                     * @inner
                     */
                    this.DOM = new VLabDOM(this);
                    /**
                     * VLab SceneDispatcher
                     * @inner
                     */
                    this.SceneDispatcher = new VLabSceneDispatcher(this);

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
     * Actually loads, decrypts, if configured in GULP, nature JSON file from URL.
     *
     * @async
     * @memberof VLab
     * @returns {Promise | JSON}            - JSON of nature file in Promise resolver
     */
    getNatureFromURL(url, passphrase) {
        return HTTPUtils.getJSONFromURL(url, passphrase.length > 0 ? passphrase : undefined);
    }
}
export default VLab;