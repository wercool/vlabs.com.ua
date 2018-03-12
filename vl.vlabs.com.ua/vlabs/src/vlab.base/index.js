import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';

import VLabAssistant        from '../vlabs.items/vlab.assistant';
import SpriteFireEffect     from '../vlabs.items/sprite-fire-effect';
import ParticleFireEffect   from '../vlabs.items/particle-fire-effect';

import ZoomHelper           from '../vlabs.core/zoom-helper';
import DetailedView         from '../vlabs.core/detailed-view';

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

            this.SuzanneZoomHelper = new ZoomHelper({
                context: this,
                targetObjectName: "Suzanne",
                minDistance: 0.35,
                positionDeltas: new THREE.Vector3(0.0, 0.0, 0.0), 
                scale: new THREE.Vector3(0.1, 0.1, 0.1),
                color: 0xfff495
            });

            // VLab Items
            this.VLabsAssistant1 = new VLabAssistant({
                context: this,
                initPos: new THREE.Vector3(0, 0, -1.5),
                name: "VLabsAssistant1",
                title: "Алексей Майстренко"
            });
            this.VLabsAssistant2 = new VLabAssistant({
                context: this,
                initPos: new THREE.Vector3(-1.5, 0, -1.5),
                name: "VLabsAssistant2",
                title: "Karsten Gerhardt"
            });
            this.VLabsAssistant3 = new VLabAssistant({
                context: this,
                initPos: new THREE.Vector3(1.5, 0, -1.5),
                name: "VLabsAssistant3"
            });

            this.nature.objectMenus["VLabsAssistant3"] = {
                    "en": [{
                            "title": "GitHub",
                            "icon": "fa fa-github"
                            }, {
                            "title": "GitLab",
                            "icon": ["fa fa-gitlab", "#4078c0"]
                            }, {
                            "title": "subMenu",
                            "icon": "my-icon icon1"
                            }, {
                            "title": "click",
                            "icon": "my-icon icon3"
                            }, {
                            "title": "clickMe!",
                            "click": "this.test"
                            }, {
                            "disabled": true,
                            "title": "disabled"
                            }],
                        "ru": [{
                            "title": "Взять",
                            "icon": "fa fa-hand-rock",
                            "click": "takeObject"
                            }, {
                            "title": "GitLab",
                            "icon": ["fa fa-gitlab", "#4078c0"]
                            }, {
                            "title": "subMenu",
                            "icon": "my-icon icon1"
                            }, {
                            "title": "click",
                            "icon": "my-icon icon3"
                            }, {
                            "title": "clickMe!",
                            "click": "test",
                            "args": {"value": "Test Value"}
                            }, {
                            "disabled": true,
                            "title": "disabled"
                            }]
            };

            this.spriteFireEffect1 = new SpriteFireEffect({
                context: this,
                type: 'burning', 
                pos: this.vLabScene.getObjectByName("CubeResponosive").position,
                scale: new THREE.Vector3(0.75, 0.5, 0,75)
            });

            this.particleFireEffect1 = new ParticleFireEffect({
                context: this,
                color: 0xff2200,
                fireRadius: 0.05,
                fireHeight: 0.35,
                particleCount: 200,
                pos: this.vLabScene.getObjectByName("CubeResponosive").position
            });

            this.DetailedView_testCone = new DetailedView({
                context: this,
                targetObjectName: "testCone",
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                positionDeltas: new THREE.Vector3(0.0, 0.0, 0.025)
            });

            console.log("VLab Base initialized");
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
        // this.manipulationControl.attach(this.vLabScene.getObjectByName("Sphere"));
        // this.manipulationControl.attach(this.vLabScene.getObjectByName("Sphere001"));
    }

    onRedererFrameEvent(event) {

    }

    test(value) {
        console.log("TEST", value);
    }

    CubeInteractiveTaken() {

    }

    CubeInteractiveToCubeResponsive(args) {
        this.takeOffObject(true);
        this.vLabScene.getObjectByName("CubeInteractive").position.set(0.0, 1.5, 0.0);
        this.setInteractiveObjects("CubeInteractive");
        this.spriteFireEffect1.start();
        this.particleFireEffect1.stop();
    }

    SphereToCubeResponsive() {
        this.takeOffObject(true);
        this.vLabScene.getObjectByName("Sphere").position.copy(this.vLabScene.getObjectByName("CubeResponosive").position.clone());
        this.setInteractiveObjects("Sphere");
        this.particleFireEffect1.start();
    }

}

let vLabBase = new VlabBase({
    "natureURL": "./resources/nature.json",
    "webGLContainer": "webGLContainer"
});