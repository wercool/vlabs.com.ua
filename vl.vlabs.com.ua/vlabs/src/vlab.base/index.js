import * as THREE   from 'three';
import VLab         from "../vlabs.core/vlab";

class VlabBase extends VLab {
    constructor(initObj = {}) {
        super(initObj);

        addEventListener("redererFrameEvent",  this.onRedererFrameEvent.bind(this), false);
        addEventListener("sceneCompleteEvent", this.onSceneCompleteEvent.bind(this), false);
        addEventListener("activatedEvent", this.onActivatedEvent.bind(this), false);

        document.addEventListener('keydown', this.onKeyDown.bind(this), false);

        super.preInitialize().then(() => {
            super.initialize().then((result) => {
                this.initialize();
            });
        }).catch(error => {
            console.error(error.error);
            this.showErrorMessage(error);
        });
    }

    initialize() {
        this.loadScene().then((vLabScene) => {
            this.setVLabScene(vLabScene);
        }).catch(error => {
            console.error(error);
        });
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case 79: // o
                this.switchCameraControls({ type: 'orbit', targetObjectName: 'Cube'});
            break;
            case 80: // p
                this.switchCameraControls({ type: 'pointerlock'});
            break;
        }
    }

    onSceneCompleteEvent(event) {
        super.activate();
        super.switchCameraControls(this.nature.cameraControls);
        // super.switchCameraControls({ type: 'pointerlock' });
    }

    onActivatedEvent() {
        // this.manipulationControl.attach(this.vLabScene.getObjectByName("Sphere.001"));
        // this.manipulationControl.attach(this.vLabScene.getObjectByName("Sphere"));
    }

    onRedererFrameEvent(event) {
        // console.log(event);
    }

    test(value) {
        console.log("TEST", value);
    }
}

let vLabBase = new VlabBase({
    "natureURL": "./resources/nature.json",
    "webGLContainer": "webGLContainer"
});