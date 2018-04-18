import * as THREE                   from 'three';
import VLab                         from '../../vlabs.core/vlab';

import Inventory                    from '../../vlabs.core/inventory';
import DetailedView                 from '../../vlabs.core/detailed-view';
import ZoomHelper                   from '../../vlabs.core/zoom-helper';
import TransformControls            from '../../vlabs.core/three-transformcontrols/index';

//VLab Items
import BoshScrewdriver              from '../../vlabs.items/boshScrewdriver';
import ClampMeterUEIDL479           from '../../vlabs.items/clampMeterUEIDL479';
import FatMaxScrewdriver            from '../../vlabs.items/fatMaxScrewdriver';
import ReversingValveEF17BZ251      from '../../vlabs.items/hvac/reversingValveEF17BZ251';
import ControlBoardCEBD430433       from '../../vlabs.items/hvac/controlBoardCEBD430433';
import ScrollCompressorZP25K5E      from '../../vlabs.items/hvac/scrollCompressorZP25K5E';

export default class VlabHVACBaseHeatPump extends VLab {
    constructor(initObj = {}) {
        super(initObj);

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

            var light0 = new THREE.AmbientLight(0xffffff, 0.4);
            this.vLabScene.add(light0);

            var light1 = new THREE.PointLight(0xffffff, 0.5);
            light1.position.set(0.0, 6.0, 3.0);
            this.vLabScene.add(light1);

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
                maxPolarAngle: Math.PI * 2
            },
            defaultCameraInitialPosition: new THREE.Vector3(0.0, 0.15, 0.1)
        });

        //Zoom helpers

        this.frameCapBolt10ZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "frameCapBolt10",
            minDistance: 0.35,
            positionDeltas: new THREE.Vector3(-0.01, 0.01, -0.02), 
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
            positionDeltas: new THREE.Vector3(-0.05, 0.0, 0.05), 
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

        this.ACDisconnectClampZoomHelper = new ZoomHelper({
            context: this,
            targetObjectName: "ACDisconnectClamp",
            minDistance: 0.25,
            positionDeltas: new THREE.Vector3(0.0, -0.1, 0.05), 
            scale: new THREE.Vector3(0.1, 0.1, 0.1),
            color: 0xfff495
        });

        this.contactror_ZoomHelper = new ZoomHelper({
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
            scale: new THREE.Vector3(0.075, 0.075, 0.075),
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

        // Misc helpers
        this.heatPumpFrameCap_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        this.heatPumpFrameCap_manipulationControl.setSize(0.5);
        this.vLabScene.add(this.heatPumpFrameCap_manipulationControl);
        this.heatPumpFrameCap_manipulationControl.attach(this.vLabScene.getObjectByName("bryantB225B_heatPumpFrameCap"));

        this.heatPumpFrameServicePanel_manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        this.heatPumpFrameServicePanel_manipulationControl.setSize(0.5);
        this.vLabScene.add(this.heatPumpFrameServicePanel_manipulationControl);
        this.heatPumpFrameServicePanel_manipulationControl.attach(this.vLabScene.getObjectByName("bryantB225B_heatPumpFrameServicePanel"));
    }

    onRedererFrameEvent(event) {

    }

    test(value) {
        console.log("TEST", value);
    }

    frameCapBoltUnscrew(argsObj) {
        console.log("frameCapBoltUnscrew", argsObj);

        var screwDriver = this.selectedObject;
        var appliedToBolt = this.vLabScene.getObjectByName(argsObj["arg"]);
        this.takeOffObject(true);
        screwDriver.position.copy(appliedToBolt.position.clone());
        screwDriver.rotation.z = -Math.PI / 2;
    }

}