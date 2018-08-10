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
                        textureLoader.load('./resources/scene-air-handler/textures/blowerWheelHousingAlphaMap.jpg'),
                    ])
                    .then((result) => {
                        this.envMapMetal = result[0];
                        this.lampHalo = result[1];
                        this.airHandlerCabinetBottomPanelAlphaMap = result[2];
                        this.ductAlphaMap = result[3];
                        this.ductBoxAlphaMap = result[4];
                        this.ventAirFlowHeat = result[5];
                        this.blowerWheelHousingAlphaMap = result[6];

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

        //VLab events subscribers
        this.webGLContainerEventsSubcribers.stopandhide["HVACBaseAirHandlerLocationvLabStopAndHide"] = 
        {
            callback: this.onVLabStopAndHide,
            instance: this
        };
        this.webGLContainerEventsSubcribers.resumeandshow["HVACBaseAirHandlerLocationvLabResumeAndShow"] = 
        {
            callback: this.onVLabResumeAndShow,
            instance: this
        };

        this.loadScene().then((vLabScene) => {
            this.setVLabScene(vLabScene);

            if (this.vLabLocator.initObj.locationInitialized) {
                this.vLabLocator.initObj.locationInitialized.call(this.vLabLocator.context, { location: this.name });
            }

            this.light0 = new THREE.AmbientLight(0xffffff, 0.3);
            this.vLabScene.add(this.light0);

            this.light1 = new THREE.PointLight(0xffffff, 0.85);
            this.light1.position.set(-2.25, 2.8, 1.0);
            this.vLabScene.add(this.light1);

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
                target: defulatTarget,
                completeCallBack: this.initialPositionCompleted
            });

            this.positionInFrontOfTheNish = new VLabPositioner({
                context: this,
                active: false,
                pos: new THREE.Vector3(-1.25, 1.75, 0.0),
                name: 'positionInFrontOfTheNish',
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                target: new THREE.Vector3(-1.0, 1.72, 0.0),
                completeCallBack: this.positionInFrontOfTheNishCompleted
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
                target: carrierTPWEM01WallMountTarget,
                completeCallBack: this.carrierTPWEM01WallPositionCompleted
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

            this.toggleAirHandlerCabinetPanelsLookThrough();
            this.toggleAirHandlerDuctLookThrough();

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

        var self = this;

        this.airBlowerStarted = false;
        this.blowerWheelLA22LA034 = this.vLabScene.getObjectByName('blowerWheelLA22LA034');

        this.showOverlayMessage('<div style="position: absolute; top: 30%; left: calc(50% - 50px); width: 100px; text-align: center; color: white; font-size: 18px; padding: 20px; border-radius: 10px; box-shadow: 1px 1px 10px #cffdff80;">Initializing...</div>');

        //VLab Core Items
        this.vLabLocator.addLocation(this);

        // Sounds
        this.airBlowerSoundOnReady = false;
        this.airBlowerSoundOn = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-air-handler/sounds/airBlowerSoundOn.mp3', function(buffer) {
            self.airBlowerSoundOn.setBuffer(buffer);
            self.airBlowerSoundOn.setVolume(0.2);
            self.airBlowerSoundOnReady = true;
        });
        this.airBlowerSoundReady = false;
        this.airBlowerSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-air-handler/sounds/airBlowerSound.mp3', function(buffer) {
            self.airBlowerSound.setBuffer(buffer);
            self.airBlowerSound.setVolume(0.2);
            self.airBlowerSound.setLoop(true);
            self.airBlowerSoundReady = true;
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
        // this.airHandlerCabinetUpperPanel_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        // this.airHandlerCabinetUpperPanel_manipulationControl.setSize(0.5);
        // this.vLabScene.add(this.airHandlerCabinetUpperPanel_manipulationControl);
        // this.airHandlerCabinetUpperPanel_manipulationControl.attach(this.vLabScene.getObjectByName("airHandlerCabinetUpperPanel"));
        // setTimeout(()=>{ this.airHandlerCabinetUpperPanel_manipulationControl.update(); }, 500);

        // this.airHandlerCabinetBottomPanel_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        // this.airHandlerCabinetBottomPanel_manipulationControl.setSize(0.5);
        // this.vLabScene.add(this.airHandlerCabinetBottomPanel_manipulationControl);
        // this.airHandlerCabinetBottomPanel_manipulationControl.attach(this.vLabScene.getObjectByName("airHandlerCabinetBottomPanel"));
        // setTimeout(()=>{ this.airHandlerCabinetBottomPanel_manipulationControl.update(); }, 500);


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

        this.airHandlerStandZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "airHandlerStand",
            minDistance: 0.35,
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.15), 
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            color: 0xfff495,
            maxPolarAngle: Math.PI * 2
        });

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
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495,
            opacity: 0.65,
            zoomCompleteCallback: this.blowerWheelHousingLookThrough
        });

        ////// Ambient Air Flow
        this.airHandlerAirFlow = this.vLabScene.getObjectByName('airFlow');
        this.airHandlerAirFlow.material.opacity = 0.75;
        this.airHandlerAirFlow.material.alphaTest = 0.1;
        this.airHandlerAirFlow.material.needsUpdate = true;
        this.airHandlerAirFlowThrottling = 0;
        this.airHandlerAirFlow.visible = false;
        this.toggleAirHandlerAirFlow();


        ////// Ceeling Air Vent Flow
        this.ceelingAirVentFlow = this.vLabScene.getObjectByName('ceelingAirVentAirFlow');
        this.ceelingAirVentFlow.material.opacity = 0.25;
