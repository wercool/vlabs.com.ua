import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';
import Valter               from '../vlabs.items/valter';

class VlabApartment extends VLab {
    constructor(initObj = {}) {
        super(initObj);

        addEventListener(this.name + "SceneCompleteEvent", this.onSceneCompleteEvent.bind(this), false);
        addEventListener(this.name + "ActivatedEvent", this.onActivatedEvent.bind(this), false);
        addEventListener(this.name + "RedererFrameEvent",  this.onRedererFrameEvent.bind(this), false);

        document.addEventListener("keydown", this.onKeyDown.bind(this), false);

        super.preInitialize().then(() => {
            super.initialize().then((success) => {
                if (success) {
                    this.initialize(initObj);
                }
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

        var defaultCameraPos = this.getWorldPosition(this.defaultCamera);
        this.prevDefaultCameraPos = defaultCameraPos;

        var light0 = new THREE.AmbientLight(0xffffff, 0.35);
        this.vLabScene.add(light0);

        // this.PointLight1 = new THREE.PointLight(0xffffff, 1.0);
        // this.PointLight1.position.set(0.0, 6.0, 1.0);
        // this.vLabScene.add(this.PointLight1);

        this.SpotLight1 = new THREE.PointLight(0xffffff, 0.55);
        this.SpotLight1.position.set(defaultCameraPos.x, 2.95, defaultCameraPos.z);
        this.vLabScene.add(this.SpotLight1);

        this.Valter =  new Valter({
            context: this,
            pos: new THREE.Vector3(0, 0, 1.0),
            name: "Valter",
            manipulation: true
        });
    }

    onRedererFrameEvent(event) {
        var defaultCameraPos = this.getWorldPosition(this.defaultCamera);
        if (!this.prevDefaultCameraPos.equals(defaultCameraPos)) {
            this.prevDefaultCameraPos = defaultCameraPos;
            this.SpotLight1.position.set(defaultCameraPos.x, 2.95, defaultCameraPos.z);
        }
    }

}

let vlabApartment = new VlabApartment({
    "natureURL": "./resources/nature.json",
    "webGLContainer": "webGLContainer"
});