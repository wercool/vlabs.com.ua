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

import FlowAlongTube                from '../vlabs.items/flow-along-tube';
import DirectionalFlow              from '../vlabs.items/directional-flow';
import DirectionalFlowWith3DArrow   from '../vlabs.items/directionalFlowWith3DArrow';

require('../vlabs.core/three-decal-geometry')(THREE);

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
                        blackNeedleShift: new THREE.Vector3(-0.015, 0.0, 0.0),
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
                            new THREE.Vector3(-0.1, 0.769, 0.597),
                            new THREE.Vector3(-0.082, 0.771, 0.643),
                            new THREE.Vector3(-0.064, 0.783, 0.596),
                            new THREE.Vector3(-0.08, 0.764, 0.527),
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
                            spritePosDeltas: new THREE.Vector3(-0.03, 0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: 0.0,
                            redProbeOrientation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, THREE.Math.degToRad(-60.0)),
                            blackProbeOrientation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, THREE.Math.degToRad(-60.0)),
                            probeWiresPathes: {
                                blackWire: [
                                    new THREE.Vector3(-0.125, 0.790, 0.356),
                                    new THREE.Vector3(-0.125, 0.817, 0.356),
                                    new THREE.Vector3(-0.163, 0.758, 0.168),
                                    new THREE.Vector3(-0.208, 0.755, 0.184),
                                    new THREE.Vector3(-0.135, 0.875, 0.341),
                                    new THREE.Vector3(-0.107, 0.866, 0.341),
                                ],
                                redWire: [
                                    new THREE.Vector3(-0.145, 0.790, 0.356),
                                    new THREE.Vector3(-0.146, 0.813, 0.339),
                                    new THREE.Vector3(-0.185, 0.762, 0.179),
                                    new THREE.Vector3(-0.126, 0.759, 0.142),
                                    new THREE.Vector3(-0.123, 0.860, 0.322),
                                    new THREE.Vector3(-0.107, 0.866, 0.341),
                                ]
                            }
                        },
                        {
                            name: 'relayT9AV5022ContactNC',
                            target: new THREE.Vector3(0.0550126, 0.0309874, 0.0296565),
                            spritePosDeltas: new THREE.Vector3(0.05, -0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: THREE.Math.degToRad(270.0),
                            redProbeOrientation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, THREE.Math.degToRad(-60.0)),
                            blackProbeOrientation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, THREE.Math.degToRad(-60.0)),
                            probeWiresPathes: {
                            }
                        },
                        {
                            name: 'relayT9AV5022ContactNO',
                            target: new THREE.Vector3(0.055229, 0.0400362, 0.0296565),
                            spritePosDeltas: new THREE.Vector3(0.05, 0.05, 0.05),
                            spriteScale: 0.05,
                            spriteRotation: THREE.Math.degToRad(300.0),
                            redProbeOrientation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, THREE.Math.degToRad(-60.0)),
                            blackProbeOrientation: new THREE.Vector3(THREE.Math.degToRad(-90.0), 0.0, THREE.Math.degToRad(-60.0)),
                            probeWiresPathes: {
                            }
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

            // this.flowAlongWire2 = new FlowAlongTube({
            //     context: this,
            //     tube: this.vLabScene.getObjectByName('wire2'),
            //     color: undefined,
            //     scale: new THREE.Vector3(0.25, 0.25, 0.25),
            //     cSectionVertices: 12,
            //     speed: 5.0,
            //     reversed: true
            // });

            // this.flowAlongWire1 = new FlowAlongTube({
            //     context: this,
            //     tube: this.vLabScene.getObjectByName('wire1'),
            //     color: undefined,
            //     scale: new THREE.Vector3(0.25, 0.25, 0.25),
            //     cSectionVertices: 8,
            //     speed: 5.0,
            //     reversed: true,
            //     spritesNum: 30
            // });
            // setTimeout(() => {
            //     this.flowAlongWire1.chainTo = this.flowAlongWire2;
            //     this.flowAlongWire1.start();
            // }, 1000);

            // this.directionalFlow = new DirectionalFlow({
            //     context: this,
            //     name: 'directionalFlow',
            //     tubes: [
            //         {
            //             tube: this.vLabScene.getObjectByName('wire3'),
            //             cSectionVertices: 8,
            //             reversed: false
            //         },
            //         {
            //             tube: this.vLabScene.getObjectByName('wire4'),
            //             cSectionVertices: 8,
            //             reversed: false
            //         },
            //     ],
            //     color: undefined,
            //     scale: new THREE.Vector3(0.15, 0.15, 0.15),
            //     animationDelay: 100,
            //     tooltip: '~24V'
            // });
            // setTimeout(() => {
            //     this.directionalFlow.start();
            // }, 1000);

            // this.flowAlongWire4 = new FlowAlongTube({
            //     context: this,
            //     tube: this.vLabScene.getObjectByName('wire4'),
            //     color: undefined,
            //     scale: new THREE.Vector3(0.15, 0.15, 0.15),
            //     cSectionVertices: 8,
            //     speed: 0.5
            // });
            // setTimeout(() => {
            //     this.flowAlongWire4.start();
            // }, 1000);


            this.directionalFlowWith3DArrow = new DirectionalFlowWith3DArrow({
                context: this,
                name: 'wire1DirectionalFlowWith3DArrow',
                refPath: this.vLabScene.getObjectByName('wire1RefPath'),
                cSectionVertices: 4,
                reversed: true,
                speed: 250,
                scale: 1.0
            });
            setTimeout(() => {
                this.directionalFlowWith3DArrow.start();
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

        this.addDecalPlacementHelper('Suzanne');
    }

    onRedererFrameEvent(event) {
        this.checkIntersectionForDecalPlacement();
    }








    addDecalPlacementHelper(meshName) {
        this.decalPlacementHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 0.1, 0.1), new THREE.MeshNormalMaterial());
        this.decalPlacementHelper.visible = false;
        this.vLabScene.add(this.decalPlacementHelper);

        var geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        this.decalPlacementHelperLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({ linewidth: 4 }));
        this.vLabScene.add(this.decalPlacementHelperLine);

        this.decalPlacementHelperRaycaster = new THREE.Raycaster();
        this.decalPlacementHelperIntersection = {
            intersects: false,
            point: new THREE.Vector3(),
            normal: new THREE.Vector3()
        };

        var textureLoader = new THREE.TextureLoader();
        Promise.all([
            textureLoader.load('resources/maps/frost.png'),
            textureLoader.load('resources/maps/frost-normal.png'),
            textureLoader.load('resources/maps/frost-displacement.png'),
        ])
        .then((result) => {
            this.decalMaterial = new THREE.MeshPhongMaterial({
                map: result[0],
                normalMap: result[1],
                normalScale: new THREE.Vector2(1.0, 1.0),
                displacementMap: result[2],
                displacementScale: 0.001,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                // wireframe: true,
                shininess: 25
            });
        });

        this.decalTargetMesh = this.vLabScene.getObjectByName(meshName);

        this.decalTargetSrcMesh = new THREE.Mesh(new THREE.Geometry().fromBufferGeometry(this.decalTargetMesh.geometry));
        this.decalTargetSrcMesh.position.copy(this.decalTargetMesh.position);
        this.decalTargetSrcMesh.rotation.copy(this.decalTargetMesh.rotation);
        this.decalTargetSrcMesh.visible = false;
        this.vLabScene.add(this.decalTargetSrcMesh);


        this.webGLContainerEventsSubcribers.mouseup["decalPlacementHelpberVLabSceneMouseUp"] = 
        {
            callback: this.decalPlacementHelpberVLabSceneMouseUp,
            instance: this
        };
    }

    checkIntersectionForDecalPlacement() {
        if (this.decalPlacementHelperRaycaster) {
            this.decalPlacementHelperRaycaster.setFromCamera(this.mouseCoordsRaycaster, this.defaultCamera);

            var intersects = this.decalPlacementHelperRaycaster.intersectObjects([ this.decalTargetMesh ]);

            if (intersects.length > 0) {
                var p = intersects[0].point;
                this.decalPlacementHelper.position.copy(p);
                this.decalPlacementHelperIntersection.point.copy(p);
                this.decalPlacementHelperIntersection.normal.copy(intersects[0].face.normal);

                var n = intersects[0].face.normal.clone();
                n.transformDirection(this.decalTargetMesh.matrixWorld);
                n.multiplyScalar(0.15);
                n.add(intersects[0].point);
                this.decalPlacementHelper.lookAt(n);
                var positions = this.decalPlacementHelperLine.geometry.attributes.position;
                positions.setXYZ(0, p.x, p.y, p.z);
                positions.setXYZ(1, n.x, n.y, n.z);
                positions.needsUpdate = true;

                this.decalPlacementHelperIntersection.intersects = true;
            } else {
                this.decalPlacementHelperIntersection.intersects = false;
            }
        }
    }

    decalPlacementHelpberVLabSceneMouseUp() {
        if (this.decalPlacementHelperIntersection.intersects === true) {
            var position = new THREE.Vector3();
            var orientation = new THREE.Euler();
            orientation.z = Math.random() * 2 * Math.PI;

            position.copy(this.decalPlacementHelperIntersection.point);
            orientation.copy(this.decalPlacementHelper.rotation);

            var decalMesh = new THREE.Mesh(new THREE.DecalGeometry(this.decalTargetSrcMesh, position, orientation, new THREE.Vector3(0.3, 0.3, 0.3)), this.decalMaterial);
            this.vLabScene.add(decalMesh);
        }
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