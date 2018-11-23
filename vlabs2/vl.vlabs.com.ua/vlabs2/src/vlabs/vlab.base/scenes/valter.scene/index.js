import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import VLabSceneTransitor from '../../../../vlab.fwk/aux/scene/vlab.scene.transitor';

/**
 * VLab Items
 */
import Valter from '../../../../vlab.items/valter/index';

class ValterScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }

    onLoaded() {
        var ambientLight = new THREE.AmbientLight(0x404040, 2.0); // soft white light
        this.add(ambientLight);

        // this.currentCamera.position.copy(new THREE.Vector3(-3.0, 2.0, -3.0));
        // this.currentControls.update();

        new VLabSceneTransitor({
            vLabScene: this,
            targetVLabScene: this.vLab.SceneDispatcher.getSceneByClassName('FirstScene'),
            position: new THREE.Vector3(1.5, 1.0, 0.0),
            scaleFactor: 0.5,
            tooltip: 'Go to <b>First Scene</b>'
        });

        /**
         * Valter VLabItem
         */
        this.vLab['Valter'] = new Valter({
            vLab: this.vLab,
            natureURL: '/vlab.items/valter/resources/valter.nature.json',
            name: 'ValterVLabItem'
        });

    }
}

export default ValterScene;