// this.ceelingAirVentFlow.material.map = this.ventAirFlowHeat;
        this.ceelingAirVentFlow.material.alphaTest = 0.1;
        this.ceelingAirVentFlow.material.needsUpdate = true;
        this.ceelingAirVentFlowThrottling = 0;
        this.ceelingAirVentFlow.visible = false;
        this.toggleCeilingVentGridsAirFlow();


        this.blowerWheelHousingLookThroughInteractor = new VLabInteractor({
            context: this,
            name: 'blowerWheelHousingLookThroughInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('blowerWheelHousing'),
            objectRelPos: new THREE.Vector3(0.2, 0.0, 0.075),
            scale: new THREE.Vector3(0.03, 0.03, 0.03),
            // depthTest: false,
            icon: '../vlabs.assets/img/look-through.png',
            action: this.blowerWheelHousingLookThroughInteractorHandler,
            visible: false,
            color: 0xffffff,
            iconOpacity: 0.5
        });


        this.initializeActions();
    }

    onRedererFrameEvent(event) {
        if (this.airBlowerStarted === true) {
            this.blowerWheelLA22LA034.rotateY(1.0);
        }
        if (this.airHandlerAirFlow.visible) {
            if (this.airHandlerAirFlowThrottling > 2)
            {
                this.airHandlerAirFlowThrottling = 0;
                this.airHandlerAirFlow.material.map.offset.y -= 0.038;
                if (this.airHandlerAirFlow.material.map.offset.y < -0.494) {
                    this.airHandlerAirFlow.material.map.offset.y = -0.038;
                }
                this.airHandlerAirFlow.material.needsUpdate = true;
            }
            this.airHandlerAirFlowThrottling++;
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
    }

    onVLabStopAndHide() {
        this.stoptAirBlower(false);
    }

    onVLabResumeAndShow() {
        this.shadowsSetup();
        this.toggleSounds();
        this.startAirBlower(true);
        this.toggleCeilingVentGridsAirFlow();
        this.toggleAirHandlerAirFlow();
        this.toggleAirHandlerCabinetPanelsLookThrough();
        this.toggleAirHandlerDuctLookThrough();
    }

    shadowsSetup() {
        if (this.nature.useShadows !== undefined) {
            this.setupShadows({'defaultPointLight': this.light1});
        }
    }

    toggleSounds() {
        if (this.vLabLocator.currentLocationVLab !== this) return;
        if (this.nature.sounds === true) {
            this.vLabLocator.context.ambientSound.play();
            this.startAirBlower(true);
        } else {
            this.vLabLocator.context.ambientSound.pause();
            if (this.airBlowerSound.isPlaying) this.airBlowerSound.stop();
        }
    }

    toggleCeilingVentGridsAirFlow() {
        this.ceelingAirVentFlow.visible = this.nature.ceelingAirVentFlow && this.airBlowerStarted;
    }

    toggleAirHandlerAirFlow() {
        this.airHandlerAirFlow.visible = this.nature.airHandlerAirFlow && this.airBlowerStarted;
    }

    toggleAirHandlerCabinetPanelsLookThrough() {
        this.airHandlerCabinetPanelsLookThrough(this.nature.airHandlerCabinetPanelsLookThrough);
        if (this.positionInFrontOfTheNishActive === true) {
            this.volatageTransformerHT01CN236ZoomHelper.setMaterial({depthTest: !this.nature.airHandlerCabinetPanelsLookThrough});
            this.blowerWheelHousingZoomHelper.setMaterial({depthTest: !this.nature.airHandlerCabinetPanelsLookThrough});
            this.setInteractivesSuppressorsObjects('airHandlerCabinetUpperPanel');
        }
        if (!this.nature.airHandlerCabinetPanelsLookThrough) {
            this.setInteractivesSuppressorsObjects();
            this.blowerWheelHousingZoomHelper.setMaterial({depthTest: true});
            this.volatageTransformerHT01CN236ZoomHelper.setMaterial({depthTest: true});
        }
    }

    toggleAirHandlerDuctLookThrough() {
        this.airHandlerDuctLookThrough(this.nature.airHandlerDuctLookThrough);
    }

    startAirBlower(resume) {
        if (this.airBlowerSoundOnReady !== true || this.airBlowerSoundReady !== true) {
            setTimeout(() => {
                this.startAirBlower();
            }, 500);
            return;
        }
        var self = this;
        if (this.nature.sounds === true && (this.vLabLocator.context.activatedMode == 'cool')) {
            if (!this.airBlowerStarted) {
                this.airBlowerSoundOn.play();
                setTimeout(()=>{
                    self.airBlowerSound.play();
                }, 500);
            } else {
                self.airBlowerSound.play();
            }
        }
        if (!resume && (this.vLabLocator.context.activatedMode == 'cool')) this.airBlowerStarted = true;
        this.toggleCeilingVentGridsAirFlow();
        this.toggleAirHandlerAirFlow();
    }

    stoptAirBlower(stopMotor) {
        if (stopMotor) {
            this.airBlowerStarted = false;
        }
        if (this.airBlowerSound !== undefined) {
            if (this.airBlowerSound.isPlaying) this.airBlowerSound.stop();
        }
        this.toggleCeilingVentGridsAirFlow();
        this.toggleAirHandlerAirFlow();
    }

    positionInFrontOfTheNishCompleted() {
        this.positionInFrontOfTheNishActive = true;
        if (!this.nature.airHandlerCabinetPanelsLookThrough) {
            this.setInteractivesSuppressorsObjects();
            this.blowerWheelHousingZoomHelper.setMaterial({depthTest: true});
            this.volatageTransformerHT01CN236ZoomHelper.setMaterial({depthTest: true});
        } else {
            this.blowerWheelHousingZoomHelper.setMaterial({depthTest: false});
            this.volatageTransformerHT01CN236ZoomHelper.setMaterial({depthTest: false});
            this.setInteractivesSuppressorsObjects('airHandlerCabinetUpperPanel');
        }
    }

    initialPositionCompleted() {
        this.positionInFrontOfTheNishActive = false;
        this.blowerWheelHousingZoomHelper.setMaterial({depthTest: true});
        this.volatageTransformerHT01CN236ZoomHelper.setMaterial({depthTest: true});
    }

    carrierTPWEM01WallPositionCompleted() {
        this.positionInFrontOfTheNishActive = false;
        this.blowerWheelHousingZoomHelper.setMaterial({depthTest: true});
        this.volatageTransformerHT01CN236ZoomHelper.setMaterial({depthTest: true});
    }

    nishDoorOpenOrClose(caller) {
        if (caller) caller.vLabInteractor.deactivate();
        new TWEEN.Tween(this.vLabScene.getObjectByName('nishDoor').rotation)
        .to({ z: (this.nishDoorClosed) ? (-Math.PI - Math.PI / 2) : -Math.PI }, 500)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(() => {
            if (caller) caller.vLabInteractor.activate();
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
                                //Normal mode demo
                                if (self.vLabLocator.context.tablet.currentActiveTabId == 0) {
                                    self.vLabLocator.context.tablet.initObj.content.tabs[0].items[2].completed = true;
                                }
                                //Short to ground demo
                                if (self.vLabLocator.context.tablet.currentActiveTabId == 1) {
                                    self.vLabLocator.context.tablet.initObj.content.tabs[1].items[2].completed = true;
                                }
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
        //Short to ground demo
        if (this.vLabLocator.context.tablet.currentActiveTabId == 1) {
            //Approach the thermostat completed
            if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[0].completed === false) {
                this.vLabLocator.context.tablet.initObj.content.tabs[1].items[0].completed = true;
                this.vLabLocator.context.tablet.stepCompletedAnimation();
                this.playSound('resources/assistant/snd/step1.mp3');
                this.checkThermostatIsSetToCool();
            }
        }
    }

    // carrierTPWEM01InfoInteractorCallback() {
    //     console.log('carrierTPWEM01InfoInteractorCallback');
    // }

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
            //Normal Mode demo
            if (this.vLabLocator.context.tablet.currentActiveTabId == 0) {
                if (this.vLabLocator.context.tablet.initObj.content.tabs[0].items[1].completed === false) {
                    this.vLabLocator.context.tablet.initObj.content.tabs[0].items[1].completed = true;
                    this.vLabLocator.context.tablet.stepCompletedAnimation();
                    this.playSound('resources/assistant/snd/step2.mp3');

                    this.vLabLocator.context.normalModeOperationProcessor();
                    this.carrierTPWEM01.responsive = false;
                    this.vLabLocator.context.activatedMode = 'cool';
                    setTimeout(this.startAirBlower.bind(this), 2000);
                }
            }

            //Short to ground demo
            if (this.vLabLocator.context.tablet.currentActiveTabId == 1) {
                if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[1].completed === false) {
                    this.vLabLocator.context.tablet.initObj.content.tabs[1].items[1].completed = true;
                    this.vLabLocator.context.tablet.stepCompletedAnimation();
                    this.playSound('resources/assistant/snd/step2.mp3');

                    this.vLabLocator.context.shortToGroundOperationProcessor();
                    this.carrierTPWEM01.responsive = false;
                    this.vLabLocator.context.activatedMode = 'cool';
                    setTimeout(this.startAirBlower.bind(this), 2000);
                }
            }
        } else {
            setTimeout(this.checkThermostatIsSetToCool.bind(this), 2000);
        }
    }

    airHandlerCabinetPanelsLookThrough(lookThrough) {
        var airHandlerCabinetBottomPanel = this.vLabScene.getObjectByName("airHandlerCabinetBottomPanel");
        if (lookThrough === true) {
            airHandlerCabinetBottomPanel.material.alphaMap = this.airHandlerCabinetBottomPanelAlphaMap;
            airHandlerCabinetBottomPanel.material.transparent = true;
        } else {
            airHandlerCabinetBottomPanel.material.alphaMap = null;
            airHandlerCabinetBottomPanel.material.transparent = false;
        }
        airHandlerCabinetBottomPanel.material.needsUpdate = true;
    }

    airHandlerDuctLookThrough(lookThrough) {
        var airHandlerDuct = this.vLabScene.getObjectByName("duct");
        var airHandlerDuctBox = this.vLabScene.getObjectByName("ductBox");

        if (lookThrough === true) {
            airHandlerDuct.material.alphaMap = this.ductAlphaMap;
            airHandlerDuct.material.transparent = true;

            airHandlerDuctBox.material.alphaMap = this.ductBoxAlphaMap;
            airHandlerDuctBox.material.transparent = true;
        } else {
            airHandlerDuct.material.alphaMap = null;
            airHandlerDuct.material.transparent = false;

            airHandlerDuctBox.material.alphaMap = null;
            airHandlerDuctBox.material.transparent = false;
        }
        airHandlerDuct.material.needsUpdate = true;
        airHandlerDuctBox.material.needsUpdate = true;
    }

    blowerWheelHousingLookThrough() {
        this.blowerWheelHousingLookThroughInteractor.activate();
    }

    blowerWheelHousingLookThroughInteractorHandler() {
        var blowerWheelHousing = this.vLabScene.getObjectByName("blowerWheelHousing");
        if (!blowerWheelHousing.material.alphaMap) {
            blowerWheelHousing.material.alphaMap = this.blowerWheelHousingAlphaMap;
            blowerWheelHousing.material.side = THREE.DoubleSide;
            blowerWheelHousing.material.alphaTest = 0.5;
            blowerWheelHousing.material.transparent = true;
            this. blowerWheelHousingLookThroughInteractor.handlerSprite.material.opacity = 0.1;
        } else {
            blowerWheelHousing.material.alphaMap = undefined;
            blowerWheelHousing.material.transparent = false;
            blowerWheelHousing.material.side = THREE.FrontSide;
            blowerWheelHousing.material.alphaTest = 0.0;
            this.blowerWheelHousingLookThroughInteractor.handlerSprite.material.opacity = 0.5;
        }
        blowerWheelHousing.material.needsUpdate = true;
        this.blowerWheelHousingLookThroughInteractor.handlerSprite.material.needsUpdate = true;
    }
}