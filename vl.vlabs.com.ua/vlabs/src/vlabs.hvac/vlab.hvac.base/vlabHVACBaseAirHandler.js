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
import CarrierTPWEM01              from '../../vlabs.items/hvac/carrierTPWEM01';
import FlowAlongTube               from '../../vlabs.items/flow-along-tube';
import DirectionalFlow             from '../../vlabs.items/directional-flow';

export default class VlabHVACBaseAirHandler extends VLab {
    constructor(initObj = {}) {
        super(initObj);

        this.constructed = true;

        addEventListener(this.name + "SceneCompleteEvent", this.onSceneCompleteEvent.bind(this), false);
        addEventListener(this.name + "ActivatedEvent", this.onActivatedEvent.bind(this), false);
        addEventListener(this.name + "RedererFrameEvent",  this.onRedererFrameEvent.bind(this), false);

        document.addEventListener("keydown", this.onKeyDown.bind(this), false);

        super.preInitialize().then(() => {
            super.initialize().then((success) => {
                if (success) {
                    var textureLoader = new THREE.TextureLoader();

                    Promise.all([
                        textureLoader.load('../vlabs.assets/envmaps/metal.jpg'),
                        textureLoader.load('../vlabs.assets/effectmaps/lampHalo.png'),
                        textureLoader.load('./resources/scene-air-handler/textures/airHandlerCabinetBottomPanelAlphaMap.png'),
                        textureLoader.load('./resources/scene-air-handler/textures/ductAlphaMap.png'),
                        textureLoader.load('./resources/scene-air-handler/textures/ductBoxAlphaMap.png'),
                        textureLoader.load('./resources/scene-air-handler/textures/ceelingAirVentAirFlowHeat.png'),
                    ])
                    .then((result) => {
                        this.envMapMetal = result[0];
                        this.lampHalo = result[1];
                        this.airHandlerCabinetBottomPanelAlphaMap = result[2];
                        this.ductAlphaMap = result[3];
                        this.ductBoxAlphaMap = result[4];
                        this.ventAirFlowHeat = result[5];

                        this.initialize(initObj);
                    })
                    .catch(error => {
                        console.error(error);
                    });
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

            var light0 = new THREE.AmbientLight(0xffffff, 0.3);
            this.vLabScene.add(light0);

            var light1 = new THREE.PointLight(0xffffff, 0.85);
            light1.position.set(-2.25, 2.8, 1.0);
            this.vLabScene.add(light1);

            // this.light1_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
            // this.light1_manipulationControl.setSize(0.5);
            // this.vLabScene.add(this.light1_manipulationControl);
            // this.light1_manipulationControl.attach(light1);
            // this.light1_manipulationControl.addEventListener('change', function(){
            //     console.log(light1.position);
            // })

            var defaultPos = this.defaultCameraControls.object.position.clone();
            var defulatTarget = this.defaultCameraControls.target.clone();
            this.initialPosition = new VLabPositioner({
                context: this,
                active: true,
                initial: true,
                pos: defaultPos,
                name: 'initialPosition',
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                target: defulatTarget
            });

            this.positionInFrontOfTheNish = new VLabPositioner({
                context: this,
                active: false,
                pos: new THREE.Vector3(-1.25, 1.75, 0.0),
                name: 'positionInFrontOfTheNish',
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                target: new THREE.Vector3(-1.0, 1.72, 0.0)
            });

            var carrierTPWEM01WallMountPos = this.vLabScene.getObjectByName('carrierTPWEM01WallMount').position.clone();
            carrierTPWEM01WallMountPos.z += 1.0
            var carrierTPWEM01WallMountTarget = this.vLabScene.getObjectByName('carrierTPWEM01WallMount').position.clone();
            carrierTPWEM01WallMountTarget.z += 0.25;
            this.carrierTPWEM01WallPosition = new VLabPositioner({
                context: this,
                active: false,
                pos: carrierTPWEM01WallMountPos,
                name: 'carrierTPWEM01WallPosition',
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                target: carrierTPWEM01WallMountTarget
            });

            /* VLab Interactors */
            this.nishDoorHandleInteractor = new VLabInteractor({
                context: this,
                name: 'nishDoorHandleInteractor',
                pos: new THREE.Vector3(0.0, 0.0, 0.0),
                object: this.vLabScene.getObjectByName('nishDoorHandle'),
                objectRelPos: new THREE.Vector3(0.05, 0.01, -0.02),
                scale: new THREE.Vector3(0.15, 0.15, 0.15),
                // depthTest: false,
                action: this.nishDoorOpenOrClose
            });

            // this.carrierTPWEM01InfoInteractor = new VLabInteractor({
            //     context: this,
            //     name: 'carrierTPWEM01InfoInteractor',
            //     icon: '../vlabs.assets/img/info.png',
            //     pos: new THREE.Vector3(0.0, 0.0, 0.0),
            //     object: this.vLabScene.getObjectByName('carrierTPWEM01WallMount'),
            //     objectRelPos: new THREE.Vector3(0.0, 0.03, 0.085),
            //     scale: new THREE.Vector3(0.025, 0.025, 0.025),
            //     // depthTest: false,
            //     action: this.carrierTPWEM01InfoInteractorCallback,
            //     visible: false
            // });


this.airHandlerCabinetPanelsLookThrough();
this.airHandlerDuctLookThrough();

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
        var cameraControlConfig = Object.assign({
            forced: true, 
            initialZoom: 1.0,
            minDistance: 0.25,
            maxDistance: 1.0
        }, this.nature.cameraControls);
        super.switchCameraControls(cameraControlConfig);
    }

    onActivatedEvent() {

        this.showOverlayMessage('<div style="position: absolute; top: 30%; left: calc(50% - 50px); width: 100px; text-align: center; color: white; font-size: 18px; padding: 20px; border-radius: 10px; box-shadow: 1px 1px 10px #cffdff80;">Initializing...</div>');

        //VLab Core Items
        this.vLabLocator.addLocation(this);

        //Zoom helpers
        this.carrierTPWEM01WallMountZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: 'carrierTPWEM01WallMount',
            targetObjectIsAnOrbitTarget: true,
            orbitTargetPositionDeltas: new THREE.Vector3(0.0, 0.0, 0.1),
            minDistance: 0.02,
            maxDistance: 0.15,
            minAzimuthAngle: -1.0,
            maxAzimuthAngle: 1.0,
            positionDeltas: new THREE.Vector3(0.0, 0.1, 0.1), 
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            color: 0xfff495,
            opacity: 0.5,
            zoomCompleteCallback: this.carrierTPWEM01WallMountZoomHelperCallBack
        });

        //VLab Items
        this.carrierTPWEM01 = new CarrierTPWEM01({
            context: this,
            pos: this.vLabScene.getObjectByName('carrierTPWEM01WallMount').position,
            rot: this.vLabScene.getObjectByName('carrierTPWEM01WallMount').rotation,
            name: 'carrierTPWEM01',
            initialScreen: 'baseScreen'
        });

        /* Lamp setup */
        this.vLabScene.getObjectByName('lamp').material.envMap = this.envMapMetal;
        this.vLabScene.getObjectByName('lamp').material.combine = THREE.MixOperation;
        this.vLabScene.getObjectByName('lamp').material.reflectivity = 0.2;
        this.vLabScene.getObjectByName('lamp').material.needsUpdate = true;

        this.lampHaloSpriteMaterial = new THREE.SpriteMaterial({
            map: this.lampHalo,
            transparent: true,
            opacity: 0.85,
            rotation: 0.0,
            depthTest: false,
            depthWrite: false
        });
        this.lampHaloSprite1 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.lampHaloSprite1.position.copy(new THREE.Vector3(-2.25, 2.785, 1.3));
        this.vLabScene.add(this.lampHaloSprite1);
        this.lampHaloSprite2 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.lampHaloSprite2.position.copy(new THREE.Vector3(-2.25, 2.785, 0.7));
        this.vLabScene.add(this.lampHaloSprite2);
        this.lampHaloSprite3 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.lampHaloSprite3.position.copy(new THREE.Vector3(-1.95, 2.785, 1.0));
        this.vLabScene.add(this.lampHaloSprite3);
        this.lampHaloSprite4 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.lampHaloSprite4.position.copy(new THREE.Vector3(-2.55, 2.785, 1.0));
        this.vLabScene.add(this.lampHaloSprite4);


        // Misc helpers
        this.airHandlerCabinetUpperPanel_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        this.airHandlerCabinetUpperPanel_manipulationControl.setSize(0.5);
        this.vLabScene.add(this.airHandlerCabinetUpperPanel_manipulationControl);
        this.airHandlerCabinetUpperPanel_manipulationControl.attach(this.vLabScene.getObjectByName("airHandlerCabinetUpperPanel"));
        setTimeout(()=>{ this.airHandlerCabinetUpperPanel_manipulationControl.update(); }, 500);

        this.airHandlerCabinetBottomPanel_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        this.airHandlerCabinetBottomPanel_manipulationControl.setSize(0.5);
        this.vLabScene.add(this.airHandlerCabinetBottomPanel_manipulationControl);
        this.airHandlerCabinetBottomPanel_manipulationControl.attach(this.vLabScene.getObjectByName("airHandlerCabinetBottomPanel"));
        setTimeout(()=>{ this.airHandlerCabinetBottomPanel_manipulationControl.update(); }, 500);


        //Zoom helpers
        this.evaporatorACoilZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "evaporatorACoil",
            minDistance: 0.35,
            positionDeltas: new THREE.Vector3(0.2, 0.15, 0.2), 
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            color: 0xfff495
        });

        this.carrier332368TXVZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "carrier332368TXV",
            minDistance: 0.1,
            positionDeltas: new THREE.Vector3(0.0, 0.05, -0.05), 
            scale: new THREE.Vector3(0.05, 0.05, 0.05),
            color: 0xfff495,
            opacity: 0.85
        });

