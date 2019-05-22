import VLab from '../../vlab.fwk/core/vlab';

/* Valter ANN Navigation Scenes */
import BaseScene from './scenes/base.scene/index';

/**
 * group: valter
 * alias: valter.navigation.ann
 * designation: navigation.ann
 * name: Valter ANN Navigation
 * @class
 * @extends VLab
 */
class ValterNavigationAnn extends VLab {
    /**
     * ValterNavigationAnn constructor
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
     * @memberof ValterNavigationAnn
     */
    bootstrap(iniObj) {

        /**
         * @info trace ValterNavigationAnn (this vLab) object
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

new ValterNavigationAnn({
    name: 'Valter ANN Navigation',
    natureURL: './resources/vlab.nature.json'
});