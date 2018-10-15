import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import VLabSceneTransitor from '../../../../vlab.fwk/aux/scene/vlab.scene.transitor';

class SecondScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }

    onLoaded() {
        new VLabSceneTransitor({
            vLabScene: this,
            targetVLabScene: this.vLab.SceneDispatcher.getSceneByClassName('FirstScene'),
            position: new THREE.Vector3(0.0, -0.2, -0.1),
            scaleFactor: 0.1,
            tooltip: 'Go to <b>First Scene</b>'
        });
    }
}

export default SecondScene;