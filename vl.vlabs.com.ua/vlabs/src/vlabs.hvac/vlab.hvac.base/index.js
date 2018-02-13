import * as THREE           from 'three';
import VLab                 from '../../vlabs.core/vlab';

class VlabBase extends VLab {
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



            var light0 = new THREE.AmbientLight(0xffffff, 0.4);
            this.vLabScene.add(light0);

            var light1 = new THREE.PointLight(0xffffff, 0.5);
            light1.position.set(0.0, 6.0, 3.0);
            this.vLabScene.add(light1);

            console.log("initialized");
        }).catch(error => {
            console.error(error);
            this.showErrorMessage(error);
        });
    }

    onKeyDown(event) {
        // console.log(event.keyCode);
        switch (event.keyCode) {
            case 79: // o
                this.switchCameraControls({ type: 'orbit', targetObjectName: 'Cube' });
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

        this.addZoomHelper(
            "frameCapBolt10", 
            undefined, 
            new THREE.Vector3(0.0, -0.04, 0.0), 
            new THREE.Vector3(0.1, 0.1, 0.1),
            Math.PI,
            0xfff495);

        this.addZoomHelper(
            "bryantB225B-heatPumpCompressorElectricConnector", 
            undefined, 
            new THREE.Vector3(-0.05, 0.0, 0.05), 
            new THREE.Vector3(0.1, 0.1, 0.1),
            Math.PI,
            0xfff495,
            true,
            0.35);

        this.manipulationControl.attach(this.vLabScene.getObjectByName("bryantB225B-heatPumpFrameCap"));
    }

    onRedererFrameEvent(event) {

    }

    test(value) {
        console.log("TEST", value);
    }

}

let vLabBase = new VlabBase({
    "natureURL": "./resources/nature.json",
    "webGLContainer": "webGLContainer"
});