        this.volatageTransformerHT01CN236ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "volatageTransformerHT01CN236",
            minDistance: 0.1,
            positionDeltas: new THREE.Vector3(0.07, -0.05, 0.0), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495,
            opacity: 0.85
        });

        this.controlBoardHK61EA005ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "controlBoardHK61EA005",
            minDistance: 0.05,
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.0), 
            scale: new THREE.Vector3(0.05, 0.05, 0.05),
            color: 0xfff495,
            opacity: 0.65
        });

        this.fanCoilElectricHeaterKFCEH0901N10InstallationPlateZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "fanCoilElectricHeaterKFCEH0901N10InstallationPlate",
            minDistance: 0.05,
            positionDeltas: new THREE.Vector3(0.0, 0.01, 0.0),
            scale: new THREE.Vector3(0.05, 0.05, 0.05),
            color: 0xfff495,
            opacity: 0.65
        });

        this.blowerWheelHousingZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "blowerWheelHousing",
            minDistance: 0.1,
            positionDeltas: new THREE.Vector3(0.2, 0.0, 0.0),
            scale: new THREE.Vector3(0.085, 0.085, 0.085),
            color: 0xfff495,
            opacity: 0.65
        });

        ////// Ambient Air Flow
        this.airFlow = this.vLabScene.getObjectByName('airFlow');
        this.airFlow.material.opacity = 0.75;
        // this.airFlow.material.color = new THREE.Color(2.5, 1.0, 2.5);
        this.airFlow.material.alphaTest = 0.1;
        this.airFlow.material.needsUpdate = true;
        this.airFlowThrottling = 0;
        this.airFlow.visible = false;
