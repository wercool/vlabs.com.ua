import VLab from '../../vlab.fwk/core/vlab';

/* This VLab Scenes */
import BasicsOfLungSoundsScene   from    './scenes/base.scene';

/**
 * Medical VLab
 * Basics of Lung Sounds
 * @class
 * @extends VLab
 */
class BasicsOfLungSounds extends VLab {
    /**
     * BasicsOfLungSounds constructor
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
     * VLab bootstrap. Loads and initializes Vlab Scenes, VLab Items, other shared VLab elements
     * @async
     * @memberof BasicsOfLungSounds
     */
    bootstrap(iniObj) {
        /* BasicsOfLungSounds Scene */
        this.SceneDispatcher.addScene({
            class: BasicsOfLungSoundsScene,
            natureURL: './scenes/base.scene/resources/vlab.scene.nature.json',
            /**
             * Set active: true for default VLabScene
             */
            active: true
        });

        console.log(this);
    }
}

new BasicsOfLungSounds({
    name: 'BasicsOfLungSounds',
    natureURL: './resources/vlab.nature.json'
});