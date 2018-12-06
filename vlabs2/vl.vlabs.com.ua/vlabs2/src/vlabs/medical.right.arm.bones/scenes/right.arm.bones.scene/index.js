import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as VLabUtils from '../../../../vlab.fwk/utils/vlab.utils';

class RightArmBonesScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);

        this.prevActionInitialEventCoords = undefined;
    }
    /**
     * Called once scene is loaded
     */
    onLoaded() {
        var ambientLight = new THREE.AmbientLight(0x404040, 0.25); // soft white light
        this.add(ambientLight);

        this.getObjectByName('elbowS1').material.depthTest = false;
        this.getObjectByName('elbowS1').material.depthWrite = false;

        this.getObjectByName('elbowS130').material.depthTest = false;
        this.getObjectByName('elbowS130').material.depthWrite = false;
    }
    /**
     * Action-inv action
     */
    commonInvAction() {
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.enable();
        this.prevActionInitialEventCoords = undefined;
    }
    radiusUlnaBonesAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDelta = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x) / 100;
            let delta = eventCoordsDelta * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? 1 : -1);
            if (this.getObjectByName('ulna').rotation.z + delta < 0.23 && this.getObjectByName('ulna').rotation.z + delta > -2.33) {
                this.getObjectByName('ulna').rotateZ(delta);
            }
        }
        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    scaphoidLunateBonesAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x) / 100;
            let eventCoordsDeltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y) / 100;
            let deltaY = eventCoordsDeltaY * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1);
            let deltaX = eventCoordsDeltaX * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? 1 : -1);
            if (this.getObjectByName('scaphoid').rotation.x + deltaY > -1.0 && this.getObjectByName('scaphoid').rotation.x + deltaY < 1.0) {
                this.getObjectByName('scaphoid').rotateX(deltaY);
            }
            if (this.getObjectByName('scaphoid').rotation.z + deltaX < 0.4 && this.getObjectByName('scaphoid').rotation.z + deltaX > -0.4) {
                this.getObjectByName('scaphoid').rotateZ(deltaX);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    thumbMetacarpalBoneAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x) / 100;
            let eventCoordsDeltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y) / 100;
            let deltaY = eventCoordsDeltaY * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1);
            let deltaX = eventCoordsDeltaX * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? 1 : -1);
            if (this.getObjectByName('metacpl1').rotation.x + deltaY > -0.2 && this.getObjectByName('metacpl1').rotation.x + deltaY < 0.6) {
                this.getObjectByName('metacpl1').rotateX(deltaY);
            }
            if (this.getObjectByName('metacpl1').rotation.z + deltaX > -0.8 && this.getObjectByName('metacpl1').rotation.z + deltaX < 0.3) {
                this.getObjectByName('metacpl1').rotateZ(deltaX);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    thumbProximalPhalanBoneAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x) / 100;
            let deltaX = eventCoordsDeltaX * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? 1 : -1);
            if (this.getObjectByName('phalng1p').rotation.z + deltaX > -0.35 && this.getObjectByName('phalng1p').rotation.z + deltaX < 1.23) {
                this.getObjectByName('phalng1p').rotateZ(deltaX);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    thumbDistalPhalanBoneAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x) / 100;
            let deltaX = eventCoordsDeltaX * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? 1 : -1);
            if (this.getObjectByName('phalng1d').rotation.z + deltaX > 0.0 && this.getObjectByName('phalng1d').rotation.z + deltaX < 1.45) {
                this.getObjectByName('phalng1d').rotateZ(deltaX);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    indexMetacarpalBoneAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x) / 200;
            let eventCoordsDeltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y) / 100;
            let deltaY = eventCoordsDeltaY * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1);
            let deltaX = eventCoordsDeltaX * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? 1 : -1);
            if (this.getObjectByName('mcarple2').rotation.x + deltaY > 0.0 && this.getObjectByName('mcarple2').rotation.x + deltaY < 1.1) {
                this.getObjectByName('mcarple2').rotateX(deltaY);
            }
            if (this.getObjectByName('mcarple2').rotation.z + deltaX > -0.075 && this.getObjectByName('mcarple2').rotation.z + deltaX < 0.075) {
                this.getObjectByName('mcarple2').rotateZ(deltaX);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    indexProximalPhalanxBoneAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y) / 200;
            let deltaY = eventCoordsDeltaY * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1);
            if (this.getObjectByName('phalanx2').rotation.x + deltaY > 0.0 && this.getObjectByName('phalanx2').rotation.x + deltaY < 1.2) {
                this.getObjectByName('phalanx2').rotateX(deltaY);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    indexMiddlePhalanxBoneAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y) / 200;
            let deltaY = eventCoordsDeltaY * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1);
            if (this.getObjectByName('phalx2m').rotation.x + deltaY > 0.0 && this.getObjectByName('phalx2m').rotation.x + deltaY < 1.1) {
                this.getObjectByName('phalx2m').rotateX(deltaY);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    indexDistalPhalanxBoneAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let eventCoordsDeltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y) / 200;
            let deltaY = eventCoordsDeltaY * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1);
            if (this.getObjectByName('phalx2d').rotation.x + deltaY > 0.0 && this.getObjectByName('phalx2d').rotation.x + deltaY < 0.85) {
                this.getObjectByName('phalx2d').rotateX(deltaY);
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
}

export default RightArmBonesScene;