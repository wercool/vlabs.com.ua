import VLab from '../../vlab.fwk/core/vlab';

/* This VLab Scenes */
import SphygmomanometerDemoScene   from    './scenes/base.scene';

/**
 * Medical VLab
 * Sphygmomanometer Demo
 * @class
 * @extends VLab
 */
class SphygmomanometerDemo extends VLab {
    /**
     * SphygmomanometerDemo constructor
     * @constructor
     * @param {Object} initObj                      - Initialization Object
     * @param {string} initObj.name                 - VLab name
     * @param {string} initObj.natureURL            - VLab nature JSON file URL
     */
    constructor(initObj = {}) {
        super(initObj);
        this.name = initObj.name;
        super.initialize().then((iniObj) => { this.bootstrap(iniObj); }, (error) => { console.error(error); });
    }
    /**
     * VLab bootstrap. Loads and initializes Vlab Scenes, VLab Items, other shared VLab elements
     * @async
     * @memberof SphygmomanometerDemo
     */
    bootstrap(iniObj) {
        /* SphygmomanometerDemo Scene */
        this.SceneDispatcher.addScene({
            class: SphygmomanometerDemoScene,
            natureURL: './scenes/base.scene/resources/vlab.scene.nature.json',
            /**
             * Set active: true for default VLabScene
             */
            active: true
        });

        console.log(this);
    }
}

new SphygmomanometerDemo({
    name: 'SphygmomanometerDemo',
    natureURL: './resources/vlab.nature.json'
});