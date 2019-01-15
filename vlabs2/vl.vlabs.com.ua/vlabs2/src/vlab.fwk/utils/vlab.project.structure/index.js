import VLab from '../../vlab.fwk/core/vlab';

/* This VLab Scenes */
import RightArmScene   from    './scenes/right.arm.scene';

/**
 * Medical VLab
 * Right Arm Bones
 * @class
 * @extends VLab
 */
class MedicalRightArm extends VLab {
    /**
     * MedicalRightArm constructor
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
     * @memberof MedicalRightArm
     */
    bootstrap(iniObj) {
        /* RightArmBones Scene */
        this.SceneDispatcher.addScene({
            class: RightArmScene,
            natureURL: './scenes/right.arm.scene/resources/vlab.scene.nature.json',
            /**
             * Set active: true for default VLabScene
             */
            active: true
        });

        console.log(this);
    }
}

new MedicalRightArm({
    name: 'Right Arm',
    natureURL: './resources/vlab.nature.json'
});