import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class FirstScene extends VLabScene {
    constructor(iniObj) {
        iniObj.glTFURL = './scenes/first.scene/assets/3d/first.scene.gltf';
        super(iniObj);
        this.iniObj = iniObj;
    }
}

export default FirstScene;