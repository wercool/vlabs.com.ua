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
            autoload: true
        });
        /* Third scene */
        this.SceneDispatcher.addScene({
            class: ThirdScene,
            natureURL: './scenes/third.scene/resources/vlab.scene.nature.json',
            autoload: true
        });

        // let self = this;
        // setTimeout(() => {
        //     /* Third scene */
        //     self.SceneDispatcher.addScene({
        //         class: ThirdScene,
        //         natureURL: './scenes/third.scene/resources/vlab.scene.nature.json',
        //         active: true
        //     });
        // }, 5000);

        let self = this;
        setTimeout(() => {
            /* Third scene */
            self.SceneDispatcher.activateScene({
                class: ThirdScene
            });
        }, 5000);

        console.log(this);
    }
}

new BaseVLab({
    name: 'Base VLab2',
    natureURL: './resources/vlab.nature.json'
});