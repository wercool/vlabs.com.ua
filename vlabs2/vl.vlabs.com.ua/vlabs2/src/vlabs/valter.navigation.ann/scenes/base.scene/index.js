import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

/**
 * VLab Items
 */
import Valter from '../../../../vlab.items/valter/index';

/**
 * Valter models
 */
import ValterHeadFKTuple from '../../../../vlab.items/valter/ik/model/valter-head-fk-tuple';

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

        var ambientLight = new THREE.AmbientLight(0x404040, 0.2); // soft white light
        this.add(ambientLight);

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
    }

    onVLabItemInitialized(event) {
        if (event.vLabItem == this.vLab['Valter']) {
            // this.vLab['Valter'].setBaseFramePosition(new THREE.Vector3(0.0, 0.0, 1.0));
            this.vLab['Valter'].setBaseFramePosition(new THREE.Vector3(0.0, 0.0, 0.0));

            /**
             * Head FK tuples
             */
            // if (this.vLab['Valter'].nature.devHelpers.showKinectHeadDirection == true) {
            //     this.headFKTupleConsoleLogCnt = 0;

            //     this.vLab['Valter'].ValterLinks.headYawLink.step = 0.05;
            //     this.vLab['Valter'].ValterLinks.headTiltLink.step = 0.05;

            //     this.vLab['Valter'].setHeadYawLink(this.vLab['Valter'].ValterLinks.headYawLink.min);
            //     this.vLab['Valter'].setHeadTiltLink(this.vLab['Valter'].ValterLinks.headTiltLink.min);
            //     this.setValterHeadYaw = this.setValterHeadYaw.bind(this);
            //     this.setValterHeadTilt = this.setValterHeadTilt.bind(this);
            //     this.setValterHeadYaw();
            // } else {
            //     console.error('To get Valter Head FK tuples set Valter.nature.devHelpers.showKinectHeadDirection = true');
            // }
        }
    }
    /**
     * Head FK tuples
     */
    setValterHeadYaw() {
        if (this.vLab['Valter'].ValterLinks.headTiltLink.value + this.vLab['Valter'].ValterLinks.headTiltLink.step < this.vLab['Valter'].ValterLinks.headTiltLink.max) {
            this.setValterHeadTilt();
        } else {
            this.vLab['Valter'].setHeadTiltLink(this.vLab['Valter'].ValterLinks.headTiltLink.min);
            if (this.vLab['Valter'].ValterLinks.headYawLink.value + this.vLab['Valter'].ValterLinks.headYawLink.step < this.vLab['Valter'].ValterLinks.headYawLink.max) {
                this.vLab['Valter'].setHeadYawLink(this.vLab['Valter'].ValterLinks.headYawLink.value + this.vLab['Valter'].ValterLinks.headYawLink.step);
                this.setValterHeadTilt();
            }
        }
    }
    setValterHeadTilt() {
        this.vLab['Valter'].setHeadTiltLink(this.vLab['Valter'].ValterLinks.headTiltLink.value + this.vLab['Valter'].ValterLinks.headTiltLink.step);

        this.headFKTupleConsoleLogCnt++;
        console.log('headYaw = ' + this.vLab['Valter'].ValterLinks.headYawLink.value.toFixed(3), 'headTilt = ' + this.vLab['Valter'].ValterLinks.headTiltLink.value.toFixed(3), this.vLab['Valter'].ValterIK.headYawLinkHeadTargetDirection);
        if (this.headFKTupleConsoleLogCnt > 10) {
            this.headFKTupleConsoleLogCnt = 0;
            console.clear();
        }

        let headFKTuple = new ValterHeadFKTuple();
        headFKTuple.headTargetDirection.x = this.vLab['Valter'].ValterIK.headYawLinkHeadTargetDirection.x;
        headFKTuple.headTargetDirection.y = this.vLab['Valter'].ValterIK.headYawLinkHeadTargetDirection.y;
        headFKTuple.headTargetDirection.z = this.vLab['Valter'].ValterIK.headYawLinkHeadTargetDirection.z;
        headFKTuple.headYawLinkValue = parseFloat(this.vLab['Valter'].ValterLinks.headYawLink.value.toFixed(3));
        headFKTuple.headTiltLinkValue = parseFloat(this.vLab['Valter'].ValterLinks.headTiltLink.value.toFixed(3));

        this.vLab.VLabsRESTClientManager.ValterHeadIKService.saveHeadFKTuple(headFKTuple)
        .then(result => {
            this.setValterHeadYaw();
        });
    }
}

export default BaseScene;