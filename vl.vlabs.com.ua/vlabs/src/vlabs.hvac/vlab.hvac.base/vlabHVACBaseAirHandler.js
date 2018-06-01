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
                    ])
                    .then((result) => {
                        this.envMapMetal = result[0];
                        this.lampHalo = result[1];

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
                action: this.nishDoorOpenOrClose
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
        var cameraControlConfig = Object.assign({
            forced: true, 
            initialZoom: 1.0,
            minDistance: 0.25,
            maxDistance: 1.0
        }, this.nature.cameraControls);
        super.switchCameraControls(cameraControlConfig);
    }

    onActivatedEvent() {
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
            opacity: 0.5
        });

        //VLab Items
        this.carrierTPWEM01 = new CarrierTPWEM01({
            context: this,
            pos: this.vLabScene.getObjectByName('carrierTPWEM01WallMount').position,
            rot: this.vLabScene.getObjectByName('carrierTPWEM01WallMount').rotation,
            name: 'carrierTPWEM01'
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
            positionDeltas: new THREE.Vector3(0.4, 0.15, 0.2), 
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

        this.initializeActions();
    }

    onRedererFrameEvent(event) {

    }

    /* VlabHVACBaseAirHandler Actions */
    initializeActions() {
        this.nishDoorClosed = true;
    }

    nishDoorOpenOrClose(caller) {
        caller.vLabInteractor.deactivate();
        new TWEEN.Tween(this.vLabScene.getObjectByName('nishDoor').rotation)
        .to({ z: (this.nishDoorClosed) ? (-Math.PI - Math.PI / 2) : -Math.PI }, 500)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(() => {
            caller.vLabInteractor.activate();
            this.nishDoorClosed = !this.nishDoorClosed;
        })
        .start();
    }
}