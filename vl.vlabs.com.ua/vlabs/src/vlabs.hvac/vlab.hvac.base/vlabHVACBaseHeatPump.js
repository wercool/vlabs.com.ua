import * as THREE                   from 'three';
import * as TWEEN                   from 'tween.js';
import VLab                         from '../../vlabs.core/vlab';

import Inventory                    from '../../vlabs.core/inventory';
import DetailedView                 from '../../vlabs.core/detailed-view';
import ZoomHelper                   from '../../vlabs.core/zoom-helper';
import TransformControls            from '../../vlabs.core/three-transformcontrols/index';
import VLabPositioner               from '../../vlabs.core/vlab-positioner';
import VLabInteractor               from '../../vlabs.core/vlab-interactor';

//VLab Items
import BoshScrewdriver              from '../../vlabs.items/boshScrewdriver';
import ClampMeterUEIDL479           from '../../vlabs.items/clampMeterUEIDL479';
import FatMaxScrewdriver            from '../../vlabs.items/fatMaxScrewdriver';
import ReversingValveEF17BZ251      from '../../vlabs.items/hvac/reversingValveEF17BZ251';
import ControlBoardCEBD430433       from '../../vlabs.items/hvac/controlBoardCEBD430433';
import ScrollCompressorZP25K5E      from '../../vlabs.items/hvac/scrollCompressorZP25K5E';
import DigitalMultimeterFluke17B    from '../../vlabs.items/digitalMultimeterFluke17B';
import TrueRMSMultimeterHS36        from '../../vlabs.items/trueRMSMultimeterHS36';

export default class VlabHVACBaseHeatPump extends VLab {
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

    initialize(initObj) {
        this.initObj = initObj;
        this.vLabLocator = this.initObj.vLabLocator;

        this.loadScene().then((vLabScene) => {
            this.setVLabScene(vLabScene);

            this.light0 = new THREE.AmbientLight(0xffffff, 0.4);
            this.vLabScene.add(this.light0);

            this.light1 = new THREE.PointLight(0xffffff, 0.5);
            this.light1.position.set(3.0, 5.0, 0.0);
            this.vLabScene.add(this.light1);

            if (this.nature.useShadows) {
                this.setupShadows({'defaultPointLight': this.light1});
            }

            //Z-fighting fixes
            var ZFightingMaterial = this.vLabScene.getObjectByName("bryantB225B_heatPumpFrameBottom").material;
            ZFightingMaterial.polygonOffset = true;
            ZFightingMaterial.polygonOffsetFactor = -1.0;
            ZFightingMaterial.polygonOffsetUnits = -4.0;
            ZFightingMaterial.needsUpdate = true;

            var ZFightingMaterial = this.vLabScene.getObjectByName("ACDisconnectCase").material;
            ZFightingMaterial.polygonOffset = true;
            ZFightingMaterial.polygonOffsetFactor = -1.0;
            ZFightingMaterial.polygonOffsetUnits = -4.0;
            ZFightingMaterial.needsUpdate = true;

            // var ZFightingMaterial = this.vLabScene.getObjectByName("contactror").material;
            // ZFightingMaterial.polygonOffset = true;
            // ZFightingMaterial.polygonOffsetFactor = 1.0;
            // ZFightingMaterial.polygonOffsetUnits = 4.0;
            // ZFightingMaterial.needsUpdate = true;

            this.vLabScene.getObjectByName("wire6Unplugged").visible = false;
            this.vLabScene.getObjectByName("controlBoardOF2WireUnplugged").visible = false;
            this.vLabScene.getObjectByName("wire10Unplugged").visible = false;

            this.serviceLocation = new VLabPositioner({
                context: this,
                active: false,
                pos: new THREE.Vector3(1.0, 1.4, 0.0),
                name: 'serviceLocation',
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                target: new THREE.Vector3(0.0, 0.5, 0.0)
            });

            console.log(this.name + " initialized");
        }).catch(error => {
            console.error(error);
            this.showErrorMessage(error);
        });
    }

