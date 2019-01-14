import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as VLabUTILS from '../../../../vlab.fwk/utils/vlab.utils';
import * as TWEEN from '@tweenjs/tween.js';
import VLabZoomHelper  from '../../../../vlab.fwk/aux/scene/vlab.zoom.helper';

/**
 * VLab Items
 */
import PneumaticSphygmomanometer from '../../../../vlab.items/medical/equipment/PneumaticSphygmomanometer/index';
import AcusticStethoscope from '../../../../vlab.items/medical/equipment/AcusticStethoscope/index';

class SphygmomanometerDemoScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);

        this.prevActionInitialEventCoords = undefined;
    }
    /**
     * Called once scene is loaded
     */
    onLoaded() {
        var ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
        this.add(ambientLight);

        this.vLab.WebGLRenderer.gammaFactor = 2.0;

        this.currentControls.minDistance = 0.4;
        this.currentControls.maxDistance = 0.85;
        this.currentControls.minPolarAngle = THREE.Math.degToRad(50.0);
        this.currentControls.maxPolarAngle = THREE.Math.degToRad(120.0);

        /**
         * Event subscriptions
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabScene: {
                    interactableTaken:         this.onInteractableTaken,
                },
                VLabItem: {
                    interactablesInitialized:   this.onVLabItemInteractablesInitialized,
                }
            }
        });

        /**
         * PneumaticSphygmomanometer VLabItem
         */
        this.vLab['PneumaticSphygmomanometer'] = new PneumaticSphygmomanometer({
            vLab: this.vLab,
            natureURL: '/vlab.items/medical/equipment/PneumaticSphygmomanometer/resources/pneumaticSphygmomanometer.nature.json',
            name: 'PneumaticSphygmomanometerVLabItem'
        });

        /**
         * AcusticStethoscope VLabItem
         */
        this.vLab['AcusticStethoscope'] = new AcusticStethoscope({
            vLab: this.vLab,
            natureURL: '/vlab.items/medical/equipment/AcusticStethoscope/resources/acusticStethoscope.nature.json',
            name: 'AcusticStethoscopeVLabItem'
        });

        this.maleBodyArmature_Bone002 = this.getObjectByName('maleBodyArmature_Bone002');
        new TWEEN.Tween(this.maleBodyArmature_Bone002.quaternion)
        .to({z: 0.25}, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .delay(2000)
        .onComplete(() => {
            new TWEEN.Tween(this.maleBodyArmature_Bone002.quaternion)
            .to({z: 0.2413}, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        })
        .start();
    }

    onVLabItemInteractablesInitialized(event) {
        switch(event.vLabItem.constructor.name) {
            case 'PneumaticSphygmomanometer':
                this.actualizedPneumaticSphygmomanometer(event.vLabItem);
            break;
            case 'AcusticStethoscope':
                this.actualizeAcusticStethoscope(event.vLabItem);
            break;
        }
    }

    actualizedPneumaticSphygmomanometer() {
        this.vLab['PneumaticSphygmomanometer'].vLabItemModel.position.copy(new THREE.Vector3(0.259, 0.867, -0.119));
        this.vLab['PneumaticSphygmomanometer'].vLabItemModel.quaternion.copy(new THREE.Quaternion(0.000, -0.823, 0.000, 0.568));
        this.vLab['PneumaticSphygmomanometer'].setEnvMap(this.envSphereMapReflection);

        this.pneumaticSphygmomanometerCuffPut = this.vLab['PneumaticSphygmomanometer'].vLabItemModel.getObjectByName('pneumaticSphygmomanometerCuffPut');
        this.vLab['PneumaticSphygmomanometer'].vLabItemModel.remove(this.pneumaticSphygmomanometerCuffPut);
        this.pneumaticSphygmomanometerCuffPut.position.copy(new THREE.Vector3(0.030, 0.963, -0.507));
        this.pneumaticSphygmomanometerCuffPut.quaternion.copy(new THREE.Quaternion(-0.088, 0.000, 0.000, 0.996));
        this.add(this.pneumaticSphygmomanometerCuffPut);
        this.pneumaticSphygmomanometerCuffPut.visible = false;

        this.pneumaticSphygmomanometerCuffPutDummy = this.vLab['PneumaticSphygmomanometer'].vLabItemModel.getObjectByName('pneumaticSphygmomanometerCuffPutDummy');
        this.vLab['PneumaticSphygmomanometer'].vLabItemModel.remove(this.pneumaticSphygmomanometerCuffPutDummy);
        this.add(this.pneumaticSphygmomanometerCuffPutDummy);
        this.pneumaticSphygmomanometerCuffPutDummy.position.copy(new THREE.Vector3(0.030, 0.963, -0.507));
        this.pneumaticSphygmomanometerCuffPutDummy.quaternion.copy(new THREE.Quaternion(-0.088, 0.000, 0.000, 0.996));
        this.pneumaticSphygmomanometerCuffPutDummy.material.side = THREE.FrontSide;
        this.pneumaticSphygmomanometerCuffPutDummy.material.opacity = 0.5;
        this.pneumaticSphygmomanometerCuffPutDummy.visible = false;

        this.pneumaticSphygmomanometerCuff = this.vLab['PneumaticSphygmomanometer'].getInteractableByName('pneumaticSphygmomanometerCuff');
        this.pneumaticSphygmomanometerCuffPutDummyInteractable = this.vLab['PneumaticSphygmomanometer'].getInteractableByName('pneumaticSphygmomanometerCuffPutDummy');

        this.pneumaticSphygmomanometerCuff.addRespondent({
            interactable: this.pneumaticSphygmomanometerCuffPutDummyInteractable,
            callerInteractable: this.pneumaticSphygmomanometerCuff,
            preselectionTooltip: 'The sphygmomanometer cuff is applied here',
            action: {
                function: this.pneumaticSphygmomanometerCuff_ACTION_pneumaticSphygmomanometerCuffPutDummy,
                args: {},
                context: this
            }
        });

        this.pneumaticSphygmomanometerAppliedZoomHelper = new VLabZoomHelper({
            vLabScene: this,
            position: new THREE.Vector3(0.0, 1.5, 0.0),
            target: this.getObjectByName('pneumaticSphygmomanometerCuffPut').position,
            // tooltip: 'Zoom to',
            scaleFactor: 0.1,
            visibility: false,
            addToStack: false,
            name: 'pneumaticSphygmomanometerAppliedZoomHelper'
        });

    }
    actualizeAcusticStethoscope(AcusticStethoscope) {
        AcusticStethoscope.vLabItemModel.position.copy(new THREE.Vector3(0.380, 0.816, -0.587));
        AcusticStethoscope.interactables[0].initObj.interactable.noPutBack = false;
    }
    onPneumaticSphygmomanometerCuffPreselection() {
        this.pneumaticSphygmomanometerCuffPutDummy.visible = true;
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.keepPreselection = true;
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.preselect(true);
    }
    onPneumaticSphygmomanometerCuffDePreselection() {
        this.pneumaticSphygmomanometerCuffPutDummy.visible = false;
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.dePreselect(true);
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.hideTooltip();
    }
    /**
     * PneumaticSphygmomanometer applied to the arm
     */
    pneumaticSphygmomanometerCuff_ACTION_pneumaticSphygmomanometerCuffPutDummy() {
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.dePreselect(true);
        this.pneumaticSphygmomanometerCuffPutDummy.visible = false;
        this.pneumaticSphygmomanometerCuffPut.visible = true;
        this.pneumaticSphygmomanometerCuff.vLabSceneObject.visible = false;

        this.vLab['PneumaticSphygmomanometer'].putInFontOfCamera();

        if (!this.pneumaticSphygmomanometerAppliedZoomHelper.activated) {
            this.pneumaticSphygmomanometerAppliedZoomHelper.activateWithSelfInitObj().then(() => {
                this.vLab.SceneDispatcher.currentVLabScene.currentControls.setAzimutalRestrictionsFromCurrentTheta(0.2, -0.25);
                this.vLab.SceneDispatcher.currentVLabScene.currentControls.setPolarRestrictionsFromCurrentPhi(0.2, -0.2);
                this.vLab.SceneDispatcher.currentVLabScene.currentControls.rotateSpeed = 0.1;
                this.pneumaticSphygmomanometerAppliedZoomHelper.activated = true;
            });
        }

        let pneumaticSphygmomanometerMeterrubberBulb = this.vLab['PneumaticSphygmomanometer'].getInteractableByName('pneumaticSphygmomanometerMeterrubberBulb');
        pneumaticSphygmomanometerMeterrubberBulb.actionFunction = this.vLab['PneumaticSphygmomanometer'].pump;
        pneumaticSphygmomanometerMeterrubberBulb.actionFunctionContext = this.vLab['PneumaticSphygmomanometer'];
        pneumaticSphygmomanometerMeterrubberBulb.actionFunctionActivated = true;

        let pneumaticSphygmomanometerMeterValve = this.vLab['PneumaticSphygmomanometer'].getInteractableByName('pneumaticSphygmomanometerMeterValve');
        pneumaticSphygmomanometerMeterValve.actionFunctionActivated = true;
        pneumaticSphygmomanometerMeterValve.actionFunctionManipulatorActivated = true;

        this.vLab['PneumaticSphygmomanometer'].getInteractableByName('pneumaticSphygmomanometerMeterCasePlastic').actionFunctionActivated = true;
    }
    pneumaticSphygmomanometerCuffPut_TAKE(interactableFromAssembly) {
        this.vLab['PneumaticSphygmomanometer'].meterGaugeDePreselection();
        interactableFromAssembly.deSelect(true);

        this.pneumaticSphygmomanometerCuffPutDummy.visible = false;
        this.pneumaticSphygmomanometerCuffPut.visible = false;
        this.pneumaticSphygmomanometerCuff.vLabSceneObject.visible = true;

        this.vLab['PneumaticSphygmomanometer'].putBack();

        this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetAzimutalRestrictions();
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetPolarRestrictions();
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.rotateSpeed = 0.5;

        this.pneumaticSphygmomanometerAppliedZoomHelper.deactivate(false, true);
        this.pneumaticSphygmomanometerAppliedZoomHelper.activated = false;

        if (!this.vLab['AcusticStethoscope'].interactables[0].taken) {
            this.vLab['AcusticStethoscope'].interactables[0].take();
        }

        this.vLab['PneumaticSphygmomanometer'].getInteractableByName('pneumaticSphygmomanometerMeterCasePlastic').actionFunctionActivated = false;
    }
    AcusticStethoscope_ACTION_maleBody() {
        if (!this.vLab['AcusticStethoscope'].applied) {
            if (!this.pneumaticSphygmomanometerAppliedZoomHelper.activated) {
                this.pneumaticSphygmomanometerAppliedZoomHelper.activateWithSelfInitObj().then(() => {
                    this.vLab.SceneDispatcher.currentVLabScene.currentControls.setAzimutalRestrictionsFromCurrentTheta(0.2, -0.25);
                    this.vLab.SceneDispatcher.currentVLabScene.currentControls.setPolarRestrictionsFromCurrentPhi(0.2, -0.2);
                    this.vLab.SceneDispatcher.currentVLabScene.currentControls.rotateSpeed = 0.1;
                    this.pneumaticSphygmomanometerAppliedZoomHelper.activated = true;
                });
            }

            this.vLab.SceneDispatcher.putTakenInteractable({
                parent: this,
                position: undefined,
                quaternion: new THREE.Quaternion(),
                scale: new THREE.Vector3(1.0, 1.0, 1.0),
                materials: this.vLab['AcusticStethoscope'].vLabItemModel.userData['beforeTakenState'].materials
            });

            this.vLab['AcusticStethoscope'].interactables[0].vLabSceneObject.visible = false;

            this.AcusticStethoscopeSensor = this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject;
            this.vLab['AcusticStethoscope'].interactables[0].vLabSceneObject.remove(this.AcusticStethoscopeSensor);
            this.vLab.SceneDispatcher.currentVLabScene.add(this.AcusticStethoscopeSensor);
            this.AcusticStethoscopeSensor.visible = true;

            this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject.position.copy(this.getObjectByName('maleBodyStethoscopeAppliedDummy').position);
            this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject.rotation.y = 1.57

            this.vLab['AcusticStethoscope'].onApplied();

            this.vLab['AcusticStethoscope'].updateTube();

            this.vLab['AcusticStethoscope'].applied = true;

            this.vLab['PneumaticSphygmomanometer'].soundSupress = 0.1;
            this.vLab['PneumaticSphygmomanometer'].auscultationSoundVolume = 1.0;
        }
    }
    onInteractableTaken(event) {
        if (event.interactable.vLabItem == this.vLab['AcusticStethoscope']) {
            this.vLab['AcusticStethoscope'].onTakenOut();

            this.vLab['AcusticStethoscope'].interactables[0].deSelect(true);

            this.vLab['AcusticStethoscope'].interactables[0].initObj.interactable.noPutBack = true;

            this.vLab['AcusticStethoscope'].interactables[0].addRespondent({
                interactable: this.interactables['maleBodyStethoscopeAppliedDummy'],
                callerInteractable: this.vLab['AcusticStethoscope'].interactables[0],
                preselectionTooltip: 'Acustic Stethoscope could be applied',
                action: {
                    function: this.AcusticStethoscope_ACTION_maleBody,
                    args: {},
                    context: this
                }
            });

            if (this.vLab['PneumaticSphygmomanometer'].applied != true) {
                if (this.pneumaticSphygmomanometerAppliedZoomHelper.activated) {
                    this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetAzimutalRestrictions();
                    this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetPolarRestrictions();
                    this.vLab.SceneDispatcher.currentVLabScene.currentControls.rotateSpeed = 0.5;

                    this.pneumaticSphygmomanometerAppliedZoomHelper.deactivate(false, true);
                    this.pneumaticSphygmomanometerAppliedZoomHelper.activated = false;

                    this.vLab['AcusticStethoscope'].interactables[1].hideMenu(true);
                }
            }

            this.vLab['AcusticStethoscope'].applied = false;

            this.vLab['PneumaticSphygmomanometer'].soundSupress = 1.0;
            this.vLab['PneumaticSphygmomanometer'].auscultationSoundVolume = 0.0;
        }
    }
}

export default SphygmomanometerDemoScene;