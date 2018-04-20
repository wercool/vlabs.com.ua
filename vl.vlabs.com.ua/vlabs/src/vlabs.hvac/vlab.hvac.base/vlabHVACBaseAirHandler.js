import * as THREE                   from 'three';
import VLab                         from '../../vlabs.core/vlab';

import Inventory                    from '../../vlabs.core/inventory';
import DetailedView                 from '../../vlabs.core/detailed-view';
import ZoomHelper                   from '../../vlabs.core/zoom-helper';
import TransformControls            from '../../vlabs.core/three-transformcontrols/index';
import VLabPositioner               from '../../vlabs.core/vlab-positioner';

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
            super.initialize().then((result) => {
                this.initialize(initObj);
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
            light1.position.set(-3.0, 3.0, 1.0);
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
                pos: new THREE.Vector3(-1.05, 1.75, 0.0),
                name: 'positionInFrontOfTheNish',
                scale: new THREE.Vector3(0.2, 0.2, 0.2),
                target: new THREE.Vector3(-1.0, 1.65, 0.0)
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
    }

    onRedererFrameEvent(event) {

    }
}