import VLab from '../../vlab.fwk/core/vlab';

/* Kinsmart on a slide Scenes */
import BaseScene from './scenes/base.scene/index';

/**
 * group: toys
 * alias: toys.kinsmart.slide
 * designation: kinsmart.slide
 * name: Kinsmart on a slide
 * @class
 * @extends VLab
 */
class ToysKinsmartSlide extends VLab {
    /**
     * ToysKinsmartSlide constructor
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
     * @memberof ToysKinsmartSlide
     */
    bootstrap(iniObj) {

        /**
         * @info trace ToysKinsmartSlide (this vLab) object
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

new ToysKinsmartSlide({
    name: 'Kinsmart on a slide',
    natureURL: './resources/vlab.nature.json'
});