this.airFlow.visible = true;


        ////// Ceeling Air Vent Flow
        this.ceelingAirVentFlow = this.vLabScene.getObjectByName('ceelingAirVentAirFlow');
        this.ceelingAirVentFlow.material.opacity = 0.5;
        // this.airFlow.material.color = new THREE.Color(2.5, 1.0, 2.5);
// this.ceelingAirVentFlow.material.map = this.ventAirFlowHeat;
        this.ceelingAirVentFlow.material.alphaTest = 0.1;
        this.ceelingAirVentFlow.material.needsUpdate = true;
        this.ceelingAirVentFlowThrottling = 0;
        this.ceelingAirVentFlow.visible = false;
this.ceelingAirVentFlow.visible = true;

        this.initializeActions();
    }

    onRedererFrameEvent(event) {
        if (this.airFlow.visible) {
            if (this.airFlowThrottling > 2)
            {
                this.airFlowThrottling = 0;
                this.airFlow.material.map.offset.y -= 0.038;
                if (this.airFlow.material.map.offset.y < -0.494) {
                    this.airFlow.material.map.offset.y = -0.038;
                }
                this.airFlow.material.needsUpdate = true;
            }
            this.airFlowThrottling++;
        }
        if (this.ceelingAirVentFlow.visible) {
            if (this.ceelingAirVentFlowThrottling > 6)
            {
                this.ceelingAirVentFlowThrottling = 0;
                this.ceelingAirVentFlow.material.map.offset.y -= 0.038;
                if (this.ceelingAirVentFlow.material.map.offset.y < -0.494) {
                    this.ceelingAirVentFlow.material.map.offset.y = -0.038;
                }
                this.ceelingAirVentFlow.material.needsUpdate = true;
            }
            this.ceelingAirVentFlowThrottling++;
        }
    }

    /* VlabHVACBaseAirHandler Actions */
    initializeActions() {
        this.nishDoorClosed = true;

        // //R on controlBoardHK61EA005
        // this.controlBoardHK61EA005RWire = new FlowAlongTube({
        //     context: this,
        //     tube: this.vLabScene.getObjectByName('controlBoardHK61EA005RWire'),
        //     color: 0xff0000,
        //     scale: new THREE.Vector3(0.025, 0.025, 0.025),
        //     cSectionVertices: 4,
        //     speed: 2.0,
        //     reversed: false,
        // });
        // //R on carrierTPWEM01ToAirHandlerCable
        // this.carrierTPWEM01ToAirHandlerCable = new FlowAlongTube({
        //     context: this,
        //     tube: this.vLabScene.getObjectByName('carrierTPWEM01ToAirHandlerCable'),
        //     color: 0xff0000,
        //     scale: new THREE.Vector3(0.025, 0.025, 0.025),
        //     cSectionVertices: 4,
        //     speed: 1.0,
        //     reversed: false,
        //     spritesNum: 20
        // });

        // setTimeout(() => {
        //     this.carrierTPWEM01ToAirHandlerCable.chainTo = this.controlBoardHK61EA005RWire;
        //     this.controlBoardHK61EA005RWire.chainTo = this.carrierTPWEM01ToAirHandlerCable;
        //     this.carrierTPWEM01ToAirHandlerCable.start();
        // }, 1000);


        this.ctrlVFromThermostatToAirHandler = new DirectionalFlow({
            context: this,
            name: 'directionalFlow',
            tubes: [
                {
                    tube: this.vLabScene.getObjectByName('carrierTPWEM01ToAirHandlerCable'),
                    cSectionVertices: 4,
                    reversed: false
                },
            ],
            color: 0x00ff00,
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            animationDelay: 400,
            tooltip: 'Control voltage to Air Handler Control Board'
        });

        this.ctrlVoltageFromAirHandlerToHeatPump = new DirectionalFlow({
            context: this,
            name: 'directionalFlow',
            tubes: [
                {
                    tube: this.vLabScene.getObjectByName('HeatPumpToAirHandlerCable'),
                    cSectionVertices: 4,
                    reversed: false
                },
            ],
            color: 0x00ff00,
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            animationDelay: 250,
            tooltip: 'Control voltage to Heat Pump Control Board'
        });

        this.power110VFromQuickDisconnect = new DirectionalFlow({
            context: this,
            name: 'directionalFlow',
            tubes: [
                {
                    tube: this.vLabScene.getObjectByName('quickDisconnectPowerLine'),
                    cSectionVertices: 4,
                    reversed: true
                },
            ],
            color: 0xff0000,
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            animationDelay: 150,
            tooltip: '<span style="color: red; font-size: 24px;">⚡</span> ~110V Power'
        });
        // setTimeout(() => {
        //     this.ctrlVoltageFromAirHandlerToHeatPump.start();
        // }, 100);
    }

    nishDoorOpenOrClose(caller) {
        caller.vLabInteractor.deactivate();
        new TWEEN.Tween(this.vLabScene.getObjectByName('nishDoor').rotation)
        .to({ z: (this.nishDoorClosed) ? (-Math.PI - Math.PI / 2) : -Math.PI }, 500)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(() => {
            caller.vLabInteractor.activate();
            this.nishDoorClosed = !this.nishDoorClosed;

            if (!this.nishDoorClosed) {
                //Normal mode demo
                if (this.vLabLocator.context.tablet.currentActiveTabId == 0) {
                    //Approach the thermostat completed
                    if (this.vLabLocator.context.tablet.initObj.content.tabs[0].items[2].completed === false) {
                        if (this.vLabLocator.context.tablet.initObj.content.tabs[0].items[0].completed && this.vLabLocator.context.tablet.initObj.content.tabs[0].items[1].completed) {
                            this.ctrlVoltageFromAirHandlerToHeatPump.start();
                            this.ctrlVFromThermostatToAirHandler.start();
                            this.power110VFromQuickDisconnect.start();
                            var self = this;
                            this.contolVoltagesAcknowledgmentStepTimeout = setTimeout(()=>{
                                self.vLabLocator.context.tablet.initObj.content.tabs[0].items[2].completed = true;
                                self.vLabLocator.context.tablet.stepCompletedAnimation();
                                self.playSound('resources/assistant/snd/step3.mp3');
                                self.contolVoltagesAcknowledgmentStepTimeout = undefined;
                            }, 6000);
                        }
                    }
                }
            } else {
                if (this.contolVoltagesAcknowledgmentStepTimeout !== undefined) {
                    clearTimeout(this.contolVoltagesAcknowledgmentStepTimeout);
                }
                this.ctrlVoltageFromAirHandlerToHeatPump.stop();
                this.ctrlVFromThermostatToAirHandler.stop();
                this.power110VFromQuickDisconnect.stop();
            }

        })
        .start();
    }

    carrierTPWEM01WallMountZoomHelperCallBack() {
        // this.carrierTPWEM01InfoInteractor.activate();

        //Normal mode demo
        if (this.vLabLocator.context.tablet.currentActiveTabId == 0) {
            //Approach the thermostat completed
            if (this.vLabLocator.context.tablet.initObj.content.tabs[0].items[0].completed === false) {
                this.vLabLocator.context.tablet.initObj.content.tabs[0].items[0].completed = true;
                this.vLabLocator.context.tablet.stepCompletedAnimation();
                this.playSound('resources/assistant/snd/step1.mp3');
                this.checkThermostatIsSetToCool();
            }
        }
    }

    // carrierTPWEM01InfoInteractorCallback() {
    //     console.log('carrierTPWEM01InfoInteractorCallback');
    // }

    playSound(snd) {
        let audio = new Audio(snd);
        audio.play();
    }

    checkThermostatIsSetToCool() {
        var roomTemperature = this.carrierTPWEM01.getTemperature({
            tempId: 'roomTemperature',
            format: 'F'
        });
        var coolToTemperature = this.carrierTPWEM01.getTemperature({
            tempId: 'coolToTemperature',
            format: 'F'
        })
        if (Math.round(roomTemperature - coolToTemperature) == 4 && this.carrierTPWEM01.curState['mainMode'] == 'Cool') {
            if (this.vLabLocator.context.tablet.initObj.content.tabs[0].items[1].completed === false) {
                this.vLabLocator.context.tablet.initObj.content.tabs[0].items[1].completed = true;
                this.vLabLocator.context.tablet.stepCompletedAnimation();
                this.playSound('resources/assistant/snd/step2.mp3');
            }
        } else {
            setTimeout(this.checkThermostatIsSetToCool.bind(this), 2000);
        }
    }

    airHandlerCabinetPanelsLookThrough() {
        var airHandlerCabinetBottomPanel = this.vLabScene.getObjectByName("airHandlerCabinetBottomPanel");
        airHandlerCabinetBottomPanel.material.alphaMap = this.airHandlerCabinetBottomPanelAlphaMap;
        airHandlerCabinetBottomPanel.material.transparent = true;
    }
    airHandlerDuctLookThrough() {
        var airHandlerDuct = this.vLabScene.getObjectByName("duct");
        airHandlerDuct.material.alphaMap = this.ductAlphaMap;
        airHandlerDuct.material.transparent = true;

        var airHandlerDuctBox = this.vLabScene.getObjectByName("ductBox");
        airHandlerDuctBox.material.alphaMap = this.ductBoxAlphaMap;
        airHandlerDuctBox.material.transparent = true;
    }
}