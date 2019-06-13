import VLab from '../../vlab.fwk/core/vlab';

/* RGBD Kinect Message subscriber Scenes */
import BaseScene from './scenes/base.scene/index';

/**
 * group: valter
 * alias: valter.exp.rgbd.subscriber
 * designation: exp.rgbd.subscriber
 * name: RGBD Kinect Message subscriber
 * @class
 * @extends VLab
 */
class ValterExpRgbdSubscriber extends VLab {
    /**
     * ValterExpRgbdSubscriber constructor
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
     * @memberof ValterExpRgbdSubscriber
     */
    bootstrap(iniObj) {

        /**
         * @info trace ValterExpRgbdSubscriber (this vLab) object
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

new ValterExpRgbdSubscriber({
    name: 'RGBD Kinect Message subscriber',
    natureURL: './resources/vlab.nature.json'
});