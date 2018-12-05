import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import VLabSceneTransitor from '../../../../vlab.fwk/aux/scene/vlab.scene.transitor';

/**
 * VLab Items
 */

class RightArmScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }

    onLoaded() {
        var ambientLight = new THREE.AmbientLight(0x404040, 0.25); // soft white light
        this.add(ambientLight);

        new VLabSceneTransitor({
            vLabScene: this,
            targetVLabScene: this.vLab.SceneDispatcher.getSceneByClassName('FirstScene'),
            position: new THREE.Vector3(1.5, 1.0, 0.0),
            scaleFactor: 0.5,
            tooltip: 'Go to <b>First Scene</b>'
        });

    }
}

export default RightArmScene;