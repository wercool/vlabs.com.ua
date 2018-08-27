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
import DirectionalFlow              from '../../vlabs.items/directional-flow';
import GasFlow                      from '../../vlabs.items/gas-flow';
import DirectionalFlowWith3DArrow   from '../../vlabs.items/directionalFlowWith3DArrow';
import ElectricArc                  from '../../vlabs.items/electric-arc';
import WireHelper                   from '../../vlabs.items/wire-helper';
import SchematicHelper              from '../../vlabs.items/schematic-helper';

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
                    var textureLoader = new THREE.TextureLoader();

                    Promise.all([
                        textureLoader.load('./resources/scene-heat-pump/textures/bryantB225B_heatPumpCompressorAlphaMap.png'),
                        textureLoader.load('./resources/scene-heat-pump/textures/compressolOilDisplacement.jpg'),
                        textureLoader.load('./resources/scene-heat-pump/textures/scrollCompressorZP25K5EStatorDamagedMaterial.jpg'),
                        // textureLoader.load('./resources/scene-heat-pump/textures/statorShortToGround/spark1.png'),
                        // textureLoader.load('./resources/scene-heat-pump/textures/statorShortToGround/spark2.png'),
                        // textureLoader.load('./resources/scene-heat-pump/textures/statorShortToGround/spark3.png'),
                        // textureLoader.load('./resources/scene-heat-pump/textures/statorShortToGround/spark4.png'),
                    ])
                    .then((result) => {
                        this.heatPumpCompressorAlphaMap = result[0];
                        this.heatPumpCompressorOilDisplacementMap = result[1];
                        this.heatPumpCompressorDamagedWindings = result[2];
                        // this.statorWindingSparkTexture = [];
                        // this.statorWindingSparkTexture[0] = result[3];
                        // this.statorWindingSparkTexture[1] = result[4];
                        // this.statorWindingSparkTexture[2] = result[5];
                        // this.statorWindingSparkTexture[3] = result[6];
                        // this.statorWindingSparkTextureCnt = 0;

                        this.initialize(initObj);
                    })
                    .catch(error => {
                        console.error(error);
                    });
                    // this.initialize(initObj);
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

        this.heatPumpFrameCapUnscrewed = false;

        //VLab events subscribers
        this.webGLContainerEventsSubcribers.stopandhide["HVACHeatPumpLocationvLabStopAndHide"] = 
        {
            callback: this.onVLabStopAndHide,
            instance: this
        };
        this.webGLContainerEventsSubcribers.resumeandshow["HVACHeatPumpLocationvLabResumeAndShow"] = 
        {
            callback: this.onVLabResumeAndShow,
            instance: this
        };

        this.loadScene().then((vLabScene) => {
            this.setVLabScene(vLabScene);

            if (this.vLabLocator.initObj.locationInitialized) {
                this.vLabLocator.initObj.locationInitialized.call(this.vLabLocator.context, { location: this.name });
            }

            this.light0 = new THREE.AmbientLight(0xffffff, 0.4);
            this.vLabScene.add(this.light0);

            this.light1 = new THREE.PointLight(0xffffff, 0.5);
            this.light1.position.set(3.0, 5.0, 0.0);
            this.vLabScene.add(this.light1);

            // this.vLabScene.fog = new THREE.FogExp2(0x000000, 0.25);

            this.shadowsSetup();

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

            // var ZFightingMaterial = this.vLabScene.getObjectByName("contactor").material;
            // ZFightingMaterial.polygonOffset = true;
            // ZFightingMaterial.polygonOffsetFactor = 1.0;
            // ZFightingMaterial.polygonOffsetUnits = 4.0;
            // ZFightingMaterial.needsUpdate = true;

            this.vLabScene.getObjectByName("wire6Unplugged").visible = false;
            this.vLabScene.getObjectByName("controlBoardOF2WireUnplugged").visible = false;
            this.vLabScene.getObjectByName("wire10Unplugged").visible = false;

            // Scroll compressor LookThrough mode assets
            this.heatPumpCompressorOil = this.vLabScene.getObjectByName("heatPumpCompressorOil");
            this.heatPumpCompressorOil.material.side = THREE.FrontSide;
            this.heatPumpCompressorOil.material.displacementMap = this.heatPumpCompressorOilDisplacementMap;
            this.heatPumpCompressorOil.material.displacementScale = 0.0001;
            this.heatPumpCompressorOil.material.needsUpdate = true;
            this.heatPumpCompressorOil.visible = false;
            this.heatPumpCompressorOilDisplacementTween = new TWEEN.Tween(this.heatPumpCompressorOil.material)
            .to({ displacementBias: Math.random() / 2000 * (Math.random() > 0.5 ? 0.5 : -2.0) }, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(()=>{
                this.heatPumpCompressorOil.material.displacementBias += Math.random() / 10000;
            })
            .onComplete(()=>{
                if (this.heatPumpCompressorOil.visible === true) {
                    this.heatPumpCompressorOilDisplacementTween.to({ displacementBias: Math.random() / 2000 * (Math.random() > 0.5 ? 0.5 : -2.0) }, 200);
                    this.heatPumpCompressorOilDisplacementTween.start();
                }
            });
            this.heatPumpCompressorOilCrap = this.vLabScene.getObjectByName("heatPumpCompressorOilCrap");
            this.heatPumpCompressorOilDrops = this.vLabScene.getObjectByName("heatPumpCompressorOilDrops");

            this.scrollCompressorZP25K5EStator = this.vLabScene.getObjectByName("scrollCompressorZP25K5EStator");
            this.scrollCompressorZP25K5EStator.material.map = this.heatPumpCompressorDamagedWindings;
            this.scrollCompressorZP25K5EStator.material.needsUpdate = true;
            this.scrollCompressorZP25K5EStatorDamagedWires = this.vLabScene.getObjectByName("scrollCompressorZP25K5EStatorDamagedWires");
            // this.scrollCompressorZP25K5EStatorDamagedWires.visible = false;

            this.scrollCompressorZP25K5EStatorDamagedWiresSpark = this.vLabScene.getObjectByName("scrollCompressorZP25K5EStatorDamagedWiresSpark");
            this.scrollCompressorZP25K5EStatorDamagedWiresSpark.visible = false;

            // this.scrollCompressorZP25K5EStatorDamagedSparkSpriteMaterial = new THREE.SpriteMaterial({
            //     map: this.statorWindingSparkTexture[0],
            //     // color: this.initObj.color !== undefined ? this.initObj.color : 0x54ff00,
            //     blending: THREE.AdditiveBlending,
            //     transparent: true,
            //     opacity: 0.85,
            //     depthTest: false,
            //     // alphaTest: 0.5,
            // });

            // this.scrollCompressorZP25K5EStatorDamagedSparkSprite = new THREE.Sprite(this.scrollCompressorZP25K5EStatorDamagedSparkSpriteMaterial);
            // this.scrollCompressorZP25K5EStatorDamagedSparkSprite.name = 'scrollCompressorZP25K5EStatorDamagedSparkSprite';
            // this.scrollCompressorZP25K5EStatorDamagedSparkSprite.scale.set(0.1, 0.1, 0.1);
            // this.scrollCompressorZP25K5EStatorDamagedWires.add(this.scrollCompressorZP25K5EStatorDamagedSparkSprite);
            // this.scrollCompressorZP25K5EStatorDamagedSparkSprite.visible = false;
            this.scrollCompressorZP25K5EStatorDamagedSparkThrottling = 0;


            this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight = new THREE.PointLight(0xffffff);
            this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.intensity = 1.0;
            this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.distance = 0.04;
            this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.decay = 2.0;
            this.scrollCompressorZP25K5EStatorDamagedWiresSpark.add(this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight);
            this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.visible = false;




            this.serviceLocation = new VLabPositioner({
                context: this,
                active: false,
                pos: new THREE.Vector3(1.0, 1.4, 0.0),
                name: 'serviceLocation',
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                target: new THREE.Vector3(0.0, 0.5, 0.0),
                completeCallBack: this.serviceLocationPositioningCompleted
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

        if (this.vLabLocator.prevCameraControlsType !== undefined) {
            super.switchCameraControls({
                type: this.vLabLocator.prevCameraControlsType,
                vLabLocator: true
            });
        } else {
            super.switchCameraControls(this.nature.cameraControls);
        }

        this.fanMotorBladeShaft = this.vLabScene.getObjectByName('bryantB225B-heatPumpFanBlade');
    }

    onActivatedEvent() {

        var self = this;
        // Sounds
        this.fanMotorSoundReady = false;
        this.fanMotorSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-heat-pump/sounds/fan-motor-sound.mp3', function(buffer) {
            self.fanMotorSound.setBuffer(buffer);
            self.fanMotorSound.setVolume(0.2);
            self.fanMotorSound.setLoop(true);
            self.fanMotorSoundReady  = true;
        });

        this.fanMotorOffSoundReady = false;
        this.fanMotorOffSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-heat-pump/sounds/fan-motor-sound-off.mp3', function(buffer) {
            self.fanMotorOffSound.setBuffer(buffer);
            self.fanMotorOffSound.setVolume(0.2);
            self.fanMotorOffSoundReady  = true;
        });

        this.scrollCompressorSoundReady = false;
        this.scrollCompressorSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-heat-pump/sounds/scroll-compressor-sound.mp3', function(buffer) {
            self.scrollCompressorSound.setBuffer(buffer);
            self.scrollCompressorSound.setVolume(0.2);
            self.scrollCompressorSound.setLoop(true);
            self.scrollCompressorSoundReady  = true;
        });

        this.scrollCompressorOffSoundReady = false;
        this.scrollCompressorOffSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-heat-pump/sounds/scroll-compressor-sound-off.mp3', function(buffer) {
            self.scrollCompressorOffSound.setBuffer(buffer);
            self.scrollCompressorOffSound.setVolume(0.2);
            self.scrollCompressorOffSoundReady  = true;
        });

        this.contactorOnSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-heat-pump/sounds/contactorOn.mp3', function(buffer) {
            self.contactorOnSound.setBuffer(buffer);
            self.contactorOnSound.setVolume(0.4);
        });
        this.contactorOffSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-heat-pump/sounds/contactorOff.mp3', function(buffer) {
            self.contactorOffSound.setBuffer(buffer);
            self.contactorOffSound.setVolume(0.25);
        });

        this.scrollCompressorShortToGroundSparkSound = new THREE.Audio(this.defaultAudioListener);
        new THREE.AudioLoader().load('./resources/scene-heat-pump/sounds/scrollCompressorShortToGroundSparkSound.mp3', function(buffer) {
            self.scrollCompressorShortToGroundSparkSound.setBuffer(buffer);
            self.scrollCompressorShortToGroundSparkSound.setVolume(1.0);
        });

        this.showOverlayMessage('<div style="position: absolute; top: 30%; left: calc(50% - 50px); width: 100px; text-align: center; color: white; font-size: 18px; padding: 20px; border-radius: 10px; box-shadow: 1px 1px 10px #cffdff80;">Initializing...</div>');

        //VLab Core Items
        this.vLabLocator.addLocation(this);

        this.inventory = new Inventory({
            context: this
        });

