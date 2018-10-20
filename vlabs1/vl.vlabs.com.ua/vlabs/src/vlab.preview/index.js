import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';

import TransformControls    from '../vlabs.core/three-transformcontrols/index';

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
            super.showErrorMessage(error);
        });
    }

    onSceneCompleteEvent(event) {
        super.activate();
        super.switchCameraControls(this.nature.cameraControls);


        this.biggestBoundingSphereRadius = 0.0;
        this.biggestObject = undefined;
        var self = this;
        for (var idx in this.vLabSceneMeshes) {
            var object = this.vLabSceneMeshes[idx];
            object.traverse(function(object) {
                object.geometry.computeBoundingSphere();
                if (object.geometry.boundingSphere) {

                    if (self.nature.manipulators) {
                        if (object.geometry.boundingSphere.radius >= self.nature.manipulators.minBoundingSphereRadius) {
                            var manipulators = new TransformControls(self.defaultCamera, self.webGLRenderer.domElement);
                            manipulators.setSize(0.5);
                            self.vLabScene.add(manipulators);
                            manipulators.attach(object);
                        }
                    }

                    if (object.geometry.boundingSphere.radius > self.biggestBoundingSphereRadius) {
                        self.biggestBoundingSphereRadius = object.geometry.boundingSphere.radius;
                        self.biggestObject = object;
                    }
                }
            });
        }
        this.defaultCameraControls.position0 = new THREE.Vector3(0.0, this.biggestBoundingSphereRadius, this.biggestBoundingSphereRadius * 1.25);
        this.defaultCameraControls.reset();
    }

    onActivatedEvent() {
        var light0 = new THREE.AmbientLight(0xffffff, 0.35);
        this.vLabScene.add(light0);

        this.SpotLight1 = new THREE.PointLight(0xffffff, 1.0);
        this.SpotLight1.position.set(0.0, 3.0, 1.0);
        this.vLabScene.add(this.SpotLight1);
    }

    onRedererFrameEvent(event) {
    }

}

let loc = (location.pathname+location.search).substr(1);
let path = loc.substr(loc.indexOf('path=') + 5);
path = '<!--VLAB COLLABORATOR HOST-->/' + path;
console.log('PATH:' + path);

var auth = "Basic " + btoa('vlabs:q1w2e3r4t5');
var XHR = new XMLHttpRequest();
XHR.open('GET', '<!--VLAB COLLABORATOR HOST-->/auth');
XHR.setRequestHeader('Authorization', auth);
XHR.send(null);

Object.assign(THREE.FileLoader.prototype, {
    requestHeader: { 'Authorization': auth }
});

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
            "forced": true,
//            "position0": new THREE.Vector3(0.0, 0.0, 0.0),
            "targetPos": new THREE.Vector3(0.0, 1.0, 0.0),
            "maxDistance": 2.0,
            "minDistance": 0.1,
            "minPolarAngle": -Math.PI * 2,
            "maxPolarAngle": Math.PI * 2,
            "minClip": 0.01
        },
        "showTHREEStats": true,
        "manipulators": {
            minBoundingSphereRadius: 0.05,
        }
    },
    webGLRendererClearColor: 0xb7b7b7,
    crossOrigin: 'anonymous'//'use-credentials'
});
