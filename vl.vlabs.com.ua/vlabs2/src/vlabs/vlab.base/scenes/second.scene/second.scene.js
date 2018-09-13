import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class SecondScene extends VLabScene {
    constructor(iniObj) {
        iniObj.glTFURL = './scenes/second.scene/assets/3d/second.scene.gltf';
        super(iniObj);
        this.iniObj = iniObj;
    }
}

export default SecondScene;