// console.log('this.vLabLocator.context.tablet.currentActiveTabId', this.vLabLocator.context.tablet.currentActiveTabId);

        if (this.vLabLocator.context.tablet.currentActiveTabId != 2) {
            this.inventory.hideToolboxBtn();
        } else {
            this.inventory.showToolboxBtn();
        }

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

        this.bryantB225B_heatPumpCompressorZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "bryantB225B_heatPumpCompressor",
            minDistance: 0.1,
            maxDistance: 0.15,
            positionDeltas: new THREE.Vector3(-0.1, 0.1, 0.1), 
            scale: new THREE.Vector3(0.2, 0.2, 0.2),
            orbitTargetPositionDeltas: new THREE.Vector3(0.0, 0.0, 0.0), 
            color: 0xfff495,
            visible: true,
            zoomCompleteCallback: this.heatPumpCompressorLookThrough,
            zoomResetCallback: this.shortToGroundEffectOff
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
            color: 0xfff495,
            minAzimuthAngle: 1.1,
            maxAzimuthAngle: 0.0,
        });

        this.ACDisconnectCaseZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "ACDisconnectCase",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(-0.05, 0.15, 0.0), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495,
            zoomCompleteCallback: this.ACDisconnectCaseZoomHelperHandler,
            zoomResetCallback: this.ACDisconnectCasezoomResetCallback
        });

        this.ACDisconnectCaseZoomHelper_CloseUp = new ZoomHelper({
            context: this,
            targetObjectName: "ACDisconnectCase",
            minDistance: 0.1,
            maxDistance: 0.15,
            positionDeltas: new THREE.Vector3(-0.05, 0.05, -0.05), 
            scale: new THREE.Vector3(0.03, 0.03, 0.03),
            orbitTargetPositionDeltas: new THREE.Vector3(0.0, 0.0, 0.0), 
            color: 0xfff495,
            visible: false,
            hideOnExit: true
        });

        this.contactor_ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "contactor",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.1), 
            scale: new THREE.Vector3(0.075, 0.075, 0.075),
            color: 0xfff495,
            zoomCompleteCallback: this.zoomToContactorHandler,
            maxPolarAngle: THREE.Math.degToRad(140.0)
        });

        // this.contactor_ZoomHelper_CloseUp = new ZoomHelper({
        //     context: this,
        //     targetObjectName: "contactor",
        //     minDistance: 0.1,
        //     maxDistance: 0.15,
        //     positionDeltas: new THREE.Vector3(-0.075, 0.0, 0.06), 
        //     scale: new THREE.Vector3(0.02, 0.02, 0.02),
        //     orbitTargetPositionDeltas: new THREE.Vector3(0.0, -0.1, 0.0), 
        //     color: 0xfff495,
        //     opacity: 0.3,
        //     visible: false,
        //     hideOnExit: true
        // });

        this.controlBoard_ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "controlBoard",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.05), 
            scale: new THREE.Vector3(0.085, 0.085, 0.085),
            color: 0xfff495,
            zoomCompleteCallback: this.showControlBoardZoomHelperCloseUp
        });

        this.controlBoard_ZoomHelper_CloseUp = new ZoomHelper({
            context: this,
            targetObjectName: "controlBoard",
            minDistance: 0.1,
            maxDistance: 0.15,
            positionDeltas: new THREE.Vector3(0.0, 0.0, 0.015), 
            scale: new THREE.Vector3(0.03, 0.03, 0.03),
            orbitTargetPositionDeltas: new THREE.Vector3(0.0, 0.0, 0.0), 
            color: 0xfff495,
            visible: false,
            hideOnExit: true
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
            interactive: true,
            inventory: this.inventory
        });

        this.FatMaxScrewdriver = new FatMaxScrewdriver({
            context: this,
            pos: new THREE.Vector3(1.0, 0.2, 0.0),
            name: "FatMaxScrewdriver",
            manipulation: false,
            interactive: true,
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

        new TrueRMSMultimeterHS36({
            context: this,
            inventory: this.inventory,
            interactive: true,
            name: 'trueRMSMultimeterHS36',
            pos: new THREE.Vector3(0.0, 0.0, 0.0)
        }).then((instance) => {
            this.trueRMSMultimeterHS36 = instance;

            this.trueRMSMultimeterHS36.setProbesElectricConditions({
                VADC: [
                    {
                        testPoints: [
                            'contactor23b',
                            'contactor21'
                        ],
                        reading: 230.0
                    },
                    {
                        testPoints: [
                            'contactor23t',
                            'contactor21'
                        ],
                        reading: 230.0
                    },
                    {
                        testPoints: [
                            'contactor21',
                            'contactor11',
                        ],
                        reading: 230.0
                    },
                    {
                        testPoints: [
                            'contactor21',
                            'ground',
                        ],
                        reading: 230.0
                    },
                ],
                NCV: true,
                CONT: [
                    {
                        testPoints: [
                            'contactor24VL',
                            'contactor24VR',
                        ],
                        reading: 13.5,
                    },
                    {
                        testPoints: [
                            'contactor23b',
                            'contactor23t',
                        ],
                        reading: 0.4
                    },
                    {
                        testPoints: [
                            'contactor11',
                            'ground'
                        ],
                        reading: 0.8
                    },
                    {
                        testPoints: [
                            'contactor23t',
                            'ground'
                        ],
                        reading: 2.6
                    },
                    {
                        testPoints: [
                            'contactor23b',
                            'ground'
                        ],
                        reading: 2.8
                    },
                    {
                        testPoints: [
                            'contactor23b',
                            'contactor21'
                        ],
                        reading: 'HV',
                        hv: 230.0
                    },
                    {
                        testPoints: [
                            'contactor23t',
                            'contactor11'
                        ],
                        reading: 1.2
                    },
                    {
                        testPoints: [
                            'contactor23b',
                            'contactor11'
                        ],
                        reading: 1.2
                    },
                    {
                        testPoints: [
                            'contactor21',
                            'contactor11',
                        ],
                        reading: 'HV',
                        hv: 230.0
                    },
                    {
                        testPoints: [
                            'contactor23t',
                            'contactor21'
                        ],
                        reading: 'HV',
                        hv: 230.0
                    },
                    {
                        testPoints: [
                            'contactor21',
                            'ground'
                        ],
                        reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 'HV' : 0.8,
                        hv: 208.0
                    },
                ]
            });

            // //controlBoard
            // this.trueRMSMultimeterHS36.addResponsiveObject({
            //     mesh: this.vLabScene.getObjectByName('controlBoard'),
            //     testPoints: [
            //         {
            //             name: 'relayT9AV5022ContactCOM',
            //             target: new THREE.Vector3(0.0352108, 0.02511, 0.0296565),
            //             spritePosDeltas: new THREE.Vector3(-0.04, -0.025, 0.02),
            //             spriteScale: 0.05,
            //             spriteRotation: 0.0,
            //             redProbeOrientation: new THREE.Vector3(1.89180, 0.13956, -2.22175),
            //             blackProbeOrientation: new THREE.Vector3(1.85011, 0.21216, -1.98470),
            //             probeWiresPathes: {
            //                 redWire: [
            //                     new THREE.Vector3(0.260, 0.658, -0.428),
            //                     new THREE.Vector3(0.291, 0.649, -0.437),
            //                     new THREE.Vector3(0.302, 0.481, -0.428),
            //                     new THREE.Vector3(0.425, 0.468, -0.350),
            //                     new THREE.Vector3(0.494, 0.636, -0.310),
            //                     new THREE.Vector3(0.478, 0.656, -0.313),
            //                 ],
            //                 blackWire: [
            //                     new THREE.Vector3(0.253, 0.658, -0.447),
            //                     new THREE.Vector3(0.301, 0.667, -0.449),
            //                     new THREE.Vector3(0.341, 0.400, -0.397),
            //                     new THREE.Vector3(0.415, 0.417, -0.333),
            //                     new THREE.Vector3(0.486, 0.629, -0.270),
            //                     new THREE.Vector3(0.466, 0.656, -0.276),
            //                 ],
            //             }
            //         },
            //         {
            //             name: 'relayT9AV5022ContactNC',
            //             target: new THREE.Vector3(0.0550126, 0.0309874, 0.0296565),
            //             spritePosDeltas: new THREE.Vector3(0.0, -0.075, 0.05),
            //             spriteScale: 0.05,
            //             spriteRotation: THREE.Math.degToRad(270.0),
            //             redProbeOrientation: new THREE.Vector3(-1.00133, 0.56427, -0.97433),
            //             blackProbeOrientation: new THREE.Vector3(-1.05578, -0.66802, 0.97994),
            //             probeWiresPathes: {
            //                 redWire: [
            //                     new THREE.Vector3(0.260, 0.658, -0.428),
            //                     new THREE.Vector3(0.291, 0.653, -0.438),
            //                     new THREE.Vector3(0.346, 0.379, -0.416),
            //                     new THREE.Vector3(0.423, 0.403, -0.360),
            //                     new THREE.Vector3(0.495, 0.708, -0.359),
            //                     new THREE.Vector3(0.474, 0.722, -0.357),
            //                 ],
            //                 blackWire: [
            //                     new THREE.Vector3(0.253, 0.658, -0.447),
            //                     new THREE.Vector3(0.292, 0.661, -0.458),
            //                     new THREE.Vector3(0.328, 0.498, -0.488),
            //                     new THREE.Vector3(0.334, 0.497, -0.523),
            //                     new THREE.Vector3(0.324, 0.738, -0.547),
            //                     new THREE.Vector3(0.322, 0.739, -0.518),
            //                 ],
            //             }
            //         },
            //         {
            //             name: 'relayT9AV5022ContactNO',
            //             target: new THREE.Vector3(0.055229, 0.0400362, 0.0296565),
            //             spritePosDeltas: new THREE.Vector3(0.07, -0.01, 0.05),
            //             spriteScale: 0.05,
            //             spriteRotation: THREE.Math.degToRad(300.0),
            //             redProbeOrientation: new THREE.Vector3(-2.27360, 0.36332, 0.89725),
            //             blackProbeOrientation: new THREE.Vector3(-1.05578, -0.66802, 0.97994),
            //             probeWiresPathes: {
            //                 redWire: [
            //                     new THREE.Vector3(0.260, 0.658, -0.428),
            //                     new THREE.Vector3(0.299, 0.667, -0.442),
            //                     new THREE.Vector3(0.266, 0.421, -0.543),
            //                     new THREE.Vector3(0.260, 0.436, -0.584),
            //                     new THREE.Vector3(0.293, 0.738, -0.558),
            //                     new THREE.Vector3(0.303, 0.751, -0.518),
            //                 ],
            //                 blackWire: [
            //                     new THREE.Vector3(0.253, 0.658, -0.447),
            //                     new THREE.Vector3(0.295, 0.665, -0.458),
            //                     new THREE.Vector3(0.320, 0.471, -0.487),
            //                     new THREE.Vector3(0.341, 0.462, -0.535),
            //                     new THREE.Vector3(0.326, 0.737, -0.546),
            //                     new THREE.Vector3(0.322, 0.748, -0.518),
            //                 ],
            //             }
            //         },
            //     ]
            // });

            //contactor
            this.trueRMSMultimeterHS36.addResponsiveObject({
                mesh: this.vLabScene.getObjectByName('contactor'),
                testPoints: [
                    {
                        name: 'contactor24VL',
                        target: new THREE.Vector3(0.0, -0.0198938, 0.029299),
                        spritePosDeltas: new THREE.Vector3(-0.02, -0.035, 0.03),
                        spriteScale: 0.05,
                        spriteRotation: THREE.Math.degToRad(30.0),
                        redProbeOrientation: new THREE.Vector3(2.23672, 0.42903, -3.02680),
                        blackProbeOrientation: new THREE.Vector3(2.25340, 0.52562, -2.92846),
                        probeWiresPathes: {
                            redWire: [
                                new THREE.Vector3(0.260, 0.608, -0.428),
                                new THREE.Vector3(0.297, 0.611, -0.433),
                                new THREE.Vector3(0.454, 0.388, -0.419),
                                new THREE.Vector3(0.534, 0.409, -0.359),
                                new THREE.Vector3(0.510, 0.482, -0.342),
                                new THREE.Vector3(0.494, 0.490, -0.342),
                            ],
                            blackWire: [
                                new THREE.Vector3(0.253, 0.608, -0.447),
                                new THREE.Vector3(0.311, 0.609, -0.451),
                                new THREE.Vector3(0.418, 0.411, -0.450),
                                new THREE.Vector3(0.520, 0.428, -0.392),
                                new THREE.Vector3(0.510, 0.500, -0.337),
                                new THREE.Vector3(0.493, 0.503, -0.330),
                            ],
                        }
                    },
                    {
                        name: 'contactor24VR',
                        target: new THREE.Vector3(0.0, 0.0206694, 0.029299),
                        spritePosDeltas: new THREE.Vector3(-0.02, 0.035, 0.015),
                        spriteScale: 0.05,
                        spriteRotation: THREE.Math.degToRad(250.0),
                        redProbeOrientation: new THREE.Vector3(0.97131, 0.20891, 2.78713),
                        blackProbeOrientation: new THREE.Vector3(0.91651, 0.21074, 2.82736),
                        probeWiresPathes: {
                            redWire: [
                                new THREE.Vector3(0.260, 0.608, -0.428),
                                new THREE.Vector3(0.302, 0.612, -0.442),
                                new THREE.Vector3(0.300, 0.335, -0.514),
                                new THREE.Vector3(0.291, 0.316, -0.566),
                                new THREE.Vector3(0.323, 0.401, -0.538),
                                new THREE.Vector3(0.320, 0.417, -0.514),
                            ],
                            blackWire: [
                                new THREE.Vector3(0.253, 0.608, -0.447),
                                new THREE.Vector3(0.281, 0.609, -0.456),
                                new THREE.Vector3(0.259, 0.297, -0.536),
                                new THREE.Vector3(0.323, 0.366, -0.532),
                                new THREE.Vector3(0.323, 0.415, -0.526),
                                new THREE.Vector3(0.313, 0.423, -0.516),
                            ],
                        }
                    },
                    {
                        name: 'contactor23t',
                        target: new THREE.Vector3(-0.02725, -0.01124, 0.04828),
                        spritePosDeltas: new THREE.Vector3(-0.04, -0.03, 0.01),
                        spriteScale: 0.05,
                        spriteRotation: 0.0,
                        redProbeOrientation: new THREE.Vector3(1.61738, -0.09410, -2.43228),
                        blackProbeOrientation: new THREE.Vector3(1.97466, -0.66307, -2.52791),
                        probeWiresPathes: {
                            redWire: [
                                new THREE.Vector3(0.260, 0.608, -0.428),
                                new THREE.Vector3(0.293, 0.614, -0.432),
                                new THREE.Vector3(0.365, 0.395, -0.512),
                                new THREE.Vector3(0.450, 0.490, -0.483),
                                new THREE.Vector3(0.428, 0.605, -0.456),
                                new THREE.Vector3(0.424, 0.607, -0.442),
                            ],
                            blackWire: [
                                new THREE.Vector3(0.253, 0.608, -0.447),
                                new THREE.Vector3(0.291, 0.618, -0.447),
                                new THREE.Vector3(0.355, 0.398, -0.500),
                                new THREE.Vector3(0.463, 0.499, -0.469),
                                new THREE.Vector3(0.450, 0.575, -0.464),
                                new THREE.Vector3(0.442, 0.575, -0.455),
                            ],
                        }
                    },
                    {
                        name: 'contactor11',
                        target: new THREE.Vector3(-0.02682, 0.004246, 0.05263),
                        spritePosDeltas: new THREE.Vector3(-0.04, 0.02, 0.01),
                        spriteScale: 0.05,
                        spriteRotation: THREE.Math.degToRad(270.0),
                        redProbeOrientation: new THREE.Vector3(1.48189, -0.10203, -2.68751),
                        blackProbeOrientation: new THREE.Vector3(1.09068, -0.04216, -2.84341),
                        probeWiresPathes: {
                            redWire: [
                                new THREE.Vector3(0.260, 0.608, -0.428),
                                new THREE.Vector3(0.290, 0.611, -0.434),
                                new THREE.Vector3(0.365, 0.405, -0.532),
                                new THREE.Vector3(0.431, 0.451, -0.546),
                                new THREE.Vector3(0.436, 0.572, -0.501),
                                new THREE.Vector3(0.420, 0.571, -0.483),
                            ],
                            blackWire: [
                                new THREE.Vector3(0.253, 0.608, -0.447),
                                new THREE.Vector3(0.296, 0.616, -0.448),
                                new THREE.Vector3(0.302, 0.384, -0.571),
                                new THREE.Vector3(0.345, 0.441, -0.576),
                                new THREE.Vector3(0.374, 0.541, -0.543),
                                new THREE.Vector3(0.377, 0.548, -0.515),
                            ],
                        }
                    },
                    {
                        name: 'contactor23b',
                        target: new THREE.Vector3(0.02901, -0.01138, 0.04829),
                        spritePosDeltas: new THREE.Vector3(0.03, -0.03, 0.01),
                        spriteScale: 0.05,
                        spriteRotation: THREE.Math.degToRad(110.0),
                        redProbeOrientation: new THREE.Vector3(1.90961, 0.41281, -2.95240),
                        blackProbeOrientation: new THREE.Vector3(1.82550, 0.49412, -2.73169),
                        probeWiresPathes: {
                            redWire: [
                                new THREE.Vector3(0.260, 0.608, -0.428),
                                new THREE.Vector3(0.307, 0.614, -0.429),
                                new THREE.Vector3(0.412, 0.356, -0.449),
                                new THREE.Vector3(0.458, 0.358, -0.449),
                                new THREE.Vector3(0.498, 0.467, -0.421),
                                new THREE.Vector3(0.490, 0.472, -0.409),
                            ],
                            blackWire: [
                                new THREE.Vector3(0.253, 0.608, -0.447),
                                new THREE.Vector3(0.292, 0.620, -0.456),
                                new THREE.Vector3(0.394, 0.397, -0.447),
                                new THREE.Vector3(0.483, 0.381, -0.458),
                                new THREE.Vector3(0.503, 0.487, -0.416),
                                new THREE.Vector3(0.485, 0.502, -0.400),
                            ],
                        }
                    },
                    {
                        name: 'contactor21',
                        target: new THREE.Vector3(0.02777, 0.00396, 0.05269),
                        spritePosDeltas: new THREE.Vector3(0.03, 0.01, 0.02),
                        spriteScale: 0.05,
                        spriteRotation: THREE.Math.degToRad(160.0),
                        redProbeOrientation: new THREE.Vector3(1.58958, 0.25852, -3.00898),
                        blackProbeOrientation: new THREE.Vector3(1.85273, -1.08886, -2.64199),
                        probeWiresPathes: {
                            redWire: [
                                new THREE.Vector3(0.260, 0.608, -0.428),
                                new THREE.Vector3(0.288, 0.610, -0.428),
                                new THREE.Vector3(0.396, 0.415, -0.469),
                                new THREE.Vector3(0.438, 0.340, -0.546),
                                new THREE.Vector3(0.467, 0.457, -0.500),
                                new THREE.Vector3(0.453, 0.466, -0.473),
                            ],
                            blackWire: [
                                new THREE.Vector3(0.253, 0.608, -0.447),
                                new THREE.Vector3(0.281, 0.606, -0.456),
                                new THREE.Vector3(0.312, 0.365, -0.563),
                                new THREE.Vector3(0.418, 0.402, -0.534),
                                new THREE.Vector3(0.434, 0.473, -0.525),
                                new THREE.Vector3(0.424, 0.482, -0.495),
                            ],
                        }
                    },
                    {
                        name: 'ground',
                        target: new THREE.Vector3(0.05983, 0.03805, 0.0037),
                        spritePosDeltas: new THREE.Vector3(0.0, 0.03, 0.05),
                        spriteScale: 0.05,
                        spriteRotation: THREE.Math.degToRad(200.0),
                        redProbeOrientation: new THREE.Vector3(1.03036, -0.32217, -2.99326),
                        blackProbeOrientation: new THREE.Vector3(1.36364, -0.17196, -2.93675),
                        probeWiresPathes: {
                            redWire: [
                                new THREE.Vector3(0.260, 0.608, -0.428),
                                new THREE.Vector3(0.293, 0.602, -0.436),
                                new THREE.Vector3(0.265, 0.333, -0.530),
                                new THREE.Vector3(0.295, 0.357, -0.545),
                                new THREE.Vector3(0.322, 0.443, -0.535),
                                new THREE.Vector3(0.305, 0.436, -0.514),
                            ],
                            blackWire: [
                                new THREE.Vector3(0.253, 0.608, -0.447),
                                new THREE.Vector3(0.281, 0.610, -0.448),
                                new THREE.Vector3(0.253, 0.328, -0.536),
                                new THREE.Vector3(0.294, 0.341, -0.551),
                                new THREE.Vector3(0.349, 0.431, -0.521),
                                new THREE.Vector3(0.356, 0.446, -0.492),
                            ],
                        }
                    },
                ]
            });
        });

        // new DigitalMultimeterFluke17B({
        //     context: this,
        //     inventory: this.inventory,
        //     interactive: true,
        //     name: 'digitalMultimeterFluke17B',
        //     pos: new THREE.Vector3(-0.072, -0.07, -0.11)
        // }).then((instance) => {
        //     this.digitalMultimeterFluke17B = instance;
        //     this.digitalMultimeterFluke17B.addResponsiveObject({
        //         mesh: this.vLabScene.getObjectByName('controlBoard'),
        //         testPoints: [
        //             {
        //                 name: 'relayT9AV5022ContactCOM',
        //                 target: new THREE.Vector3(0.0352108, 0.02511, 0.0296565),
        //                 orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, THREE.Math.degToRad(30.0)),
        //                 spritePosDeltas: new THREE.Vector3(-0.03, 0.05, 0.05),
        //                 spriteScale: 0.05,
        //                 spriteRotation: 0.0
        //             },
        //             {
        //                 name: 'relayT9AV5022ContactNC',
        //                 target: new THREE.Vector3(0.0550126, 0.0309874, 0.0296565),
        //                 orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, THREE.Math.degToRad(-60.0)),
        //                 spritePosDeltas: new THREE.Vector3(0.05, -0.05, 0.05),
        //                 spriteScale: 0.05,
        //                 spriteRotation: THREE.Math.degToRad(270.0)
        //             },
        //             {
        //                 name: 'relayT9AV5022ContactNO',
        //                 target: new THREE.Vector3(0.055229, 0.0400362, 0.0296565),
        //                 orientation: new THREE.Vector3(THREE.Math.degToRad(90.0), 0.0, 0.0),
        //                 spritePosDeltas: new THREE.Vector3(0.05, 0.05, 0.05),
        //                 spriteScale: 0.05,
        //                 spriteRotation: THREE.Math.degToRad(300.0)
        //             },
        //         ]
        //     });
        // });

        /* VLab Interactors */
        // this.heatPumpFrameCapInteractor = new VLabInteractor({
        //     context: this,
        //     name: 'heatPumpFrameCapInteractor',
        //     pos: new THREE.Vector3(0.0, 0.0, 0.0),
        //     object: this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameCap'),
        //     objectRelPos: new THREE.Vector3(0.35, 0.5, 0.0),
        //     scale: new THREE.Vector3(0.15, 0.15, 0.15),
        //     icon: 'resources/scene-heat-pump/assets/screwdriver.png',
        //     iconRotation: THREE.Math.degToRad(0.0),
        //     action: this.heatPumpFrameCapTakeOutWithScrewdriver
        // });

        this.ACDisconnectDoorInteractor = new VLabInteractor({
            context: this,
            name: 'ACDisconnectDoorInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('ACDisconnectDoor'),
            objectRelPos: new THREE.Vector3(0.0, 0.05, -0.15),
            scale: new THREE.Vector3(0.05, 0.05, 0.05),
            action: this.ACDisconnectDoorInteractorHandler,
            deactivated: true
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
            depthTest: false,
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

        this.heatPumpCompressorLookThroughInteractor = new VLabInteractor({
            context: this,
            name: 'heatPumpCompressorLookThroughInteractor',
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            object: this.vLabScene.getObjectByName('bryantB225B_heatPumpCompressor'),
            objectRelPos: new THREE.Vector3(-0.07, 0.07, 0.12),
            scale: new THREE.Vector3(0.03, 0.03, 0.03),
            // depthTest: false,
            icon: '../vlabs.assets/img/look-through.png',
            action: this.heatPumpCompressorLookThroughInteractorHandler,
            visible: false,
            color: 0xffffff,
            iconOpacity: 0.5
        });

        this.powerInLineCurrentFlow = new DirectionalFlow({
            context: this,
            name: 'powerInLineCurrentFlow',
            tubes: [
                {
                    tube: this.vLabScene.getObjectByName('powerInLinePath'),
                    cSectionVertices: 4,
                    reversed: false,
                    reference: true
                },
            ],
            color: 0x00ff00,
            scale: new THREE.Vector3(0.15, 0.15, 0.15),
            animationDelay: 100,
            tooltip: '~230V Power'
        });
        // setTimeout(() => {
        //     this.powerInLineCurrentFlow.start();
        // }, 1000);

        this.gasFlow = new GasFlow({
            context: this,
            name: 'refrigerantFlow',
            gasFlowHelperMesh: this.vLabScene.getObjectByName('refrigerantFlowHelper'),
            confrontMaterials: [ this.vLabScene.getObjectByName('bryantB225B_heatPumpFanGrid').material ],
            expansionEffect: true
        });
        this.toggleRefrigerantFlow1();

        this.gasFlows1 = [];
        for (var i = 0; i < this.nature.directionalRefrigerantFlowNum; i++) {
            var gasFlow1 = new DirectionalFlowWith3DArrow({
                    context: this,
                    name: 'heatPumpDirectionalRefrigerantFlow',
                    refPath: this.vLabScene.getObjectByName('heatPumpGasFlow1RefPath'),
                    cSectionVertices: 4,
                    reversed: true,
                    speed: 50,
                    scale: 0.25,
                    addXOffset: {
                        offsetPos: -0.04,
                        offestPath: 0.5
                    }
                });
            this.gasFlows1.push(gasFlow1);
        }
        this.toggleDirectionalRefrigerantFlow();

        if (this.vLabLocator.context.activatedMode == 'cool') {
            this.contactorOn(true);
        }

        ////// Ambient Air Flow
        this.ambientAirFlow1 = this.vLabScene.getObjectByName('ambientAirFlow1');
        this.ambientAirFlow1.material.opacity = 0.25;
        this.ambientAirFlow1.material.color = new THREE.Color(2.5, 1.0, 2.5);
        this.ambientAirFlow1.material.alphaTest = 0.1;
        this.ambientAirFlow1.material.needsUpdate = true;
        this.ambientAirFlow1Throttling = 0;
        this.ambientAirFlow1.visible = false;
        this.toggleHeatPumpAirFlow();

        this.contactorTraverse = this.vLabScene.getObjectByName("contactorTraverse");
        this.contactorElectricArcEffect = new ElectricArc({
            context: this,
            color: 0xffffff,
            parentObj: this.contactorTraverse,
            relPos: new THREE.Vector3(0.01, 0.0, 0.0),
            scale: 0.02,
            opacity: 1.0,
            duration: 0.2,
            lightning: {
                intensity: 1.0,
                distance: 0.25,
                decay: 3.0,
                relPos: new THREE.Vector3(0.01, 0.0, 0.075),
                // target: this.vLabScene.getObjectByName("contactor"),
            }
        });


        //Wire helpers
        this.wire6Helper =  new WireHelper({
            context: this,
            name: 'wire6Helper',
            object: this.vLabScene.getObjectByName('wire6'),
            sourceThumb: 'resources/scene-heat-pump/textures/wireHelpers/wire6HelperSource.png',
            targetThumb: 'resources/scene-heat-pump/textures/wireHelpers/wire6HelperTarget.png',
            sourceRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            targetRelPos: new THREE.Vector3(-0.349, 0.0, 0.084),
            sourceThumbRelPos: new THREE.Vector3(0.0, -0.015, 0.0),
            targetThumbRelPos: new THREE.Vector3(0.0, 0.01, 0.0),
            sourceThumbScale: new THREE.Vector3(0.125, 0.125, 0.125),
            targetThumbScale: new THREE.Vector3(0.11, 0.11, 0.11),
            sourceThumbRotation: 0.0,
            targetThumbRotation: 0.0,
            sourceThumbDepthTest: false,
            targetThumbDepthTest: false,
        });

        this.wire7Helper =  new WireHelper({
            context: this,
            name: 'wire7Helper',
            object: this.vLabScene.getObjectByName('wire7'),
            sourceThumb: 'resources/scene-heat-pump/textures/wireHelpers/wire7HelperSource.png',
            targetThumb: 'resources/scene-heat-pump/textures/wireHelpers/wire7HelperTarget.png',
            sourceRelPos: new THREE.Vector3(-0.2143, -0.3251, 0.2709),
            targetRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            sourceThumbRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            targetThumbRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            sourceThumbScale: new THREE.Vector3(0.125, 0.125, 0.125),
            targetThumbScale: new THREE.Vector3(0.2, 0.2, 0.2),
            sourceThumbRotation: 0.0,
            targetThumbRotation: 0.0,
            sourceThumbDepthTest: false,
            targetThumbDepthTest: false,
        });

        this.wire7Helper =  new WireHelper({
            context: this,
            name: 'wire5Helper',
            object: this.vLabScene.getObjectByName('wire5'),
            sourceThumb: 'resources/scene-heat-pump/textures/wireHelpers/wire5HelperSource.png',
            targetThumb: 'resources/scene-heat-pump/textures/wireHelpers/wire5HelperTarget.png',
            sourceRelPos: new THREE.Vector3(-0.2157, -0.3129, 0.2673),
            targetRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            sourceThumbRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            targetThumbRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            sourceThumbScale: new THREE.Vector3(0.125, 0.125, 0.125),
            targetThumbScale: new THREE.Vector3(0.2, 0.2, 0.2),
            sourceThumbRotation: 0.0,
            targetThumbRotation: 0.0,
            sourceThumbDepthTest: false,
            targetThumbDepthTest: false,
        });

        this.controlBoardOF1Wire7Helper =  new WireHelper({
            context: this,
            name: 'controlBoardOF1WireHelper',
            object: this.vLabScene.getObjectByName('controlBoardOF1Wire'),
            sourceThumb: 'resources/scene-heat-pump/textures/wireHelpers/controlBoardOF1WireHelperSource.png',
            targetThumb: 'resources/scene-heat-pump/textures/wireHelpers/controlBoardOF1WireHelperTarget.png',
            sourceRelPos: new THREE.Vector3(0.0078, -0.01316, -0.1853),
            targetRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            sourceThumbRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            targetThumbRelPos: new THREE.Vector3(0.0, 0.0, 0.0),
            sourceThumbScale: new THREE.Vector3(0.125, 0.125, 0.125),
            targetThumbScale: new THREE.Vector3(0.075, 0.075, 0.075),
            sourceThumbRotation: 0.0,
            targetThumbRotation: 0.0,
            sourceThumbDepthTest: false,
            targetThumbDepthTest: false,
        });

        //Scehamitc helpers
        this.servicePanelSchematicHelper = new SchematicHelper({
            context: this,
            name: 'servicePanelSchematicHelper',
            object: this.vLabScene.getObjectByName('contactor'),
            scale: new THREE.Vector3(0.025, 0.025, 0.025),
            relPos: new THREE.Vector3(-0.11, -0.02, 0.05),
            schematicPNG: 'resources/scene-heat-pump/textures/schematicHelpers/servicePanelWiringDiagram.png'
        });

        if (this.nature.heatPumpFrameServicePanelTakeOutInteractor === true) {
            this.heatPumpFrameServicePanelTakeOutInteractor.activate();
        } else {
            this.heatPumpFrameServicePanelTakeOutInteractor.deactivate();
        }


        this.ACDisconnectDoorHingeCodeLock = this.vLabScene.getObjectByName('ACDisconnectDoorHingeCodeLock');

        if (this.vLabLocator.context.tablet.currentActiveTabId == 2) {
            this.ACDisconnectDoorHingeCodeLock.visible = false;
        }

        this.toggleThermostatOnScreenHelper();

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
        if (this.fanMotorStarted === true && this.vLabLocator.context.HeatPumpACPower == true) {
            // this.fanMotorBladeShaft.rotateZ(0.5);
            this.fanMotorBladeShaft.rotateZ(this.fanMotorSpeed);
            if (this.fanMotorSpeed < 0.5) {
                this.fanMotorSpeed += 0.005;
            }
        } else {
            if (this.fanMotorSpeed > 0.0) {
                this.fanMotorBladeShaft.rotateZ(this.fanMotorSpeed);
                this.fanMotorSpeed -= 0.005;
            }
        }
        if (this.ambientAirFlow1.visible) {
            if (this.ambientAirFlow1Throttling > 2)
            {
                this.ambientAirFlow1Throttling = 0;
                this.ambientAirFlow1.material.map.offset.y -= 0.038;
                if (this.ambientAirFlow1.material.map.offset.y < -0.494) {
                    this.ambientAirFlow1.material.map.offset.y = -0.038;
                }
                this.ambientAirFlow1.material.map.needsUpdate = true;
            }
            this.ambientAirFlow1Throttling++;
        }
        if (this.vLabLocator.context.HeatPumpACPower == true && this.scrollCompressorStarted == true && this.heatPumpCompressorOil.visible == true) {
            this.heatPumpCompressorOil.material.map.rotation += Math.random() / 150;
            this.heatPumpCompressorOil.material.map.needsUpdate = true;
            this.heatPumpCompressorOil.material.needsUpdate = true;
            this.heatPumpCompressorOilCrap.rotateZ(0.01);
            this.heatPumpCompressorOilDrops.material.map.offset.y += 0.004;
            this.heatPumpCompressorOilDrops.material.needsUpdate = true;

            if (this.scrollCompressorZP25K5EStatorDamagedSparkThrottling > 0 && this.scrollCompressorZP25K5EStatorDamagedSparkThrottling < 60) {
                if (!this.scrollCompressorZP25K5EStatorDamagedWiresSpark.visible) {
                    this.scrollCompressorShortToGroundSparkSound.offset = Math.random() * 1.5;
                    if (this.scrollCompressorShortToGroundSparkSound) {
                        if (this.nature.sounds) this.scrollCompressorShortToGroundSparkSound.play();
                    }
                    this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.visible = true;
                }

                this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.intensity = Math.floor(Math.random() * 15);
                let blue = Math.random();
                this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.color = new THREE.Color(Math.random() / 5, 0.0, blue > 0.5 ? blue : 0.5);

                this.scrollCompressorZP25K5EStatorDamagedWiresSpark.visible = true;
                this.scrollCompressorZP25K5EStatorDamagedWiresSpark.rotateX(Math.random());
                this.scrollCompressorZP25K5EStatorDamagedWiresSpark.rotateY(Math.random());
                this.scrollCompressorZP25K5EStatorDamagedWiresSpark.rotateZ(Math.random());
                this.scrollCompressorZP25K5EStatorDamagedWiresSpark.scale.set(Math.random(), Math.random(), Math.random());
            //     this.scrollCompressorZP25K5EStatorDamagedSparkSprite.visible = true;
            //     this.scrollCompressorZP25K5EStatorDamagedSparkSpriteMaterial.map = this.statorWindingSparkTexture[this.statorWindingSparkTextureCnt++];
            //     this.scrollCompressorZP25K5EStatorDamagedSparkSpriteMaterial.needsUpdate = true;
            //     if (this.statorWindingSparkTextureCnt > 3) this.statorWindingSparkTextureCnt = 0;
            } else {
                if (this.scrollCompressorZP25K5EStatorDamagedWiresSpark.visible) {
                    if (this.scrollCompressorShortToGroundSparkSound !== undefined) {
                        if (this.scrollCompressorShortToGroundSparkSound.isPlaying) this.scrollCompressorShortToGroundSparkSound.stop();
                    }
                }
                this.scrollCompressorZP25K5EStatorDamagedWiresSpark.visible = false;
                this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.visible = false;
                this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.intensity = 1.0;
                this.scrollCompressorZP25K5EStatorDamagedSparkEffectLight.color = new THREE.Color(0xffffff);
            //     this.scrollCompressorZP25K5EStatorDamagedSparkSprite.visible = false;
                if (this.scrollCompressorZP25K5EStatorDamagedSparkThrottling > 120 + Math.random() * 100) this.scrollCompressorZP25K5EStatorDamagedSparkThrottling = 0;
            }
            this.scrollCompressorZP25K5EStatorDamagedSparkThrottling++;
        }
    }

    onVLabStopAndHide() {
        this.stopFanMotor();
        this.stopScrollCompressor();
        this.contactorElectricArcEffect.stop();
    }

    onVLabResumeAndShow(initObj) {
        console.log(this.name + ' RESUMED');
        if (this.vLabLocator.prevCameraControlsType === 'pointerlock') {
            super.switchCameraControls({
                type: 'pointerlock',
                vLabLocator: true
            });
        }

        if (this.vLabLocator.context.tablet.currentActiveTabId == 2) {
            this.ACDisconnectDoorHingeCodeLock.visible = false;
            this.inventory.showToolboxBtn();
        } else {
            this.inventory.hideToolboxBtn();
            this.ACDisconnectDoorHingeCodeLock.visible = true;
        }
        if (this.vLabLocator.context.activatedMode == 'cool' && this.vLabLocator.context.HeatPumpACPower == true) {
            var roomTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
                tempId: 'roomTemperature',
                format: 'F'
            });
            var coolToTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
                tempId: 'coolToTemperature',
                format: 'F'
            });
            if (roomTemperature > coolToTemperature && this.vLabLocator.context.HeatPumpACPower == true) {
                let resumed = true;
                if (initObj !== undefined) {
                    if (initObj.autoResume !== undefined) {
                        resumed = initObj.autoResume;
                    }
                }
                this.contactorOn(resumed);
            } else {
                this.contactorOff();
            }
        } else {
            if (this.vLabLocator.context.activatedMode == 'cool') {
                this.contactorOn(true);
            }
        }
        this.shadowsSetup();
        this.toggleSounds();
        this.toggleThermostatOnScreenHelper();
        this.toggleHeatPumpAirFlow();
        this.toggleRefrigerantFlow1();
        this.toggleDirectionalRefrigerantFlow();
    }

    resetNormalOperaionDefaults() {
        this.heatPumpFrameCapUnscrewed = false;
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
            if (this.vLabLocator.context.activatedMode == 'cool') {
                if (this.fanMotorStarted) {
                    if (!this.fanMotorSound.isPlaying) this.fanMotorSound.play();
                }
                if (this.scrollCompressorStarted) {
                    if (!this.scrollCompressorSound.isPlaying) this.scrollCompressorSound.play();
                }
            }
        } else {
            this.vLabLocator.context.ambientSound.pause();
            if (this.fanMotorSound.isPlaying) this.fanMotorSound.stop();
            if (this.scrollCompressorSound.isPlaying) this.scrollCompressorSound.stop();
        }
    }

    toggleThermostatOnScreenHelper() {
        this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.setOnScreenHelperDisplay(this.nature.thermostatOnScreenHelper);
    }

    toggleRefrigerantFlow1() {
        if (this.gasFlow === undefined) setTimeout(this.toggleRefrigerantFlow1.bind(this), 250);
        if (this.vLabLocator.context.activatedMode == 'cool' && this.scrollCompressorStarted) {
            if (this.nature.refrigerantFlow1 === true) {
                this.gasFlow.start();
                if (this.nature.refrigerantFlow1Animated === true) {
                    this.gasFlow.startAnimation();
                }
            } else {
                this.gasFlow.stop();
            }
        } else {
            this.gasFlow.stop();
        }
    }

    toggleHeatPumpAirFlow() {
        this.ambientAirFlow1.visible = this.nature.heatPumpAirFlow && (this.vLabLocator.context.activatedMode == 'cool') && this.fanMotorStarted;
    }

    toggleDirectionalRefrigerantFlow() {
        if (this.vLabLocator.context.activatedMode == 'cool' 
         && this.scrollCompressorStarted 
         && this.vLabLocator.context.HeatPumpACPower == true) {
            if (this.nature.directionalRefrigerantFlow === true && this.scrollCompressorStarted == true) {
                this.startDirectionalRefrigerantFlow();
            } else {
                this.stopDirectionalRefrigerantFlow();
            }
        } else {
            this.stopDirectionalRefrigerantFlow();
        }
    }

    acPowerOff() {
        this.vLabLocator.context.HeatPumpACPower = false;

        this.trueRMSMultimeterHS36.setProbesElectricConditions({
            VADC: [
                {
                    testPoints: [
                        'contactor24VL',
                        'contactor24VR'
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 24.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor21'
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor11'
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor11'
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor21'
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground',
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor11'
                    ],
                    reading: 0.0
                },
            ],
            NCV: false,
            CONT: [
                {
                    testPoints: [
                        'contactor23b',
                        'contactor23t',
                    ],
                    reading: 0.4
                },
                {
                    testPoints: [
                        'contactor11',
                        'ground'
                    ],
                    reading: 0.8
                },
                {
                    testPoints: [
                        'contactor23t',
                        'ground'
                    ],
                    reading: 2.6
                },
                {
                    testPoints: [
                        'contactor23b',
                        'ground'
                    ],
                    reading: 2.8
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor11'
                    ],
                    reading: 1.2
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor11'
                    ],
                    reading: 1.2
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor21'
                    ],
                    reading: Infinity,
                    hv: 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor21'
                    ],
                    reading: Infinity,
                    hv: 0.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor11',
                    ],
                    reading: Infinity
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground'
                    ],
                    reading: Infinity
                },
            ]
        });

        if (this.vLabLocator.context.activatedMode.indexOf('cool') != -1) {
            if (this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.curState['roomTemperature'] > this.vLabLocator.context.ambientDefaultRoomTemperature) {
                this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.curState['roomTemperature'] -= 0.5;
            }
            this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.opacity = 0.4;
            this.shortToGroundEffectOff();
            this.stopFanMotor(true);
            this.stopScrollCompressor(true);
            this.onVLabResumeAndShow({
                autoResume: true
            });
        }
        if (this.heatPumpFrameCapUnscrewed == true) {
            this.heatPumpFrameCapTakeOutInteractor.activate();
        }
    }

    acPowerOn() {
        this.vLabLocator.context.HeatPumpACPower = true;

        this.trueRMSMultimeterHS36.setProbesElectricConditions({
            VADC: [
                {
                    testPoints: [
                        'contactor23b',
                        'contactor21'
                    ],
                    reading: 230.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor21'
                    ],
                    reading: 230.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 208.0 : 230.0
                },
                {
                    testPoints: [
                        'contactor11',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 208.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 150.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 150.0 : 0.0
                },
            ],
            NCV: true,
            CONT: [
                {
                    testPoints: [
                        'contactor23b',
                        'contactor23t',
                    ],
                    reading: 0.4
                },
                {
                    testPoints: [
                        'contactor11',
                        'ground'
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 'HV' : 0.8,
                    hv: 150.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'ground'
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 'HV' : 2.6,
                    hv: 150.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'ground'
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 'HV' : 2.8,
                    hv: 150.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor21'
                    ],
                    reading: 'HV',
                    hv: 230.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor21'
                    ],
                    reading: 'HV',
                    hv: 230.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor11',
                    ],
                    reading: Infinity
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground'
                    ],
                    reading: 'HV',
                    hv: 208.0
                },
            ]
        });

        this.vLabLocator.locations['HVACBaseAirHandler'].resetNormalOperaionDefaults();
        this.onVLabResumeAndShow({
            autoResume: true
        });
        this.heatPumpFrameCapTakeOutInteractor.deactivate();
    }

    startFanMotor(resumed) {
        if (this.fanMotorSoundReady !== true) {
            setTimeout(() => {
                this.startFanMotor(resumed);
            }, 500);
            return;
        }
        if (resumed !== true) {
            this.fanMotorSpeed = 0.0;
        } else {
            this.fanMotorSpeed = 0.5;
        }
        this.fanMotorStarted = true;
        if (this.nature.sounds === true) this.fanMotorSound.play();
    }

    stopFanMotor(offEffect) {
        if (offEffect === true) {
            if (this.fanMotorOffSound !== undefined) {
                if (this.nature.sounds === true) {
                    if (this.fanMotorStarted == true) {
                        this.fanMotorOffSound.play();
                    }
                }
            }
        }
        this.fanMotorStarted = false;
        if (this.fanMotorSound !== undefined) {
            if (this.nature.sounds === true) {
                if (this.fanMotorSound.isPlaying) this.fanMotorSound.stop();
            }
        }
    }

    startScrollCompressor(resumed) {
        if (this.scrollCompressorSoundReady !== true) {
            setTimeout(() => {
                this.startScrollCompressor(resumed);
            }, 500);
            return;
        }
        this.scrollCompressorStarted = true;
        if (this.nature.sounds === true) this.scrollCompressorSound.play();
        this.toggleRefrigerantFlow1();
        this.toggleHeatPumpAirFlow();
        this.toggleDirectionalRefrigerantFlow();
    }

    stopScrollCompressor(offEffect) {
        if (offEffect === true) {
            if (this.scrollCompressorStarted == true) {
                if (this.scrollCompressorOffSound !== undefined && this.nature.sounds === true) {
                    this.scrollCompressorOffSound.play();
                }
            }
        }
        this.scrollCompressorStarted = false;
        if (this.scrollCompressorSound !== undefined) {
            if (this.nature.sounds === true) {
                if (this.scrollCompressorSound.isPlaying) this.scrollCompressorSound.stop();
            }
        }
    }

    contactorOn(resumed) {
        if (this.contactorTraverse == undefined) {
            setTimeout(() => {
                console.log('contactorTraverse Object not ready yet');
                this.contactorOn(resumed);
            }, 500);
            return;
        }
        if (this.trueRMSMultimeterHS36 == undefined) {
            setTimeout(() => {
                console.log('trueRMSMultimeterHS36 Object not ready yet');
                this.contactorOn(resumed);
            }, 500);
            return;
        }
        if (this.contactorTraverse.position.z != 0.04988 && resumed !== true) {
            if (this.nature.sounds) this.contactorOnSound.play();
            if (this.vLabLocator.context.HeatPumpACPower == true) {
                this.contactorElectricArcEffect.start();
            }
        }
        this.contactorTraverse.position.z = 0.04988;//0.05188 - 0.002
        if (this.vLabLocator.context.HeatPumpACPower == true) {
            this.startScrollCompressor(resumed);
            this.startFanMotor(resumed);
        }
        this.trueRMSMultimeterHS36.setProbesElectricConditions({
            VADC: [
                {
                    testPoints: [
                        'contactor24VL',
                        'contactor24VR'
                    ],
                    reading: 24.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor21'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 230.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor11'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 230.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor11'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 150.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor21'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 230.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 208.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor11',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 208.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 150.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 150.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor11',
                    ],
                    reading: 0.5
                },
            ],
            CONT: [
                {
                    testPoints: [
                        'contactor24VL',
                        'contactor24VR',
                    ],
                    reading: 'HV',
                    hv: 24.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor11'
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 'HV' : 1.2,
                    hv: 230.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor11'
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 'HV' : 1.2,
                    hv: 230.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor11'
                    ],
                    reading: 0.4,
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor23t'
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 'HV' : 1.2,
                    hv: 150.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor23b'
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 'HV' : 1.2,
                    hv: 150.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground'
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 'HV' : 0.8,
                    hv: 208.0
                },
            ]
        });
    }

    contactorOff(offEffect) {
        if (offEffect) {
            if (this.nature.sounds) {
                this.contactorOffSound.play();
            }
            this.contactorElectricArcEffect.start();
    
            this.stopFanMotor(offEffect);
            this.stopScrollCompressor(offEffect);
        } else {
            this.stopFanMotor();
            this.stopScrollCompressor();
        }

        this.contactorTraverse.position.z = 0.05188;//0.04988 + 0.002

        this.trueRMSMultimeterHS36.setProbesElectricConditions({
            VADC: [
                {
                    testPoints: [
                        'contactor24VL',
                        'contactor24VR'
                    ],
                    reading: (this.vLabLocator.context.activatedMode == 'cool') ? 24.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor21'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 230.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor11'
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor11'
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor21'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 230.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor11'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 230.0 : 0.0,
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground',
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 230.0 : 0.0
                },
                {
                    testPoints: [
                        'contactor11',
                        'ground',
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor23t',
                        'ground',
                    ],
                    reading: 0.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'ground',
                    ],
                    reading: 0.0
                },
            ],
            CONT: [
                {
                    testPoints: [
                        'contactor24VL',
                        'contactor24VR',
                    ],
                    reading: 13.5,
                },
                {
                    testPoints: [
                        'contactor23t',
                        'contactor11'
                    ],
                    reading: 1.2
                },
                {
                    testPoints: [
                        'contactor23b',
                        'contactor11'
                    ],
                    reading: 1.2
                },
                {
                    testPoints: [
                        'contactor21',
                        'contactor11'
                    ],
                    reading: this.vLabLocator.context.HeatPumpACPower == true ? 'HV' : Infinity,
                    hv: 230.0
                },
                {
                    testPoints: [
                        'contactor21',
                        'ground'
                    ],
                    reading: (this.vLabLocator.context.HeatPumpACPower == true) ? 'HV' : Infinity,
                    hv: 230.0
                },
                {
                    testPoints: [
                        'contactor23b',
                        'ground'
                    ],
                    reading: 2.8
                },
                {
                    testPoints: [
                        'contactor23t',
                        'ground'
                    ],
                    reading: 2.6
                },
                {
                    testPoints: [
                        'contactor11',
                        'ground'
                    ],
                    reading: 0.8
                },
            ]
        });
    }

    startDirectionalRefrigerantFlow() {
        if (this.gasFlows1[this.nature.directionalRefrigerantFlowNum - 1] === undefined) {
            setTimeout(this.startDirectionalRefrigerantFlow.bind(this), 250);
            return;
        }
        for (var i = 0; i < this.nature.directionalRefrigerantFlowNum; i++) {
            var startDelay = i > 0 ? 500 * i : 0;
            this.gasFlows1[i].start(startDelay);
        }
    }

    stopDirectionalRefrigerantFlow() {
        if (this.gasFlows1[this.nature.directionalRefrigerantFlowNum - 1] === undefined) {
            setTimeout(this.stopDirectionalRefrigerantFlow.bind(this), 250);
            return;
        }
        for (var i = 0; i < this.nature.directionalRefrigerantFlowNum; i++) {
            this.gasFlows1[i].stop();
        }
    }

    heatPumpFrameCapTakeOutWithScrewdriver() {
        // this.heatPumpFrameCapInteractor.deactivate();
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
            this.ACDisconnectCaseZoomHelper_CloseUp.show();
            new TWEEN.Tween(this.vLabScene.getObjectByName('ACDisconnectDoor').rotation)
            .to({ x: -Math.PI }, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                if (this.heatPumpFrameCapTakenOut !== true) this.ACDisconnectClampInteractor.activate();
            })
            .start();
        } else {
            this.ACDisconnectClampInteractor.deactivate();
            this.ACDisconnectCaseZoomHelper_CloseUp.hide();
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
            if (this.vLabLocator.context.HeatPumpACPower == true) this.acPowerOff();
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
                if(this.vLabScene.getObjectByName('ACDisconnectClamp').rotation.y == 0.0) {
                    this.acPowerOn();
                }
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

    resetACDisconnect() {
        this.vLabScene.getObjectByName('ACDisconnectClamp').position.z = -0.747261;
        this.vLabScene.getObjectByName('ACDisconnectDoor').rotation.x = -Math.PI / 2;
        this.ACDisconnectCasezoomResetCallback();
        this.vLabLocator.context.HeatPumpACPower = true;
    }

    heatPumpFrameCapTakeOutInteractorHandler() {

        if (this.heatPumpFrameCapTakenOut == true) {
            this.resetHeatPumpFrameCap();
            this.heatPumpFrameCapTakenOut = false;
            return;
        }

        this.heatPumpFrameCapTakeOutInteractor.deactivate();
        this.bryantB225B_heatPumpFrameCap = this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameCap');

        this.nature.bryantB225B_heatPumpFrameCap = {
            position: this.bryantB225B_heatPumpFrameCap.position.clone(),
            rotation: this.bryantB225B_heatPumpFrameCap.rotation.clone(),
            takeOutInteractorSpritePos: this.heatPumpFrameCapTakeOutInteractor.handlerSprite.position.clone()
        };

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

                    this.heatPumpFrameCapTakeOutInteractor.handlerSprite.position.z = this.nature.bryantB225B_heatPumpFrameCap.position.z - 0.3;

                    this.ACDisconnectClampInteractor.deactivate();
                    this.heatPumpFrameCapTakeOutInteractor.activate();
                    this.heatPumpFrameCapTakenOut = true;

                });
            });
        });
    }

    resetHeatPumpFrameCap() {
        if (this.nature.bryantB225B_heatPumpFrameCap.position == undefined) return;

        this.vLabScene.getObjectByName('frameCapBolt1').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt2').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt3').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt4').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt5').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt6').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt7').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt8').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt10').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt11').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt12').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt13').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt14').visible = true;
        this.vLabScene.getObjectByName('frameCapBolt15').visible = true;
        this.heatPumpFrameCapTakeOutInteractor.deactivate();

        // if (this.vLabLocator.context.tablet.currentActiveTabId == 2 && this.vLabLocator.context.HeatPumpACPower == false) {
        //     this.heatPumpFrameCapTakeOutInteractor.activate();
        // } else {
        //     this.heatPumpFrameCapTakeOutInteractor.deactivate();
        // }
        this.heatPumpFrameCapTakeOutInteractor.handlerSprite.position.copy(this.nature.bryantB225B_heatPumpFrameCap.takeOutInteractorSpritePos);
        this.bryantB225B_heatPumpFrameCap = this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameCap');
        this.bryantB225B_heatPumpFrameCap.position.copy(this.nature.bryantB225B_heatPumpFrameCap.position);
        this.bryantB225B_heatPumpFrameCap.rotation.copy(this.nature.bryantB225B_heatPumpFrameCap.rotation);

        this.heatPumpFrameCapUnscrewed = false;

        this.vLabScene.getObjectByName('wire6').visible = true;
        this.vLabScene.getObjectByName('wire10').visible = true;
        this.vLabScene.getObjectByName('controlBoardOF2Wire').visible = true;

        this.vLabScene.getObjectByName('wire6Unplugged').visible = false;
        this.vLabScene.getObjectByName('controlBoardOF2WireUnplugged').visible = false;
        this.vLabScene.getObjectByName('wire10Unplugged').visible = false;
    }

    heatPumpFrameServicePanelTakeOutInteractorHandler() {
        if (this.heatPumpFrameServicePanelTakeOutInteractor.isDeactivated()) {
            this.resetHeatPumpFrameServicePanel();
        } else {
            this.heatPumpFrameServicePanelTakeOutInteractor.deactivate(true);
            this.bryantB225B_heatPumpFrameServicePanel = this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameServicePanel');
            this.nature.bryantB225B_heatPumpFrameServicePanelInitial = {
                position: this.bryantB225B_heatPumpFrameServicePanel.position.clone(),
                rotation: this.bryantB225B_heatPumpFrameServicePanel.rotation.clone(),
            };
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
    
            if (this.vLabLocator.context.tablet.currentActiveTabId == 1) {
                if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[3].completed === true) {
                    if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[4].completed === false) {
                        this.vLabLocator.context.tablet.initObj.content.tabs[1].items[4].completed = true;
                        this.vLabLocator.context.tablet.stepCompletedAnimation();
                    }
                }
            }
        }
    }

    resetHeatPumpFrameServicePanel() {
        if (this.nature.bryantB225B_heatPumpFrameServicePanelInitial.position == undefined) return;
        if (!this.heatPumpFrameServicePanelTakeOutInteractor.stayActive) this.heatPumpFrameServicePanelTakeOutInteractor.deactivate();
        this.heatPumpFrameServicePanelTakeOutInteractor.stayActive = false;
        this.bryantB225B_heatPumpFrameServicePanel = this.vLabScene.getObjectByName('bryantB225B_heatPumpFrameServicePanel');
        this.bryantB225B_heatPumpFrameServicePanel.position.copy(this.nature.bryantB225B_heatPumpFrameServicePanelInitial.position);
        this.bryantB225B_heatPumpFrameServicePanel.rotation.copy(this.nature.bryantB225B_heatPumpFrameServicePanelInitial.rotation);

        this.trueRMSMultimeterHS36.takenToInventory();
        this.selectedObject = this.trueRMSMultimeterHS36.model;
        this.takeObjectToInventory();
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
            rot: new THREE.Vector3(0.0, THREE.Math.degToRad(110.0), 0.0),
            attachedToMesh: this.vLabScene.getObjectByName('controlBoard')
        });
        this.trueRMSMultimeterHS36.setProbes({
            initialLocation: {
                blackNeedleShift: new THREE.Vector3(0.025, 0.0, 0.0),
                redNeedleShift: new THREE.Vector3(0.125, 0.0, 0.0)
            },
            probeWiresPathes: {
                redWire: [
                    new THREE.Vector3(0.260, 0.658, -0.428),
                    new THREE.Vector3(0.280, 0.659, -0.440),
                    new THREE.Vector3(0.189, 0.617, -0.486),
                    new THREE.Vector3(0.162, 0.360, -0.508),
                    new THREE.Vector3(0.198, 0.393, -0.488),
                    new THREE.Vector3(0.214, 0.487, -0.480),
                ],
                blackWire: [
                    new THREE.Vector3(0.253, 0.658, -0.447),
                    new THREE.Vector3(0.278, 0.662, -0.459),
                    new THREE.Vector3(0.189, 0.578, -0.502),
                    new THREE.Vector3(0.118, 0.352, -0.527),
                    new THREE.Vector3(0.197, 0.435, -0.522),
                    new THREE.Vector3(0.200, 0.487, -0.518),
                ]
            },
            devMode: false
        });
        this.trueRMSMultimeterHS36.model.getObjectByName('trueRMSMultimeterHS36Clamp').rotation.x = THREE.Math.degToRad(-180.0);
    }

    trueRMSMultimeterHS36ToContactor() {
        console.log('trueRMSMultimeterHS36ToContactor');
        this.takeOffObject(true);
        this.setInteractiveObjects("trueRMSMultimeterHS36");
        this.trueRMSMultimeterHS36.activate({
            pos: new THREE.Vector3(0.233, 0.6, -0.429),
            rot: new THREE.Vector3(0.0, THREE.Math.degToRad(110.0), 0.0),
            attachedToMesh: this.vLabScene.getObjectByName('contactor')
        });
        this.trueRMSMultimeterHS36.setProbes({
            initialLocation: {
                blackNeedleShift: new THREE.Vector3(0.025, 0.0, 0.0),
                redNeedleShift: new THREE.Vector3(0.125, 0.0, 0.0)
            },
            probeWiresPathes: {
                redWire: [
                    new THREE.Vector3(0.260, 0.608, -0.428),
                    new THREE.Vector3(0.280, 0.609, -0.440),
                    new THREE.Vector3(0.189, 0.567, -0.486),
                    new THREE.Vector3(0.162, 0.31, -0.508),
                    new THREE.Vector3(0.198, 0.343, -0.488),
                    new THREE.Vector3(0.214, 0.437, -0.480),
                ],
                blackWire: [
                    new THREE.Vector3(0.253, 0.608, -0.447),
                    new THREE.Vector3(0.278, 0.605, -0.459),
                    new THREE.Vector3(0.189, 0.528, -0.502),
                    new THREE.Vector3(0.118, 0.302, -0.527),
                    new THREE.Vector3(0.197, 0.385, -0.522),
                    new THREE.Vector3(0.200, 0.437, -0.518),
                ]
            },
            devMode: false
        });
        this.trueRMSMultimeterHS36.model.getObjectByName('trueRMSMultimeterHS36Clamp').rotation.x = THREE.Math.degToRad(-180.0);
    }

    showControlBoardZoomHelperCloseUp() {
        this.controlBoard_ZoomHelper_CloseUp.show();
    }

    heatPumpCompressorLookThrough() {
        this.heatPumpCompressorLookThroughInteractor.activate();
    }

    heatPumpCompressorLookThroughInteractorHandler() {
        var heatPumpCompressor = this.vLabScene.getObjectByName("bryantB225B_heatPumpCompressor");
        if (!heatPumpCompressor.material.alphaMap) {
            this.shortToGroundEffectOn();
        } else {
            this.shortToGroundEffectOff();
        }
        heatPumpCompressor.material.needsUpdate = true;
        this.heatPumpCompressorLookThroughInteractor.handlerSprite.material.needsUpdate = true;
    }

    shortToGroundEffectOn() {
        var heatPumpCompressor = this.vLabScene.getObjectByName("bryantB225B_heatPumpCompressor");
        heatPumpCompressor.material.alphaMap = this.heatPumpCompressorAlphaMap;
        heatPumpCompressor.material.side = THREE.DoubleSide;
        heatPumpCompressor.material.alphaTest = 0.5;
        heatPumpCompressor.material.transparent = true;
        this.heatPumpCompressorLookThroughInteractor.handlerSprite.material.opacity = 0.1;

        this.heatPumpCompressorOil.visible = true;
        if (this.vLabLocator.context.HeatPumpACPower == true) {
            this.heatPumpCompressorOilDisplacementTween.start();
            this.scrollCompressorZP25K5EStatorDamagedWires.visible = true;
            // this.scrollCompressorZP25K5EStatorDamagedSparkSprite.visible = true;
            // this.scrollCompressorZP25K5EStatorDamagedWiresSpark.visible = true;
            if (this.nature.sounds) this.scrollCompressorShortToGroundSparkSound.play();
        }

        heatPumpCompressor.material.needsUpdate = true;
        this.heatPumpCompressorLookThroughInteractor.handlerSprite.material.needsUpdate = true;
    }

    shortToGroundEffectOff() {
        var heatPumpCompressor = this.vLabScene.getObjectByName("bryantB225B_heatPumpCompressor");
        heatPumpCompressor.material.alphaMap = undefined;
        heatPumpCompressor.material.transparent = false;
        heatPumpCompressor.material.side = THREE.FrontSide;
        heatPumpCompressor.material.alphaTest = 0.0;
        this.heatPumpCompressorLookThroughInteractor.handlerSprite.material.opacity = 0.5;
        this.heatPumpCompressorOil.visible = false;
        if (this.heatPumpCompressorOilDisplacementTween !== undefined) this.heatPumpCompressorOilDisplacementTween.stop();
        // this.scrollCompressorZP25K5EStatorDamagedWires.visible = false;
        this.scrollCompressorZP25K5EStatorDamagedWiresSpark.visible = false;
        // this.scrollCompressorZP25K5EStatorDamagedSparkSprite.visible = false;
        if (this.nature.sounds) {
            if (this.scrollCompressorShortToGroundSparkSound !== undefined) {
                if (this.scrollCompressorShortToGroundSparkSound.isPlaying) {
                    this.scrollCompressorShortToGroundSparkSound.stop();
                }
            }
        }

        heatPumpCompressor.material.needsUpdate = true;
        this.heatPumpCompressorLookThroughInteractor.handlerSprite.material.needsUpdate = true;
    }

    serviceLocationPositioningCompleted() {
        if (this.vLabLocator.context.tablet.currentActiveTabId == 1) {
            if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[1].completed === true) {
                if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[2].completed === false) {
                    this.vLabLocator.context.tablet.initObj.content.tabs[1].items[2].completed = true;
                    this.vLabLocator.context.tablet.stepCompletedAnimation();
                    this.playSound('resources/assistant/snd/shortToGround/step3.mp3');
                }
            }
        }
    }

    zoomToContactorHandler() {
        if (this.offDelayTimeout !== undefined) clearTimeout(this.offDelayTimeout);

        // this.contactor_ZoomHelper_CloseUp.show();

        if (this.vLabLocator.context.tablet.currentActiveTabId == 1) {
            if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[4].completed === true) {

                if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[5].completed === false) {
                    this.vLabLocator.context.tablet.initObj.content.tabs[1].items[5].completed = true;
                    this.vLabLocator.context.tablet.stepCompletedAnimation();
                }

                if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[5].completed === true) {
                    if (this.vLabLocator.context.tablet.initObj.content.tabs[1].items[6].completed === false) {
                        var roomTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
                            tempId: 'roomTemperature',
                            format: 'F'
                        });
    
                        var coolToTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
                            tempId: 'coolToTemperature',
                            format: 'F'
                        });
    
                        if (roomTemperature > coolToTemperature) {
                            this.offDelayTimeout = setTimeout(this.zoomToContactorHandler.bind(this), 1000);
                            var extraInnerHtml = '';
                            extraInnerHtml += '<p style="font-size: 18px;">Indoor Temperature: <span style="font-weight: bold; color: #dbe8ff;">' + roomTemperature.toFixed(1) + ' °F</span></p>';
                            extraInnerHtml += '<p style="font-size: 18px;">Cool Setpoint: <span style="font-weight: bold; color: #ffffff;">' + Math.round(coolToTemperature) + ' °F</span></p>';
                            this.vLabLocator.context.tablet.showTabletShortToast(extraInnerHtml);
                            return;
                        } else {
                            this.vLabLocator.context.tablet.initObj.content.tabs[1].items[6].completed = true;
                            this.vLabLocator.context.tablet.stepCompletedAnimation();
                            this.contactorOff(true);
                            this.shortToGroundEffectOff();

                            this.toggleHeatPumpAirFlow();
                            this.toggleRefrigerantFlow1();
                            this.toggleDirectionalRefrigerantFlow();

                            return;
                        }
                    }
                }
            }
        }
    }

    ACDisconnectCaseZoomHelperHandler() {
        if (this.heatPumpFrameCapTakenOut == true) {
            this.ACDisconnectClampInteractor.deactivate();
        }
        if (this.vLabLocator.context.tablet.currentActiveTabId == 2) {
            if (this.vLabScene.getObjectByName('ACDisconnectDoor').rotation.x == -Math.PI) {
                if (this.heatPumpFrameCapTakenOut != true) this.ACDisconnectClampInteractor.activate();
                if (this.vLabScene.getObjectByName('ACDisconnectClamp').position.z != -0.5) {
                    this.ACDisconnectDoorInteractor.activate();
                } else {
                    this.ACDisconnectClampReverseInteractor.activate();
                }
            } else {
                this.ACDisconnectDoorInteractor.activate();
            }
        }
    }

    ACDisconnectCasezoomResetCallback() {
        this.ACDisconnectDoorInteractor.deactivate();
        this.ACDisconnectClampInteractor.deactivate();
        this.ACDisconnectClampReverseInteractor.deactivate();
    }


    onSchematicHelperOpened() {
        if (this.statsTHREE) {
            this.statsTHREE.domElement.style.display = 'none';
        }
        this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.setOnScreenHelperDisplay(false);
        this.vLabLocator.context.settings.hideButton();
        this.vLabLocator.context.tablet.hideButton();
        if (this.vLabLocator.context.tablet.currentActiveTabId == 2) {
            this.inventory.hideToolboxBtn();
        }
    }

    onSchematicHelperClosed() {
        if (this.statsTHREE) {
            this.statsTHREE.domElement.style.display = 'block';
        }
        this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.setOnScreenHelperDisplay(this.nature.thermostatOnScreenHelper);
        this.vLabLocator.context.settings.showButton();
        this.vLabLocator.context.tablet.showButton();
        if (this.vLabLocator.context.tablet.currentActiveTabId == 2) {
            this.inventory.showToolboxBtn();
        }
    }


    frameCapBoltUnscrew(argsObj) {
        this.selectedObject = this.BoshScrewdriver.model;
        this.takeOffObject(true);

        var delay = 50;

        // this.heatPumpFrameCapInteractor.deactivate();

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
                                                                                                                                                                                        this.heatPumpFrameCapUnscrewed = true;
                                                                                                                                                                                        if (this.vLabLocator.context.HeatPumpACPower == false) {
                                                                                                                                                                                            this.heatPumpFrameCapTakeOutInteractor.activate();
                                                                                                                                                                                        }
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