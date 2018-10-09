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
        super.initialize().then((iniObj) => { this.bootstrap(iniObj); }, (error) => { console.error(error); });
    }
    /**
     * VLab bootstrap. Loads and initializes Vlab Scenes, VLab Items, other shared VLab elements
     * @async
     * @memberof BaseVLab
     */
    bootstrap(iniObj) {
        /* First scene */
        this.SceneDispatcher.addScene({
            class: FirstScene,
            natureURL: './scenes/first.scene/resources/vlab.scene.nature.json',
            active: true
        });
        /* Second scene */
        this.SceneDispatcher.addScene({
            class: SecondScene,
            natureURL: './scenes/second.scene/resources/vlab.scene.nature.json',
            autoload: false
        });
        /* Third scene */
        this.SceneDispatcher.addScene({
            class: ThirdScene,
            natureURL: './scenes/third.scene/resources/vlab.scene.nature.json',
            autoload: false
        });



        // let self = this;
        // setTimeout(() => {
        //     /* Activate Second Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: SecondScene
        //     }).then((vLabScene) => { console.log(vLabScene.name + ' activated from ' + this.initObj.name); });
        // }, 10000);

        // setTimeout(() => {
        //     /* Activate FirstScene Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: FirstScene
        //     });
        // }, 20000);

        // setTimeout(() => {
        //     /* Activate ThirdScene Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: ThirdScene
        //     });
        // }, 30000);

        // setTimeout(() => {
        //     /* Activate FirstScene Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: FirstScene
        //     });
        // }, 40000);

        console.log(this);
    }
}

new BaseVLab({
    name: 'Base VLab2',
    natureURL: './resources/vlab.nature.json'
});