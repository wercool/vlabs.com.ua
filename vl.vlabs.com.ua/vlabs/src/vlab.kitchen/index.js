import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';

class VlabKitchen extends VLab {
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
        // switch (event.keyCode) {
        //     case 79: // o
        //         this.switchCameraControls({ type: 'orbit' });
        //     break;
        //     case 80: // p
        //     case 32: // whitespace
        //         this.switchCameraControls({ type: 'pointerlock'});
        //     break;
        // }
    }

    onSceneCompleteEvent(event) {
        super.activate();
        super.switchCameraControls(this.nature.cameraControls);
    }

    onActivatedEvent() {
        console.log("Kitchen VLab activated");
        // this.manipulationControl.attach(this.vLabScene.getObjectByName("faucetHandle"));
        // this.manipulationControl.attach(this.vLabScene.getObjectByName("Sphere001"));

        this.vLabScene.getObjectByName("faucetHandle").rotateX(THREE.Math.degToRad(-45.0));
        this.vLabScene.getObjectByName("faucetHandle").rotateY(THREE.Math.degToRad(25.0));

        this.addZoomHelper("faucetHandle", 
                           undefined, 
                           new THREE.Vector3(0.01, 0.0, 0.0), 
                           new THREE.Vector3(0.1, 0.1, 0.1));
    }

    onRedererFrameEvent(event) {
        
    }

}

let vlabKitchen = new VlabKitchen({
    "natureURL": "./resources/nature.json",
    "webGLContainer": "webGLContainer"
});