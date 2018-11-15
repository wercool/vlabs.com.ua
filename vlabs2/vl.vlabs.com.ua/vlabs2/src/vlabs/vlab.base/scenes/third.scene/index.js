import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import VLabSceneTransitor from '../../../../vlab.fwk/aux/scene/vlab.scene.transitor';


class ThirdScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }

    onLoaded() {
        var ambientLight = new THREE.AmbientLight(0x404040, 2.0); // soft white light
        this.add(ambientLight);

        this.currentCamera.position.copy(new THREE.Vector3(0.0, 2.0, -5.0));
        this.currentControls.update();

        new VLabSceneTransitor({
            vLabScene: this,
            targetVLabScene: this.vLab.SceneDispatcher.getSceneByClassName('SecondScene'),
            position: new THREE.Vector3(0.0, 1.0, 0.0),
            scaleFactor: 0.5,
            tooltip: 'Go to <b>Second Scene</b>'
        });
    }
}

export default ThirdScene;