import * as THREE from 'three';
import VLabItem from '../../../../vlab.fwk/core/vlab.item';
import * as THREEUtils from '../../../../vlab.fwk/utils/three.utils';
import * as VLabUtils from '../../../../vlab.fwk/utils/vlab.utils';
import * as TWEEN from '@tweenjs/tween.js';

/**
 * PneumaticSphygmomanometer VLabItem base class.
 * @class
 * @classdesc Mercury Thermometer.
 */
class PneumaticSphygmomanometer extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        this.vLab = this.initObj.vLab;

        this.name = this.initObj.name ? this.initObj.name : 'PneumaticSphygmomanometer';

        this.applied = false;

        var textureLoader = new THREE.TextureLoader();

        this.cuffPressure = 0;
        this.cuffMaxPressure = 150;

        this.systolicPressure = 120;
        this.diastolicPressure = 70;

        this.soundSupress = 1.0;

        this.auscultationSoundVolume = 0.0;

        this.airLeak = this.airLeak.bind(this);

        this.clock = new THREE.Clock();

        Promise.all([
        ])
        .then((result) => {

            this.pumpAudio = new Audio();
            this.pumpAudio.src = '/vlab.items/medical/equipment/PneumaticSphygmomanometer/resources/sounds/pump.mp3';

            this.airLeakAudio = new Audio();
            this.airLeakAudio.loop = true;
            this.airLeakAudio.src = '/vlab.items/medical/equipment/PneumaticSphygmomanometer/resources/sounds/air-leak.mp3';

            this.systolicAudio = new Audio();
            this.systolicAudio.src = '/vlab.items/medical/equipment/PneumaticSphygmomanometer/resources/sounds/systolic.mp3';
            this.systolicAudio.volume = this.auscultationSoundVolume;

            this.tubeMaterial = new THREE.MeshPhongMaterial({
                color: 0x050505,
                shininess: 80.0,
                wireframe: false,
                flatShading: false,
                side: THREE.DoubleSide
            });

            this.initialize();
        });
    }

    /**
     * VLabItem onInitialized abstract function implementation; called from super.initialize()
     */
    onInitialized() {
        this.vLab.SceneDispatcher.currentVLabScene.add(this.vLabItemModel);

        this.setupInteractables()
        .then((interactables) => {
            /**
             * Conditionally add to Inventory interactables
             * (for VLabItem by default this.interactables[0] (this.vLabScenObject in the root of [0] Interactable) is added to Inventory)
             */
            if (this.nature.addToInvnentory == true) {
                this.interactables[0].takeToInventory();
                this.interactables[0]['vLabItem'] = this;
            }
            this.updateTube();
        });

        /**
         * Event subscriptions
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                window: {
                    resize: this.repositionPutInFronOfCameraOnScreenWidth
                },
                VLabSceneInteractable: {
                    transitTakenInteractable:         this.onTransitTakenInteractable
                },
                VLabScene: {
                    currentControlsUpdated:           this.onCurrentControlsUpdated.bind(this),
                }
            }
        });
    }
    /**
     * updateTube()
     */
    updateTube() {
        this.vLabItemModel.updateMatrixWorld();
        if (this.tubeMesh == undefined) {
            this.tubeInput = new THREE.Object3D();
// var geometry = new THREE.SphereBufferGeometry(0.005, 16, 16);
// var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// this.tubeInput = new THREE.Mesh(geometry, material);

            this.tubeInput.position.set(0.0, 0.0, 0,0);
            this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterTubeOtlet').add(this.tubeInput);

            this.cuffTubeInput = new THREE.Object3D();
// var geometry = new THREE.SphereBufferGeometry(0.003, 16, 16);
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
// this.cuffTubeInput = new THREE.Mesh(geometry, material);

            this.cuffTubeInput.position.set(-0.018, -0.045, 0.095);
            this.vLab.SceneDispatcher.currentVLabScene.getObjectByName('pneumaticSphygmomanometerCuffPut').add(this.cuffTubeInput);

            this.tubeGeometry = new THREE.TubeBufferGeometry(this.getTubeCurve(), 12, 0.003, 5);
            this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
            this.tubeMesh.name = 'pneumaticSphygmomanometerDynamicTube';
            this.tubeInput.add(this.tubeMesh);
        }
        if (this.applied) {
            this.tubeMesh.visible = true;
            this.tubeGeometry.copy(new THREE.TubeBufferGeometry(this.getTubeCurve(), 12, 0.003, 5));
        } else {
            this.tubeMesh.visible = false;
        }
    }
    /**
     * Dynamic cablecurve
     */
    getTubeCurve() {
        return new THREE.CatmullRomCurve3([
            this.tubeInput.worldToLocal(THREEUtils.getObjectWorldPosition(this.tubeInput)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
            this.tubeInput.worldToLocal(THREEUtils.getObjectWorldPosition(this.tubeInput)).add(new THREE.Vector3(-0.04, 0.0, 0.0)),
            this.tubeInput.worldToLocal(THREEUtils.getObjectWorldPosition(this.cuffTubeInput)).add(new THREE.Vector3(0.0, 0.05, 0.0)),
            this.tubeInput.worldToLocal(THREEUtils.getObjectWorldPosition(this.cuffTubeInput)).add(new THREE.Vector3(0.0, -0.02, 0.01)),
        ]);
    }
    /**
     * onTransitTakenInteractable
     * called from this.vLab.SceneDispatcher.transitTakenInteractable
     */
    onTransitTakenInteractable(event) {
        // console.log(event);
        let envSphereMapReflection = event.toScene.envSphereMapReflection ? event.toScene.envSphereMapReflection : null;
        this.setEnvMap(envSphereMapReflection);
    }
    setEnvMap(envSphereMapReflection) {
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseMetal').material.envMap = envSphereMapReflection;
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseMetal').material.needsUpdate = true;

        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterGlass').material.envMap = envSphereMapReflection;
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterGlass').material.needsUpdate = true;

        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseOutletMetal').material.envMap = envSphereMapReflection;
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseOutletMetal').material.needsUpdate = true;
    }
    /**
     * onApplied
     */
    onApplied() {
    }
    /**
     * onTakenOut
     */
    onTakenOut() {
    }
    /**
     * meterGaugePreselection
     */
    meterGaugePreselection(params) {
        let callerInteractable = params.callerInteractable;

        this.getInteractableByName('pneumaticSphygmomanometerMeterGlass').preselectSibligns();

        let assemblyInteractables = [];
        if (callerInteractable !== this.getInteractableByName('pneumaticSphygmomanometerMeterGlass')) assemblyInteractables.push(this.getInteractableByName('pneumaticSphygmomanometerMeterGlass'));
        if (callerInteractable !== this.getInteractableByName('pneumaticSphygmomanometerMeterCasePlastic')) assemblyInteractables.push(this.getInteractableByName('pneumaticSphygmomanometerMeterCasePlastic'));
        assemblyInteractables.forEach((assemblyInteractable) => {
            assemblyInteractable.keepPreselection = true;
            assemblyInteractable.preselect(true, {
                preselectionAction: false,
                tooltip: false
            });
        });
    }
    /**
     * meterGaugeDePreselection
     */
    meterGaugeDePreselection(params) {
        let callerInteractable = (params) ? params.callerInteractable : undefined;
        if (callerInteractable) callerInteractable.dePreselectSibligns();
        this.getInteractableByName('pneumaticSphygmomanometerMeterGlass').dePreselectSibligns();
        let assemblyInteractables = [];
        assemblyInteractables.push(this.getInteractableByName('pneumaticSphygmomanometerMeterGlass'));
        assemblyInteractables.push(this.getInteractableByName('pneumaticSphygmomanometerMeterCasePlastic'));
        assemblyInteractables.forEach((assemblyInteractable) => {
            assemblyInteractable.keepPreselection = false;
            assemblyInteractable.dePreselect();
        });
    }
    /**
     * meterGaugeSelection
     */
    meterGaugeSelection() {
        this.interactables[0].select({selectionAction: false}, true);
        this.interactables[0].showMenu();
    }
    putInFontOfCamera() {
        this.applied = true;

        this.vLabItemModel.userData['beforeTakenState'] = {
            "position": this.vLabItemModel.position.clone(),
            "quaternion": this.vLabItemModel.quaternion.clone()
        };

        this.getInteractableByName('pneumaticSphygmomanometerMeterGlass').intersectable = false;

        this.vLab.SceneDispatcher.currentVLabScene.remove(this.vLabItemModel);
        this.vLab.SceneDispatcher.currentVLabScene.currentCamera.add(this.vLabItemModel);

        this.vLabItemModel.position.copy(new THREE.Vector3(-0.115, 0.029, -0.188));

        this.putInFontOfCameraPosition = this.vLabItemModel.position.clone();

        this.vLabItemModel.quaternion.copy(new THREE.Quaternion(0.110, 0.638, 0.741, -0.180));

        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerTube').visible = false;

        this.repositionPutInFronOfCameraOnScreenWidth();
    }

    putBack() {
        this.applied = false;

        this.tubeMesh.visible = false;

        this.getInteractableByName('pneumaticSphygmomanometerMeterGlass').intersectable = true;

        this.vLab.SceneDispatcher.currentVLabScene.currentCamera.remove(this.vLabItemModel);
        this.vLab.SceneDispatcher.currentVLabScene.add(this.vLabItemModel);

        this.vLabItemModel.position.copy(this.vLabItemModel.userData['beforeTakenState'].position);
        this.vLabItemModel.quaternion.copy(this.vLabItemModel.userData['beforeTakenState'].quaternion);

        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerTube').visible = true;

        this.vLabItemModel.userData['beforeTakenState'] = null;

        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterArrow').rotation.y = 0.0;
        this.cuffPressure = 0.0;

        this.airLeakAudio.pause();
        this.airLeakAudioPlaying = false;
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterValve').rotation.x = 0.0;
        this.pumpAudio.pause();

        this.systolicAudioPlaying = false;
        this.systolicAudio.pause();
        this.systolicAudio.currentTime = 0;
    }

    repositionPutInFronOfCameraOnScreenWidth() {
        if (this.applied) {
            let shift = (1600 - this.vLab.DOMManager.WebGLContainer.clientWidth) / 14000;
            if (this.vLab.DOMManager.WebGLContainer.clientWidth < 800 && this.vLab.DOMManager.WebGLContainer.clientWidth > 360) {
                shift = (1600 - this.vLab.DOMManager.WebGLContainer.clientWidth) / 10000;
            }
            if (this.vLab.DOMManager.WebGLContainer.clientWidth > 360 && this.vLab.DOMManager.WebGLContainer.clientWidth < 500) {
                shift = (1600 - this.vLab.DOMManager.WebGLContainer.clientWidth) / 12000;
            }
            if (this.vLab.DOMManager.WebGLContainer.clientWidth > 800 && this.vLab.DOMManager.WebGLContainer.clientWidth < 1200) {
                shift = (1600 - this.vLab.DOMManager.WebGLContainer.clientWidth) / 7000;
            }
            this.vLabItemModel.position.copy(this.putInFontOfCameraPosition.clone().add(new THREE.Vector3(shift, 0.0, 0.0)));
            this.updateTube();
        }
    }

    /**
     * onCurrentControlsUpdated
     */
    onCurrentControlsUpdated(event) {
        if (this.applied) {
            this.updateTube();
        }
    }

    /**
     * this.nature.interactables ['baseFrame'] interaction action invert function
     * this.nature.interactables ['bodyFrameAction'] interaction action invert function
     */
    commonInvAction() {
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.enable();
    }

    /**
     * Pump
     */
    pump() {
        if (this.pumpTWEEN == undefined) {
            let pneumaticSphygmomanometerMeterrubberBulb = this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterrubberBulb');
            let pneumaticSphygmomanometerMeterArrow = this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterArrow');

            if (this.cuffPressure < this.cuffMaxPressure) {
                this.pumpTWEEN = new TWEEN.Tween(pneumaticSphygmomanometerMeterrubberBulb.scale)
                .to({x: 0.7, z: 1.2}, 200)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .yoyo(true)
                .repeat(1)
                .onComplete(() => {
                    this.pumpTWEEN = undefined;
                })
                .start();

                this.pumpAudio.pause();
                this.pumpAudio.currentTime = 0.0;
                this.pumpAudio.play();
                this.pumpAudio.volume = this.soundSupress;

                new TWEEN.Tween(pneumaticSphygmomanometerMeterArrow.rotation)
                .to({y: pneumaticSphygmomanometerMeterArrow.rotation.y - (0.2 + (this.cuffMaxPressure - this.cuffPressure) / 1000)}, 200)
                .easing(TWEEN.Easing.Elastic.InOut)
                .onComplete(() => {
                    new TWEEN.Tween(pneumaticSphygmomanometerMeterArrow.rotation)
                    .to({y: pneumaticSphygmomanometerMeterArrow.rotation.y + 0.05}, 500)
                    .easing(TWEEN.Easing.Elastic.InOut)
                    .onComplete(() => {
                        this.cuffPressure = (pneumaticSphygmomanometerMeterArrow.rotation.y / -0.195555937) * 10;
                    })
                    .start();
                })
                .start();
            }
        }
    }
    /**
     * valveAction
     */
    valveAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);
        let pneumaticSphygmomanometerMeterValve = this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterValve');

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            let direction = ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1);
            if ((direction == 1 && pneumaticSphygmomanometerMeterValve.rotation.x < 0.25)
            || (direction == -1 && pneumaticSphygmomanometerMeterValve.rotation.x > 0.0)) {
                pneumaticSphygmomanometerMeterValve.rotateX((direction == 1) ? (0.01 * direction) : (0.02 * direction));
            }
        }

        this.airLeak();

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * Air leak simulation
     */
    airLeak() {
        let pneumaticSphygmomanometerMeterValve = this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterValve');
        if (pneumaticSphygmomanometerMeterValve.rotation.x > 0) {
            if (this.cuffPressure > 0.0) {
                if (pneumaticSphygmomanometerMeterValve.rotation.x < 1.0) {
                    this.airLeakAudio.volume = pneumaticSphygmomanometerMeterValve.rotation.x * this.soundSupress;
                }
                if (!this.airLeakAudioPlaying) {
                    this.airLeakAudio.play();
                    this.airLeakAudioPlaying = true;
                }

                let pneumaticSphygmomanometerMeterArrow = this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterArrow');
                pneumaticSphygmomanometerMeterArrow.rotation.y += 0.00003;
                this.cuffPressure = (pneumaticSphygmomanometerMeterArrow.rotation.y / -0.195555937) * 10;

// console.log(this.cuffPressure);

                if (this.cuffPressure <= this.systolicPressure && this.cuffPressure >= this.diastolicPressure) {
                    this.systolicAudio.volume = this.auscultationSoundVolume;
                    if (!this.systolicAudioPlaying) {
                        this.systolicAudio.play();
                        this.systolicAudioPlaying = true;
                    }

                    let systolicFlutter = true;
                    if (this.systolicTemp !== undefined) {
                        systolicFlutter = (this.clock.getElapsedTime() - this.systolicTemp > 0.85);
                    }
                    if (systolicFlutter == true || this.systolicTemp == undefined) {
                        this.systolicTemp = this.clock.getElapsedTime();
                        pneumaticSphygmomanometerMeterArrow.rotation.y -= 0.01;
                        // new TWEEN.Tween(pneumaticSphygmomanometerMeterArrow.rotation)
                        // .to({y: pneumaticSphygmomanometerMeterArrow.rotation.y - 0.01}, 50)
                        // .easing(TWEEN.Easing.Elastic.InOut)
                        // .start();
                    } else {
                        pneumaticSphygmomanometerMeterArrow.rotation.y += 0.00002;
                    }
                } else {
                    this.systolicAudioPlaying = false;
                    this.systolicAudio.currentTime = 0.0;
                    this.systolicAudio.pause();
                }

                setTimeout(this.airLeak, 50);

            } else {
                if (this.airLeakAudioPlaying) {
                    this.airLeakAudio.pause();
                    this.airLeakAudioPlaying = false;
                }
            }
        }
    }
    /**
     * Move sphygmomanometer
     */
    move(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
        let directionX = ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? 1 : -1);
        let directionZ = ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1);

        let deltaX = Math.min(5, Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x));
        let deltaZ = Math.min(5, Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y));

        let pneumaticSphygmomanometerMeterCasePlastic = this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCasePlastic');
        if (event.event.touches !== undefined) {
            pneumaticSphygmomanometerMeterCasePlastic.translateX(0.0002 * directionX * deltaX);
            pneumaticSphygmomanometerMeterCasePlastic.translateZ(0.0002 * directionZ * deltaZ);
        } else {
            pneumaticSphygmomanometerMeterCasePlastic.translateX(0.0005 * directionX * deltaX);
            pneumaticSphygmomanometerMeterCasePlastic.translateZ(0.0005 * directionZ * deltaZ);
        }

        this.updateTube();

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
}
export default PneumaticSphygmomanometer;