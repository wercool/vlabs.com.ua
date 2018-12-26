import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as VLabUTILS from '../../../../vlab.fwk/utils/vlab.utils';
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
    }
    actualizeAcusticStethoscope() {
        this.vLab['AcusticStethoscope'].vLabItemModel.position.copy(new THREE.Vector3(0.380, 0.816, 0.193));
    }
}

export default SphygmomanometerDemoScene;