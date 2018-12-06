import VLab from '../../vlab.fwk/core/vlab';

/* This VLab Scenes */
import RightArmBonesScene   from    './scenes/right.arm.bones.scene';

/**
 * Medical VLab
 * Right Arm Bones
 * @class
 * @extends VLab
 */
class MedicalRightArmBones extends VLab {
    /**
     * MedicalRightArmBones constructor
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
     * @memberof MedicalRightArmBones
     */
    bootstrap(iniObj) {
        /* RightArmBones Scene */
        this.SceneDispatcher.addScene({
            class: RightArmBonesScene,
            natureURL: './scenes/right.arm.bones.scene/resources/vlab.scene.nature.json',
            /**
             * Set active: true for default VLabScene
             */
            active: true
        });

        console.log(this);
    }
}

new MedicalRightArmBones({
    name: 'Right Arm Bones',
    natureURL: './resources/vlab.nature.json'
});