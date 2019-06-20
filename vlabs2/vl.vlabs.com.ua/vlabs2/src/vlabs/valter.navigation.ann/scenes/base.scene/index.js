import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

/**
 * VLab Items, VLabItems classes
 */
import Valter from '../../../../vlab.items/valter/index';
import ValterHeadIKDev from '../../../../vlab.items/valter/ik/dev/valter-head-ik-dev';
import ValterRightPalmIKDev from '../../../../vlab.items/valter/ik/dev/valter-right-palm-ik-dev';
import ValterLeftPalmIKDev from '../../../../vlab.items/valter/ik/dev/valter-left-palm-ik-dev';
import ValterSLAMDev from '../../../../vlab.items/valter/slam/dev/valter-slam-dev';



class BaseScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    /**
     * Override VLabScene.onLoaded and called when VLabScene nature JSON is loaded as minimum
     */
    onLoaded() {
        console.log('BaseScene onLoaded()');
        /**
         * Trace VLabScene object (this)
         */
        console.log(this);

        this.manager.performance.lowFPSThreshold = 0;

        var ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
        this.add(ambientLight);

        this.vLab.WebGLRenderer.gammaFactor = 1.5;

        // this.pointLight = new THREE.PointLight(0xffffff, 2.0);
        // this.pointLight.position.copy(new THREE.Vector3(0.0, 2.0, 0.0));
        // this.pointLight.castShadow = false;
        // this.pointLight.shadow.camera.near = 0.1;
        // this.pointLight.shadow.camera.far = 3.0;
        // this.pointLight.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
        // this.pointLight.shadow.mapSize.width = 1204;  // default 512
        // this.pointLight.shadow.mapSize.height = 1024; // default 512
        // this.add(this.pointLight);

        /**
         * Valter VLabItem
         */
        this.vLab['Valter'] = new Valter({
            vLab: this.vLab,
            natureURL: '/vlab.items/valter/resources/valter.nature.json',
            name: 'ValterVLabItem'
        });
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabItem: {
                    initialized: this.onVLabItemInitialized
                }
            }
        });
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabItem: {
                    auxilariesInitialized: this.onVLabItemAuxilariesInitialized
                }
            }
        });
    }

    onActivated() {

    }

    onVLabItemInitialized(event) {
        if (event.vLabItem == this.vLab['Valter']) {
            this.vLab['Valter'].setBaseFramePosition(new THREE.Vector3(0.0, 0.0, 1.0));

            // this.vLab['Valter'].setBaseFramePosition(new THREE.Vector3(0.0, 0.0, 0.0));

            /**
             * SLAM
             */
            // this.vLab['Valter'].cmd_vel = {
            //     linear: new THREE.Vector3(0.0, 0.0, this.vLab['Valter'].dynamics.maxLinearSpeed),
            //     angular: 0.0
            // };
            // this.vLab['Valter'].moveForward(true);
        }
    }

    onVLabItemAuxilariesInitialized(event) {
        /**
         * Head IK fit from FK tuples
         */
        // this.ValterHeadIKDev = new ValterHeadIKDev(this.vLab['Valter']);
        // this.ValterHeadIKDev.getValterHeadFKTuples();
        // this.ValterHeadIKDev.printHeadFKTuplesNormalizationBounds();
        // this.ValterHeadIKDev.fitAndSaveHeadTargetIKModel();
        // this.ValterHeadIKDev.saveValterHeadIKModelToLocalFile();

        /**
         * Right Palm IK fit from FK tuples
         */
        // this.ValterRightPalmIKDev = new ValterRightPalmIKDev(this.vLab['Valter']);
        // this.ValterRightPalmIKDev.getValterRightPalmFKTuples();
        // this.ValterRightPalmIKDev.printRightPalmFKTuplesNormalizationBounds(this.vLab['Valter'].ValterIK.rightPalmIKDataThrottlingSigma);
        // this.ValterRightPalmIKDev.fitAndSaveRightPalmTargetIKModel();
        // this.ValterRightPalmIKDev.saveValterRightPalmTargetIKModelToLocalFile();

        /**
         * Left Palm IK fit from FK tuples
         */
        // this.ValterLeftPalmIKDev = new ValterLeftPalmIKDev(this.vLab['Valter']);
        // this.ValterLeftPalmIKDev.getValterLeftPalmFKTuples();
        // this.ValterLeftPalmIKDev.printLeftPalmFKTuplesNormalizationBounds(this.vLab['Valter'].ValterIK.leftPalmIKDataThrottlingSigma);
        // this.ValterLeftPalmIKDev.fitAndSaveLeftPalmTargetIKModel();
        // this.ValterLeftPalmIKDev.saveValterLeftPalmTargetIKModelToLocalFile();

        /**
         * Valter SLAM Dev
         */
        this.ValterSLAMDev = new ValterSLAMDev(this.vLab['Valter']);
        this.ValterSLAMDev.getStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized()
        .then(() => {
            console.log(this.ValterSLAMDev.SLAMRGBDCmdVelOrientationTuplesNormalized);
        });
    }


}

export default BaseScene;