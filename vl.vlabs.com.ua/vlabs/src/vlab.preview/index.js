import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';

import DetailedView         from '../vlabs.core/detailed-view';

class VlabPreview extends VLab {
    constructor(initObj = {}) {
        super(initObj);

        addEventListener(this.name + "SceneCompleteEvent", this.onSceneCompleteEvent.bind(this), false);
        addEventListener(this.name + "ActivatedEvent", this.onActivatedEvent.bind(this), false);
        addEventListener(this.name + "RedererFrameEvent",  this.onRedererFrameEvent.bind(this), false);

        super.preInitialize().then(() => {
            super.completeInitialization();
            this.initialize();
        }).catch(error => {
            console.error(error.error);
            this.showErrorMessage(error);
        });
    }

    initialize() {
        this.loadScene().then((vLabScene) => {
            this.setVLabScene(vLabScene);

            console.log("VLab Preview initialized");
        }).catch(error => {
            console.error(error);
            this.showErrorMessage(error);
        });
    }

    onSceneCompleteEvent(event) {
        super.activate();
        super.switchCameraControls(this.nature.cameraControls);
    }

    onActivatedEvent() {
        var light0 = new THREE.AmbientLight(0xffffff, 0.35);
        this.vLabScene.add(light0);

        this.SpotLight1 = new THREE.PointLight(0xffffff, 0.55);
        this.SpotLight1.position.set(0.0, 3.0, 1.0);
        this.vLabScene.add(this.SpotLight1);
    }

    onRedererFrameEvent(event) {
    }

}

let loc = (location.pathname+location.search).substr(1);
let path = loc.substr(loc.indexOf('path=') + 5);
path = 'http://192.168.101.106:8000/' + path;
console.log('PATH:' + path);

let vlabPreview = new VlabPreview({
    name: "VLab Model Preview",
    natureObj: {
        "title": "VLab Model Preview",
        "alias": "vlab.preview",
        "version": "0.2.1",
        "resolutionFactor": "1.0",
        "sceneJSONFile": path,
        "lang": "en",
        "cameraControls": {
            "type": "orbit",
            "maxDistance": 2.0,
            "minDistance": 0.1
        },
        "showTHREEStats": true
    },
});