    onKeyDown(event) {
        // console.log(event.keyCode);
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

        //VLab Core Items
        this.vLabLocator.addLocation(this);

        this.inventory = new Inventory({
            context: this
        });

        //Detailed views
        this.bryantB225B_reversingValveDetailedView = new DetailedView({
            context: this,
            targetObjectName: "bryantB225B_reversingValve",
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            positionDeltas: new THREE.Vector3(0.05, 0.0, 0.0),
            controls: {
                minDistance: 0.1,
                maxDistance: 0.25,
                minPolarAngle: 0,
                maxPolarAngle: Math.PI * 2
            }
        });

        this.bryantB225B_controlBoardDetailedView = new DetailedView({
            context: this,
            targetObjectName: "controlBoard",
            scale: new THREE.Vector3(0.05, 0.05, 0.05),
            positionDeltas: new THREE.Vector3(0.0, 0.05, 0.01),
            controls: {
                minDistance: 0.05,
                maxDistance: 0.25,
                minPolarAngle: 0,
                maxPolarAngle: Math.PI * 2
            },
            defaultCameraInitialPosition: new THREE.Vector3(0.0, 0.3, 0.2)
        });

        this.bryantB225B_heatPumpCompressorDetailedView = new DetailedView({
            context: this,
            targetObjectName: "bryantB225B_heatPumpCompressor",
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.45),
            controls: {
                minDistance: 0.05,
                maxDistance: 0.75,
                minPolarAngle: 0,
                maxPolarAngle: Math.PI * 2,
                target: new THREE.Vector3(0.0, 0.1, 0.0),
                initialPos: new THREE.Vector3(0.0, 0.35, 0.35)
            },
            defaultCameraInitialPosition: new THREE.Vector3(0.0, 0.15, 0.1)
        });

