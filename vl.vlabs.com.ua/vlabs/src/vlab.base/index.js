import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';
import Inventory            from '../vlabs.core/inventory';

import VLabAssistant        from '../vlabs.items/vlab.assistant';
import SpriteFireEffect     from '../vlabs.items/sprite-fire-effect';
import ParticleFireEffect   from '../vlabs.items/particle-fire-effect';

import ZoomHelper           from '../vlabs.core/zoom-helper';
import DetailedView         from '../vlabs.core/detailed-view';

import BernzomaticTS8000Torch       from '../vlabs.items/bernzomaticTS8000Torch';
import DigitalMultimeterFluke17B    from '../vlabs.items/digitalMultimeterFluke17B';
import TrueRMSMultimeterHS36        from '../vlabs.items/trueRMSMultimeterHS36';

import FlowAlongTube            from '../vlabs.items/flow-along-tube';

class VlabBase extends VLab {
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

            this.inventory = new Inventory({
                context: this
            });

            new DigitalMultimeterFluke17B({
                context: this,
                inventory: this.inventory,
                interactive: true
            }).then((instance) => {
                this.digitalMultimeterFluke17B = instance;
                this.digitalMultimeterFluke17B.addResponsiveObject({
                    mesh: this.vLabScene.getObjectByName('controlBoard'),
                    testPoints: [
                        {
                            name: 'relayT9AV5022ContactCOM',
                            target: new THREE.Vector3(0.0352108, 0.02511, 0.0296565),
                            orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, THREE.Math.degToRad(30.0)),
                            spritePosDeltas: new THREE.Vector3(-0.03, 0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: 0.0
                        },
                        {
                            name: 'relayT9AV5022ContactNC',
                            target: new THREE.Vector3(0.0550126, 0.0309874, 0.0296565),
                            orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, THREE.Math.degToRad(-60.0)),
                            spritePosDeltas: new THREE.Vector3(0.05, -0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: THREE.Math.degToRad(270.0)
                        },
                        {
                            name: 'relayT9AV5022ContactNO',
                            target: new THREE.Vector3(0.055229, 0.0400362, 0.0296565),
                            orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, 0.0),
                            spritePosDeltas: new THREE.Vector3(0.05, 0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: THREE.Math.degToRad(300.0)
                        },
                    ]
                });
            });

