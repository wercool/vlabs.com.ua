import VLab from '../../vlab.fwk/core/vlab';

/* Kinsmart Lamborghini Miura 1971 P400 SV Scenes */
import BaseScene from './scenes/base.scene/index';

/**
 * group: toys
 * alias: toys.kinsmart.lamborghiniMiura1971P400SV
 * designation: kinsmart.lamborghiniMiura1971P400SV
 * name: Kinsmart Lamborghini Miura 1971 P400 SV
 * @class
 * @extends VLab
 */
class ToysKinsmartLamborghiniMiura1971P400SV extends VLab {
    /**
     * ToysKinsmartLamborghiniMiura1971P400SV constructor
     * @constructor
     * @param {Object} initObj                      - Initialization Object
     * @param {string} initObj.name                 - VLab name
     * @param {string} initObj.natureURL            - VLab nature JSON file URL
     */
    constructor(initObj = {}) {
        super(initObj);
        super.initialize().then((iniObj) => { this.bootstrap(iniObj); }, (error) => { console.error(error); });
    }
    /**
     * i) VLab bootstrap. Loads and initializes Vlab Scenes, VLab Items, other shared VLab elements.
     * i.1) VLab Items, shared between scenes, have to be defined here
     * @async
     * @memberof ToysKinsmartLamborghiniMiura1971P400SV
     */
    bootstrap(iniObj) {

        /**
         * @info trace ToysKinsmartLamborghiniMiura1971P400SV (this vLab) object
         */
        console.log(this);

        /**
         * Base Scene
         */
        this.SceneDispatcher.addScene({
            class: BaseScene,
            natureURL: './scenes/base.scene/resources/vlab.scene.nature.json',
            /**
             * Set active: true for default (base) VLabScene
             */
            active: true
        });
    }
}

new ToysKinsmartLamborghiniMiura1971P400SV({
    name: 'Kinsmart Lamborghini Miura 1971 P400 SV',
    natureURL: './resources/vlab.nature.json'
});