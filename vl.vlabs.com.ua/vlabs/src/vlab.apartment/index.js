import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';
import Valter               from '../vlabs.items/valter';

class VlabApartment extends VLab {
    constructor(initObj = {}) {
        super(initObj);

        addEventListener("redererFrameEvent",  this.onRedererFrameEvent.bind(this), false);
        addEventListener("sceneCompleteEvent", this.onSceneCompleteEvent.bind(this), false);
        addEventListener("activatedEvent", this.onActivatedEvent.bind(this), false);

        document.addEventListener("keydown", this.onKeyDown.bind(this), false);

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
            this.showErrorMessage(error);
        });
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case 79: // o
                this.switchCameraControls({ type: 'orbit' });
            break;
            case 80: // p
            case 32: // whitespace
                this.switchCameraControls({ type: 'pointerlock'});
            break;
        }
    }

    onSceneCompleteEvent(event) {
        super.activate();
        super.switchCameraControls(this.nature.cameraControls);
    }

    onActivatedEvent() {
        console.log("Apartment VLab activated");

        var ambientLight = new THREE.AmbientLight(0xfffff5, 1.0);
        this.vLabScene.add(ambientLight);

        this.Valter =  new Valter({
            context: this,
            pos: new THREE.Vector3(0, 0, 1.0),
            name: "Valter"
        });
    }

    onRedererFrameEvent(event) {
        
    }

}

let vlabApartment = new VlabApartment({
    "natureURL": "./resources/nature.json",
    "webGLContainer": "webGLContainer"
});