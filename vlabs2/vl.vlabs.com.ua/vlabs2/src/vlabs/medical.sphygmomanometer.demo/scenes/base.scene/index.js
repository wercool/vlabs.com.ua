import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as VLabUTILS from '../../../../vlab.fwk/utils/vlab.utils';
import * as TWEEN from '@tweenjs/tween.js';

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
        this.vLab['PneumaticSphygmomanometer'].vLabItemModel.position.copy(new THREE.Vector3(0.379, 0.867, -0.251));
        this.vLab['PneumaticSphygmomanometer'].vLabItemModel.quaternion.copy(new THREE.Quaternion(0.000, -0.987, 0.000, 0.162));
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

    }
    actualizeAcusticStethoscope() {
        this.vLab['AcusticStethoscope'].vLabItemModel.position.copy(new THREE.Vector3(0.380, 0.816, 0.193));
    }
    onPneumaticSphygmomanometerCuffPreselection() {
        this.pneumaticSphygmomanometerCuffPutDummy.visible = true;
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.keepPreselection = true;
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.preselect(true);
    }
    onPneumaticSphygmomanometerCuffDePreselection() {
        this.pneumaticSphygmomanometerCuffPutDummy.visible = false;
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.dePreselect();
        this.pneumaticSphygmomanometerCuffPutDummyInteractable.hideTooltip();
    }
    pneumaticSphygmomanometerCuff_ACTION_pneumaticSphygmomanometerCuffPutDummy() {
        this.pneumaticSphygmomanometerCuffPutDummy.visible = false;
        this.pneumaticSphygmomanometerCuffPut.visible = true;
        this.pneumaticSphygmomanometerCuff.vLabSceneObject.visible = false;
    }
}

export default SphygmomanometerDemoScene;