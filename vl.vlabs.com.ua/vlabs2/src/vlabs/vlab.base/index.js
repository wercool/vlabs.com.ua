import VLab from '../../vlab.fwk/core/vlab';

/* This VLab Scenes */
import FirstScene   from    './scenes/first.scene';
import SecondScene  from    './scenes/second.scene';
import ThirdScene   from    './scenes/third.scene';

/**
 * VLab experimental/tutorial class.
 * @class
 * @extends VLab
 * @classdesc BaseVLab class serves as an application example of standard VLab features.
 */
class BaseVLab extends VLab {
    /**
     * BaseVLab constructor.
     * @constructor
     * @param {Object} initObj                      - Initialization Object
     * @param {string} initObj.name                 - VLab name
     * @param {string} initObj.natureURL            - VLab nature JSON file URL
     */
    constructor(initObj = {}) {
        super(initObj);
        super.initialize().then((success) => { this.bootstrap(); }, (error) => { console.error(error); });
    }
    /**
     * VLab bootstrap. Loads and initializes Vlab Scenes, VLab Items, other shared VLab elements
     * @async
     * @memberof BaseVLab
     */
    bootstrap() {
        /* First scene */
        this.vLabSceneDispatcher.addScene({
            class: FirstScene,
            natureURL: './scenes/first.scene/resources/vlab.scene.nature.json',
            default: true
        });
        /* Second scene */
        this.vLabSceneDispatcher.addScene({
            class: SecondScene,
            natureURL: './scenes/second.scene/resources/vlab.scene.nature.json',
            autoload: true
        });
        /* Third scene */
        this.vLabSceneDispatcher.addScene({
            class: ThirdScene,
            natureURL: './scenes/third.scene/resources/vlab.scene.nature.json',
            autoload: true
        });

        // console.log(this);
    }
}

new BaseVLab({
    name: 'Base VLab2',
    natureURL: './resources/vlab.nature.json'
});