        //Zoom helpers
        this.frameCapBolt10ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "frameCapBolt10",
            minDistance: 0.35,
            positionDeltas: new THREE.Vector3(-0.01, 0.01, -0.05), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495
        });

        this.bryantB225B_heatPumpCompressorElectricConnectorZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "bryantB225B_heatPumpCompressorElectricConnector",
            minDistance: 0.35,
            positionDeltas: new THREE.Vector3(-0.05, 0.0, 0.05), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495
        });

        this.bryantB225BReversingValveZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "bryantB225B_reversingValve",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(-0.01, 0.0, 0.05), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495
        });

        this.suctionServiceValveZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "suctionServiceValve",
            minDistance: 0.35,
            positionDeltas: new THREE.Vector3(-0.05, 0.0, 0.05), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495
        });

        this.ACDisconnectCaseZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "ACDisconnectCase",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(-0.05, 0.15, 0.0), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495
        });

        this.contactor_ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "contactror",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.1), 
            scale: new THREE.Vector3(0.075, 0.075, 0.075),
            color: 0xfff495
        });

        this.controlBoard_ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "controlBoard",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.05), 
            scale: new THREE.Vector3(0.085, 0.085, 0.085),
            color: 0xfff495
        });

        //VLab Items
        this.BoshScrewdriver = new BoshScrewdriver({
            context: this,
            pos: new THREE.Vector3(0.5, 0.2, 0.0),
            name: "BoshScrewdriver",
            // manipulation: true,
            interactive: true,
            inventory: this.inventory
        });

        this.ClampMeterUEIDL479 = new ClampMeterUEIDL479({
            context: this,
            pos: new THREE.Vector3(1.0, 0.2, 0.0),
            name: "ClampMeterUEIDL479",
            manipulation: false,
            interactive: false,
            inventory: this.inventory
        });

        this.FatMaxScrewdriver = new FatMaxScrewdriver({
            context: this,
            pos: new THREE.Vector3(1.0, 0.2, 0.0),
            name: "FatMaxScrewdriver",
            manipulation: false,
            interactive: false,
            inventory: this.inventory
        });

        this.ReversingValveEF17BZ251 = new ReversingValveEF17BZ251({
            context: this,
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            name: null,
            itemName: "ReversingValveEF17BZ251",
            detailedView: this.bryantB225B_reversingValveDetailedView
        });

        this.ControlBoardCEBD430433 = new ControlBoardCEBD430433({
            context: this,
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            name: null,
            itemName: "ControlBoardCEBD430433",
            detailedView: this.bryantB225B_controlBoardDetailedView
        });

        this.ScrollCompressorZP25K5E = new ScrollCompressorZP25K5E({
            context: this,
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            name: null,
            itemName: "ScrollCompressorZP25K5E",
            detailedView: this.bryantB225B_heatPumpCompressorDetailedView
        });

        new DigitalMultimeterFluke17B({
            context: this,
            inventory: this.inventory,
            interactive: true,
            name: 'digitalMultimeterFluke17B',
            pos: new THREE.Vector3(-0.072, -0.07, -0.11)
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
            inventory: this.inventory,
            interactive: true,
            name: 'trueRMSMultimeterHS36',
            pos: new THREE.Vector3(0.0, 0.0, 0.0)
        }).then((instance) => {
            this.trueRMSMultimeterHS36 = instance;

            this.trueRMSMultimeterHS36.addResponsiveObject({
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

        /* VLab Interactors */
        this.heatPumpFrameCapInteractor = new VLabInteractor({
            context: this,
            name: 'heatPumpFrameCapInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameCap'),
            objectRelPos: new THREE.Vector3(0.35, 0.5, 0.0),
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            icon: 'resources/scene-heat-pump/assets/screwdriver.png',
            iconRotation: THREE.Math.degToRad(0.0),
            action: this.heatPumpFrameCapTakeOutWithScrewdriver
        });

        this.ACDisconnectDoorInteractor = new VLabInteractor({
            context: this,
            name: 'ACDisconnectDoorInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('ACDisconnectDoor'),
            objectRelPos: new THREE.Vector3(0.0, 0.05, -0.15),
            scale: new THREE.Vector3(0.05, 0.05, 0.05),
            action: this.ACDisconnectDoorInteractorHandler
        });

        this.ACDisconnectClampInteractor = new VLabInteractor({
            context: this,
            name: 'ACDisconnectClampInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('ACDisconnectClamp'),
            objectRelPos: new THREE.Vector3(0.0, 0.03, 0.0),
            scale: new THREE.Vector3(0.025, 0.025, 0.025),
            action: this.ACDisconnectClampInteractorHandler,
            iconOpacity: 0.75,
            deactivated: true
        });

        this.ACDisconnectClampReverseInteractor = new VLabInteractor({
            context: this,
            name: 'ACDisconnectClampReverseInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('ACDisconnectClamp'),
            objectRelPos: new THREE.Vector3(0.0, -0.05, 0.0),
            scale: new THREE.Vector3(0.025, 0.025, 0.025),
            icon: 'resources/scene-heat-pump/assets/reverse.png',
            iconRotation: THREE.Math.degToRad(0.0),
            action: this.ACDisconnectClampReverseInteractorHandler,
            deactivated: true
        });

        this.heatPumpFrameCapTakeOutInteractor = new VLabInteractor({
            context: this,
            name: 'heatPumpFrameCapTakeOutInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameCap'),
            objectRelPos: new THREE.Vector3(0.0, 0.0, 0.1),
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            icon: 'resources/scene-heat-pump/assets/take-out.png',
            iconRotation: THREE.Math.degToRad(0.0),
            iconOpacity: 0.75,
            action: this.heatPumpFrameCapTakeOutInteractorHandler,
            deactivated: true
        });

        this.heatPumpFrameServicePanelTakeOutInteractor = new VLabInteractor({
            context: this,
            name: 'heatPumpFrameServicePanelTakeOutInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameServicePanel'),
            objectRelPos: new THREE.Vector3(-0.15, 0.0, 0.2),
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            icon: 'resources/scene-heat-pump/assets/take-out.png',
            iconRotation: THREE.Math.degToRad(0.0),
            iconOpacity: 0.4,
            action: this.heatPumpFrameServicePanelTakeOutInteractorHandler,
            deactivated: true
        });

        // Misc helpers
        // this.heatPumpFrameCap_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        // this.heatPumpFrameCap_manipulationControl.setSize(0.5);
        // this.vLabScene.add(this.heatPumpFrameCap_manipulationControl);
        // this.heatPumpFrameCap_manipulationControl.attach(this.vLabScene.getObjectByName("bryantB225B_heatPumpFrameCap"));

        // this.heatPumpFrameServicePanel_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        // this.heatPumpFrameServicePanel_manipulationControl.setSize(0.5);
        // this.vLabScene.add(this.heatPumpFrameServicePanel_manipulationControl);
        // this.heatPumpFrameServicePanel_manipulationControl.attach(this.vLabScene.getObjectByName("bryantB225B_heatPumpFrameServicePanel"));
    }

    onRedererFrameEvent(event) {

    }

    heatPumpFrameCapTakeOutWithScrewdriver() {
        this.heatPumpFrameCapInteractor.deactivate();
        this.inventory.activate();
        this.inventory.setCurrentItem({ item: this.BoshScrewdriver.model });
        setTimeout(() => {
            this.inventory.takeItem();
            setTimeout(() => {
                this.frameCapBoltUnscrew();
            }, 1000);
        }, 1000)
    }

    ACDisconnectDoorInteractorHandler() {
        if (this.vLabScene.getObjectByName('ACDisconnectDoor').rotation.x != -Math.PI) {
            new TWEEN.Tween(this.vLabScene.getObjectByName('ACDisconnectDoor').rotation)
            .to({ x: -Math.PI }, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.ACDisconnectClampInteractor.activate();
            })
            .start();
        } else {
            this.ACDisconnectClampInteractor.deactivate();
            new TWEEN.Tween(this.vLabScene.getObjectByName('ACDisconnectDoor').rotation)
            .to({ x: -Math.PI / 2 }, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
            })
            .start();
        }
    }

    ACDisconnectClampInteractorHandler() {
        if (this.vLabScene.getObjectByName('ACDisconnectClamp').position.z != -0.5) {
            this.ACDisconnectDoorInteractor.deactivate();
            new TWEEN.Tween(this.vLabScene.getObjectByName('ACDisconnectClamp').position)
            .to({ z: -0.5 }, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.ACDisconnectClampReverseInteractor.activate();
            })
            .start();
        } else {
            this.ACDisconnectClampReverseInteractor.deactivate();
            new TWEEN.Tween(this.vLabScene.getObjectByName('ACDisconnectClamp').position)
            .to({ z: -0.747261 }, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.ACDisconnectDoorInteractor.activate();
            })
            .start();
        }
    }

    ACDisconnectClampReverseInteractorHandler() {
        if(this.vLabScene.getObjectByName('ACDisconnectClamp').rotation.y == 0.0) {
            new TWEEN.Tween(this.vLabScene.getObjectByName('ACDisconnectClamp').rotation)
            .to({ y: Math.PI }, 300)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        } else {
            new TWEEN.Tween(this.vLabScene.getObjectByName('ACDisconnectClamp').rotation)
            .to({ y: 0.0 }, 300)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        }
    }

    heatPumpFrameCapTakeOutInteractorHandler() {
        this.heatPumpFrameCapTakeOutInteractor.deactivate();
        this.bryantB225B_heatPumpFrameCap = this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameCap');

        this.vLabScene.getObjectByName('wire6').visible = false;
        this.vLabScene.getObjectByName('wire10').visible = false;
        this.vLabScene.getObjectByName('controlBoardOF2Wire').visible = false;

        new TWEEN.Tween(this.bryantB225B_heatPumpFrameCap.position)
        .to({ y: 1.25 }, 300)
        .easing(TWEEN.Easing.Linear.None)
        .start()
        .onComplete(() => {
            new TWEEN.Tween(this.bryantB225B_heatPumpFrameCap.position)
            .to({ z: 1.0 }, 300)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.vLabScene.getObjectByName('wire6Unplugged').visible = true;
                this.vLabScene.getObjectByName('controlBoardOF2WireUnplugged').visible = true;
                this.vLabScene.getObjectByName('wire10Unplugged').visible = true;
            })
            .start();
            new TWEEN.Tween(this.bryantB225B_heatPumpFrameCap.rotation)
            .to({ y: THREE.Math.degToRad(-100.0), z: -Math.PI / 2 }, 500)
            .easing(TWEEN.Easing.Linear.None)
            .start()
            .onComplete(() => {
                new TWEEN.Tween(this.bryantB225B_heatPumpFrameCap.position)
                .to({ y: 0.433, x: -0.64 }, 350)
                .easing(TWEEN.Easing.Linear.None)
                .start()
                .onComplete(() => {
                    
                });
            });
        });
    }

    heatPumpFrameServicePanelTakeOutInteractorHandler() {
        this.heatPumpFrameServicePanelTakeOutInteractor.deactivate();
        this.bryantB225B_heatPumpFrameServicePanel = this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameServicePanel');
        new TWEEN.Tween(this.bryantB225B_heatPumpFrameServicePanel.position)
        .to({ x: 0.6 }, 350)
        .easing(TWEEN.Easing.Linear.None)
        .start()
        new TWEEN.Tween(this.bryantB225B_heatPumpFrameServicePanel.rotation)
        .to({ z: -Math.PI * 1.5 }, 350)
        .easing(TWEEN.Easing.Linear.None)
        .start();
        new TWEEN.Tween(this.bryantB225B_heatPumpFrameServicePanel.position)
        .to({ y: 0.005, z: -0.8 }, 350)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    }

    digitalMultimeterFluke17BToControlBoard() {
        console.log('digitalMultimeterFluke17BToControlBoard');
        this.takeOffObject(true);
        this.setInteractiveObjects("digitalMultimeterFluke17B");
        this.digitalMultimeterFluke17B.activate();
    }

    trueRMSMultimeterHS36ToControlBoard() {
        console.log('trueRMSMultimeterHS36ToControlBoard');
        this.takeOffObject(true);
        this.setInteractiveObjects("trueRMSMultimeterHS36");
        this.trueRMSMultimeterHS36.activate({
            pos: new THREE.Vector3(0.233, 0.65, -0.429),
            rot: new THREE.Vector3(0.0, THREE.Math.degToRad(110.0), 0.0)
        });
        this.trueRMSMultimeterHS36.model.getObjectByName('trueRMSMultimeterHS36Clamp').rotation.x = THREE.Math.degToRad(-180.0);
    }

    frameCapBoltUnscrew(argsObj) {
        this.selectedObject = this.BoshScrewdriver.model;
        this.takeOffObject(true);

        var delay = 50;

        this.heatPumpFrameCapInteractor.deactivate();

        var targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt10').position.clone();
        this.BoshScrewdriver.model.position.copy(targetBoltPosition);
        this.BoshScrewdriver.model.position.x = targetBoltPosition.x - 0.015;
        this.BoshScrewdriver.model.position.z = targetBoltPosition.z + 0.038;
        this.BoshScrewdriver.model.rotation.z = Math.PI / 2;
        this.BoshScrewdriver.boschScrewdriverButtonPress();
        setTimeout(() => {
            this.vLabScene.getObjectByName('frameCapBolt10').visible = false;
            this.BoshScrewdriver.boschScrewdriverButtonRelease();
            new TWEEN.Tween(this.BoshScrewdriver.model.position)
            .to({ z: targetBoltPosition.z + 0.1 }, delay / 2)
            .easing(TWEEN.Easing.Linear.None)
            .start();
            setTimeout(() => {
                targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt9').position.clone();
                new TWEEN.Tween(this.BoshScrewdriver.model.position)
                .to({ x: targetBoltPosition.x - 0.015, y: targetBoltPosition.y, z: targetBoltPosition.z + 0.038 }, delay)
                .easing(TWEEN.Easing.Linear.None)
                .start()
                .onComplete(() => {
                    this.BoshScrewdriver.boschScrewdriverButtonPress();
                    setTimeout(() => {
                        this.vLabScene.getObjectByName('frameCapBolt9').visible = false;
                        this.BoshScrewdriver.boschScrewdriverButtonRelease();
                        new TWEEN.Tween(this.BoshScrewdriver.model.position)
                        .to({ x:  targetBoltPosition.x - 0.15, z: targetBoltPosition.z + 0.15 }, delay / 2)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                        setTimeout(() => {
                            targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt8').position.clone();
                            new TWEEN.Tween(this.BoshScrewdriver.model.rotation)
                            .to({ z: Math.PI }, delay)
                            .easing(TWEEN.Easing.Linear.None)
                            .start();
                            new TWEEN.Tween(this.BoshScrewdriver.model.position)
                            .to({ x: targetBoltPosition.x - 0.038, y: targetBoltPosition.y, z: targetBoltPosition.z - 0.015 }, delay)
                            .easing(TWEEN.Easing.Linear.None)
                            .start()
                            .onComplete(() => {
                                this.BoshScrewdriver.boschScrewdriverButtonPress();
                                setTimeout(() => {
                                    this.vLabScene.getObjectByName('frameCapBolt8').visible = false;
                                    this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                    new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                    .to({ x:  targetBoltPosition.x - 0.05 }, delay / 2)
                                    .easing(TWEEN.Easing.Linear.None)
                                    .start();
                                    setTimeout(() => {
                                        targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt7').position.clone();
                                        new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                        .to({ x: targetBoltPosition.x - 0.038, y: targetBoltPosition.y, z: targetBoltPosition.z - 0.015 }, delay)
                                        .easing(TWEEN.Easing.Linear.None)
                                        .start()
                                        .onComplete(() => {
                                            this.BoshScrewdriver.boschScrewdriverButtonPress();
                                            setTimeout(() => {
                                                this.vLabScene.getObjectByName('frameCapBolt7').visible = false;
                                                this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                .to({ x:  targetBoltPosition.x - 0.05 }, delay / 2)
                                                .easing(TWEEN.Easing.Linear.None)
                                                .start();
                                                setTimeout(() => {
                                                    targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt6').position.clone();
                                                    new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                    .to({ x: targetBoltPosition.x - 0.038, y: targetBoltPosition.y, z: targetBoltPosition.z - 0.015 }, delay)
                                                    .easing(TWEEN.Easing.Linear.None)
                                                    .start()
                                                    .onComplete(() => {
                                                        this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                        setTimeout(() => {
                                                            this.vLabScene.getObjectByName('frameCapBolt6').visible = false;
                                                            this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                            new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                            .to({ x:  targetBoltPosition.x - 0.05 }, delay / 2)
                                                            .easing(TWEEN.Easing.Linear.None)
                                                            .start();
                                                            setTimeout(() => {
                                                                targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt5').position.clone();
                                                                new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                .to({ x: targetBoltPosition.x - 0.038, y: targetBoltPosition.y, z: targetBoltPosition.z - 0.015 }, delay)
                                                                .easing(TWEEN.Easing.Linear.None)
                                                                .start()
                                                                .onComplete(() => {
                                                                    this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                    setTimeout(() => {
                                                                        this.vLabScene.getObjectByName('frameCapBolt5').visible = false;
                                                                        this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                        new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                        .to({ z:  targetBoltPosition.z - 0.15,  x:  targetBoltPosition.x - 0.1}, delay / 2)
                                                                        .easing(TWEEN.Easing.Linear.None)
                                                                        .start();
                                                                        setTimeout(() => {
                                                                            targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt4').position.clone();
                                                                            new TWEEN.Tween(this.BoshScrewdriver.model.rotation)
                                                                            .to({ z: Math.PI * 1.5 }, delay)
                                                                            .easing(TWEEN.Easing.Linear.None)
                                                                            .start();
                                                                            new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                            .to({ x: targetBoltPosition.x + 0.015, y: targetBoltPosition.y, z: targetBoltPosition.z - 0.04 }, delay)
                                                                            .easing(TWEEN.Easing.Linear.None)
                                                                            .start()
                                                                            .onComplete(() => {
                                                                                this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                setTimeout(() => {
                                                                                    this.vLabScene.getObjectByName('frameCapBolt4').visible = false;
                                                                                    this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                    new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                    .to({ z:  targetBoltPosition.z - 0.15}, delay / 2)
                                                                                    .easing(TWEEN.Easing.Linear.None)
                                                                                    .start();
                                                                                    setTimeout(() => {
                                                                                        targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt3').position.clone();
                                                                                        new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                        .to({ x: targetBoltPosition.x + 0.015, y: targetBoltPosition.y, z: targetBoltPosition.z - 0.04 }, delay)
                                                                                        .easing(TWEEN.Easing.Linear.None)
                                                                                        .start()
                                                                                        .onComplete(() => {
                                                                                            this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                            setTimeout(() => {
                                                                                                this.vLabScene.getObjectByName('frameCapBolt3').visible = false;
                                                                                                this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                .to({ z:  targetBoltPosition.z - 0.15}, delay / 2)
                                                                                                .easing(TWEEN.Easing.Linear.None)
                                                                                                .start();
                                                                                                setTimeout(() => {
                                                                                                    targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt2').position.clone();
                                                                                                    new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                    .to({ x: targetBoltPosition.x + 0.015, y: targetBoltPosition.y, z: targetBoltPosition.z - 0.04 }, delay)
                                                                                                    .easing(TWEEN.Easing.Linear.None)
                                                                                                    .start()
                                                                                                    .onComplete(() => {
                                                                                                        this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                                        setTimeout(() => {
                                                                                                            this.vLabScene.getObjectByName('frameCapBolt2').visible = false;
                                                                                                            this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                            new TWEEN.Tween(this.BoshScrewdriver.model.rotation)
                                                                                                            .to({ z: Math.PI * 2.0 }, delay)
                                                                                                            .easing(TWEEN.Easing.Linear.None)
                                                                                                            .start();
                                                                                                            new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                            .to({ z:  targetBoltPosition.z - 0.15, x:  targetBoltPosition.x + 0.3}, delay / 2)
                                                                                                            .easing(TWEEN.Easing.Linear.None)
                                                                                                            .start();
                                                                                                            setTimeout(() => {
                                                                                                                targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt1').position.clone();
                                                                                                                new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                .to({ x: targetBoltPosition.x + 0.04, y: targetBoltPosition.y, z: targetBoltPosition.z + 0.015 }, delay)
                                                                                                                .easing(TWEEN.Easing.Linear.None)
                                                                                                                .start()
                                                                                                                .onComplete(() => {
                                                                                                                    this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                                                    setTimeout(() => {
                                                                                                                        this.vLabScene.getObjectByName('frameCapBolt1').visible = false;
                                                                                                                        this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                                        new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                        .to({ x:  targetBoltPosition.x + 0.15}, delay / 2)
                                                                                                                        .easing(TWEEN.Easing.Linear.None)
                                                                                                                        .start();
                                                                                                                        setTimeout(() => {
                                                                                                                            targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt15').position.clone();
                                                                                                                            new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                            .to({ x: targetBoltPosition.x + 0.04, y: targetBoltPosition.y, z: targetBoltPosition.z + 0.015 }, delay)
                                                                                                                            .easing(TWEEN.Easing.Linear.None)
                                                                                                                            .start()
                                                                                                                            .onComplete(() => {
                                                                                                                                this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                                                                setTimeout(() => {
                                                                                                                                    this.vLabScene.getObjectByName('frameCapBolt15').visible = false;
                                                                                                                                    this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                                                    new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                    .to({ x:  targetBoltPosition.x + 0.15}, delay / 2)
                                                                                                                                    .easing(TWEEN.Easing.Linear.None)
                                                                                                                                    .start();
                                                                                                                                    setTimeout(() => {
                                                                                                                                        targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt14').position.clone();
                                                                                                                                        new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                        .to({ x: targetBoltPosition.x + 0.04, y: targetBoltPosition.y, z: targetBoltPosition.z + 0.015 }, delay)
                                                                                                                                        .easing(TWEEN.Easing.Linear.None)
                                                                                                                                        .start()
                                                                                                                                        .onComplete(() => {
                                                                                                                                            this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                                                                            setTimeout(() => {
                                                                                                                                                this.vLabScene.getObjectByName('frameCapBolt14').visible = false;
                                                                                                                                                this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                                                                new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                                .to({ x:  targetBoltPosition.x + 0.15}, delay / 2)
                                                                                                                                                .easing(TWEEN.Easing.Linear.None)
                                                                                                                                                .start();
                                                                                                                                                setTimeout(() => {
                                                                                                                                                    targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt13').position.clone();
                                                                                                                                                    new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                                    .to({ x: targetBoltPosition.x + 0.04, y: targetBoltPosition.y, z: targetBoltPosition.z + 0.015 }, delay)
                                                                                                                                                    .easing(TWEEN.Easing.Linear.None)
                                                                                                                                                    .start()
                                                                                                                                                    .onComplete(() => {
                                                                                                                                                        this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                                                                                        setTimeout(() => {
                                                                                                                                                            this.vLabScene.getObjectByName('frameCapBolt13').visible = false;
                                                                                                                                                            this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                                                                            new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                                            .to({ x:  targetBoltPosition.x + 0.15}, delay / 2)
                                                                                                                                                            .easing(TWEEN.Easing.Linear.None)
                                                                                                                                                            .start();
                                                                                                                                                            setTimeout(() => {
                                                                                                                                                                targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt12').position.clone();
                                                                                                                                                                new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                                                .to({ x: targetBoltPosition.x + 0.04, y: targetBoltPosition.y, z: targetBoltPosition.z + 0.015 }, delay)
                                                                                                                                                                .easing(TWEEN.Easing.Linear.None)
                                                                                                                                                                .start()
                                                                                                                                                                .onComplete(() => {
                                                                                                                                                                    this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                                                                                                    setTimeout(() => {
                                                                                                                                                                        this.vLabScene.getObjectByName('frameCapBolt12').visible = false;
                                                                                                                                                                        this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                                                                                        new TWEEN.Tween(this.BoshScrewdriver.model.rotation)
                                                                                                                                                                        .to({ z: Math.PI * 2.5 }, delay)
                                                                                                                                                                        .easing(TWEEN.Easing.Linear.None)
                                                                                                                                                                        .start();
                                                                                                                                                                        new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                                                        .to({ x:  targetBoltPosition.x + 0.2, z:  targetBoltPosition.z + 0.2 }, delay / 2)
                                                                                                                                                                        .easing(TWEEN.Easing.Linear.None)
                                                                                                                                                                        .start();
                                                                                                                                                                        setTimeout(() => {
                                                                                                                                                                            targetBoltPosition = this.vLabScene.getObjectByName('frameCapBolt11').position.clone();
                                                                                                                                                                            new TWEEN.Tween(this.BoshScrewdriver.model.position)
                                                                                                                                                                            .to({ x: targetBoltPosition.x - 0.015, y: targetBoltPosition.y, z: targetBoltPosition.z + 0.038 }, delay)
                                                                                                                                                                            .easing(TWEEN.Easing.Linear.None)
                                                                                                                                                                            .start()
                                                                                                                                                                            .onComplete(() => {
                                                                                                                                                                                this.BoshScrewdriver.boschScrewdriverButtonPress();
                                                                                                                                                                                setTimeout(() => {
                                                                                                                                                                                    this.vLabScene.getObjectByName('frameCapBolt11').visible = false;
                                                                                                                                                                                    this.BoshScrewdriver.boschScrewdriverButtonRelease();
                                                                                                                                                                                    setTimeout(() => {
                                                                                                                                                                                        this.selectedObject = this.BoshScrewdriver.model;
                                                                                                                                                                                        this.takeObjectToInventory();
                                                                                                                                                                                        this.heatPumpFrameCapTakeOutInteractor.activate();
                                                                                                                                                                                        this.heatPumpFrameServicePanelTakeOutInteractor.activate();
                                                                                                                                                                                    }, delay * 2);
                                                                                                                                                                                }, delay);
                                                                                                                                                                            });
                                                                                                                                                                        }, delay);
                                                                                                                                                                    }, delay);
                                                                                                                                                                });
                                                                                                                                                            }, delay);
                                                                                                                                                        }, delay);
                                                                                                                                                    });
                                                                                                                                                }, delay);
                                                                                                                                            }, delay);
                                                                                                                                        });
                                                                                                                                    }, delay);
                                                                                                                                }, delay);
                                                                                                                            });
                                                                                                                        }, delay);
                                                                                                                    }, delay);
                                                                                                                });
                                                                                                            }, delay);
                                                                                                        }, delay);
                                                                                                    });
                                                                                                }, delay);
                                                                                            }, delay);
                                                                                        });
                                                                                    }, delay);
                                                                                }, delay);
                                                                            });
                                                                        }, delay);
                                                                    }, delay);
                                                                });
                                                            }, delay);
                                                        }, delay);
                                                    });
                                                }, delay);
                                            }, delay);
                                        });
                                    }, delay);
                                }, delay);
                            });
                        }, delay);
                    }, delay);
                });
            }, delay);
        }, delay);
    }
}