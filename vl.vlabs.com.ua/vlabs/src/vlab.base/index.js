import * as THREE   from 'three';
import VLab         from "../vlabs.core/vlab";

class VlabBase extends VLab {
    constructor(initObj = {}) {
        super(initObj);
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
        this.eventBus.on('VLabEvent', this.eventHandler.bind(this));
        this.loadScene().then((vLabScene) => {
            this.setVLabScene(vLabScene);
        }).catch(error => {
            console.error(error);
        });
    }

    eventHandler(VLabEvent) {
        switch(VLabEvent.type) {
            case 'vLabSceneComplete':
                super.activate();
                // super.switchCameraControls({ type: 'orbit', target: this.vLabScene.getObjectByName("Cube").position });
                super.switchCameraControls({ type: 'pointerlock' });
            break;
            case 'newFrame':
                
            break;
        }
    }
}

let vLabBase = new VlabBase({
    "natureURL": "http://localhost:9001/vlab.base/resources/nature.json",
    "webGLContainer": "webGLContainer"
});