            new TrueRMSMultimeterHS36({
                context: this,
                inventory: undefined,
                interactive: true,
                name: 'trueRMSMultimeterHS36',
                pos: new THREE.Vector3(-0.135, 0.765, 0.364),
                rotation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, 0.0),
                devMode: false
            }).then((instance) => {
                this.trueRMSMultimeterHS36 = instance;

                this.trueRMSMultimeterHS36.setProbes({
                    initialLocation: {
                        blackNeedleShift: new THREE.Vector3(0.0, 0.0, 0.0),
                        redNeedleShift: new THREE.Vector3(0.0, 0.0, 0.0)
                    },
                    probeWiresPathes: {
                        redWire: [
                            new THREE.Vector3(-0.145, 0.790, 0.356),
                            new THREE.Vector3(-0.147, 0.815, 0.356),
                            new THREE.Vector3(-0.180, 0.778, 0.532),
                            new THREE.Vector3(-0.186, 0.769, 0.651),
                            new THREE.Vector3(-0.214, 0.768, 0.594),
                            new THREE.Vector3(-0.205, 0.764, 0.527),
                        ],
                        blackWire: [
                            new THREE.Vector3(-0.125, 0.790, 0.356),
                            new THREE.Vector3(-0.123, 0.817, 0.356),
                            new THREE.Vector3(-0.093, 0.769, 0.597),
                            new THREE.Vector3(-0.082, 0.771, 0.643),
                            new THREE.Vector3(-0.064, 0.783, 0.596),
                            new THREE.Vector3(-0.065, 0.764, 0.527),
                        ]
                    },
                    devMode: false
                });


                this.trueRMSMultimeterHS36.addResponsiveObject({
                    mesh: this.vLabScene.getObjectByName('controlBoard'),
                    testPoints: [
                        {
                            name: 'relayT9AV5022ContactCOM',
                            target: new THREE.Vector3(0.0352108, 0.02511, 0.0296565),
                            orientation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, THREE.Math.degToRad(-60.0)),
                            spritePosDeltas: new THREE.Vector3(-0.03, 0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: 0.0,
                            probeWiresPathes: {
                                blackWire: [
                                    new THREE.Vector3(-0.125, 0.790, 0.356),
                                    new THREE.Vector3(-0.125, 0.817, 0.356),
                                    new THREE.Vector3(-0.163, 0.758, 0.168),
                                    new THREE.Vector3(-0.208, 0.755, 0.184),
                                    new THREE.Vector3(-0.135, 0.875, 0.341),
                                    new THREE.Vector3(-0.107, 0.866, 0.341),
                                ]
                            }
                        },
                        {
                            name: 'relayT9AV5022ContactNC',
                            target: new THREE.Vector3(0.0550126, 0.0309874, 0.0296565),
                            orientation: new THREE.Vector3(THREE.Math.degToRad(-45.0), 0.0, THREE.Math.degToRad(0.0)),
                            spritePosDeltas: new THREE.Vector3(0.05, -0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: THREE.Math.degToRad(270.0),
                            probesDevMode: true,
                        },
                        {
                            name: 'relayT9AV5022ContactNO',
                            target: new THREE.Vector3(0.055229, 0.0400362, 0.0296565),
                            orientation: new THREE.Vector3(THREE.Math.degToRad(-135.0), 0.0, THREE.Math.degToRad(0.0)),
                            spritePosDeltas: new THREE.Vector3(0.05, 0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: THREE.Math.degToRad(300.0),
                            probesDevMode: true,
                        },
                    ]
                });
            });

            this.controlBoardZoomHelper = new ZoomHelper({
                context: this,
                targetObjectName: "controlBoard",
                minDistance: 0.0,
                positionDeltas: new THREE.Vector3(0.0, -0.1, 0.075), 
                scale: new THREE.Vector3(0.1, 0.1, 0.1),
                minPolarAngle: -Math.PI * 2,
                maxPolarAngle: Math.PI * 2,
                color: 0xfff495
            });


            this.flowAlongWire1 = new FlowAlongTube({
                context: this,
                tube: this.vLabScene.getObjectByName('wire1'),
                color: undefined,
                scale: new THREE.Vector3(0.25, 0.25, 0.25),
                cSectionVertices: 8,
                speed: 5.0,
                reversed: true
            });
            setTimeout(() => {
                this.flowAlongWire1.start();
            }, 1000);

            this.flowAlongWire2 = new FlowAlongTube({
                context: this,
                tube: this.vLabScene.getObjectByName('wire2'),
                color: undefined,
                scale: new THREE.Vector3(0.25, 0.25, 0.25),
                cSectionVertices: 12,
                speed: 10.0,
                reversed: true
            });
            setTimeout(() => {
                this.flowAlongWire2.start();
            }, 1000);

            this.flowAlongWire3 = new FlowAlongTube({
                context: this,
                tube: this.vLabScene.getObjectByName('wire3'),
                color: undefined,
                scale: new THREE.Vector3(0.15, 0.15, 0.15),
                cSectionVertices: 8,
                speed: 0.5
            });
            setTimeout(() => {
                this.flowAlongWire3.start();
            }, 1000);

            this.flowAlongWire4 = new FlowAlongTube({
                context: this,
                tube: this.vLabScene.getObjectByName('wire4'),
                color: undefined,
                scale: new THREE.Vector3(0.15, 0.15, 0.15),
                cSectionVertices: 8,
                speed: 0.5
            });
            setTimeout(() => {
                this.flowAlongWire4.start();
            }, 1000);



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
                name:'spriteFireEffect1',
                type: 'burning', 
                pos: this.vLabScene.getObjectByName("CubeResponosive").position,
                scale: new THREE.Vector3(0.75, 0.5, 0,75)
            });

            this.spriteFireEffect2 = new SpriteFireEffect({
                context: this,
                name:'spriteFireEffect2',
                type: 'burning', 
                pos: this.vLabScene.getObjectByName("CubeResponosive").position,
                scale: new THREE.Vector3(0.75, 2.5, 0,75)
            });

            this.particleFireEffect1 = new ParticleFireEffect({
                context: this,
                name: 'particleFireEffect1',
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
                positionDeltas: new THREE.Vector3(0.0, 0.0, 0.025),
                controls: {}
            });


            this.BernzomaticTS8000Torch = new BernzomaticTS8000Torch({
                context: this,
                pos: new THREE.Vector3(0.0, 1.5, -1.2),
                name: "BernzomaticTS8000Torch",
                manipulation: false,
                interactive: false,
                inventory: undefined,
                zoomHelper: true
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
        this.testFunciton = (() => {
            console.log('testFunction');
        });
    }

    onRedererFrameEvent(event) {
    }

    test(value) {
        console.log("TEST", value);
        this.testFunciton();
    }

    //called after CubeInteractive has been taken
    CubeInteractiveTaken() {
        this.test();
    }

    CubeInteractiveToCubeResponsive(args) {
        this.takeOffObject(true);
        this.vLabScene.getObjectByName("CubeInteractive").position.set(0.0, 1.5, 0.0);
        this.setInteractiveObjects("CubeInteractive");
        this.spriteFireEffect1.start();
        this.spriteFireEffect2.start();
        this.particleFireEffect1.stop();
    }

    SphereToCubeResponsive() {
        this.takeOffObject(true);
        this.vLabScene.getObjectByName("Sphere").position.copy(this.vLabScene.getObjectByName("CubeResponosive").position.clone());
        this.setInteractiveObjects("Sphere");
        this.particleFireEffect1.start();
        this.spriteFireEffect1.stop();
    }

    digitalMultimeterFluke17BToControlBoard() {
        console.log('digitalMultimeterFluke17BToControlBoard');
        this.takeOffObject(true);
        this.setInteractiveObjects("digitalMultimeterFluke17B");
        this.digitalMultimeterFluke17B.activate();
    }
}

let vLabBase = new VlabBase({
    name: "BaseVLab",
    natureURL: "./resources/nature.json",
});