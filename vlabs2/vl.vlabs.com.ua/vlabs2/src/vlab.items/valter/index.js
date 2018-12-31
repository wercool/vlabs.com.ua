import * as THREE from 'three';
import * as VLabUtils from '../../vlab.fwk/utils/vlab.utils';
import * as THREEUtils from '../../vlab.fwk/utils/three.utils';
import VLabItem from '../../vlab.fwk/core/vlab.item';
/**
 * Valter VLabItem base class.
 * @class
 * @classdesc Valter The Robot.
 */
class Valter extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('/vlab.items/valter/resources/3d/textures/carbon_fibre.jpg')
        ])
        .then((result) => {
            var cableSleeveMaterialTexture = result[0];
            cableSleeveMaterialTexture.wrapS = cableSleeveMaterialTexture.wrapT = THREE.RepeatWrapping;
            cableSleeveMaterialTexture.repeat.set(4, 1);
            this.cableSleeveMaterial = new THREE.MeshLambertMaterial({
                wireframe: false,
                flatShading: false,
                map: cableSleeveMaterialTexture
            });

            this.initialize();
        });
    }
    /**
     * VLabItem onInitialized abstract function implementation; called from super.initialize()
     */
    onInitialized() {
        this.vLab.SceneDispatcher.currentVLabScene.add(this.vLabItemModel);
        this.setupInteractables();
        this.setupFramesAndLinks();
    }

    /**
     * Sets up Valter's kinematics frames and links
     */
    setupFramesAndLinks() {
        this.baseFrame      = this.vLabItemModel.getObjectByName('baseFrame');
        this.bodyFrame      = this.vLabItemModel.getObjectByName('bodyFrame');
        this.torsoFrame     = this.vLabItemModel.getObjectByName('torsoFrame');
        this.headFrame      = this.vLabItemModel.getObjectByName('headFrame');

        this.headTiltLink   = this.vLabItemModel.getObjectByName('headTiltLink');
        this.headYawLink    = this.vLabItemModel.getObjectByName('headYawLink');

        this.vLabItemModel.updateMatrixWorld();

        this.ValterLinks = {
            bodyFrameYaw: {
                value: this.bodyFrame.rotation.y,
                min: -1.35,
                max: 1.35,
                step: 0.01
            },
            torsoFrameTilt: {
                value: this.torsoFrame.rotation.x,
                min: -0.85,
                max: 0.0,
                step: 0.01
            },
            headTiltLink: {
                value: this.headTiltLink.rotation.x,
                min: 0.0,
                max: 1.0,
                step: 0.01
            },
            headYawLink: {
                value: this.headYawLink.rotation.y,
                min: -1.35,
                max: 1.35,
                step: 0.02
            }
        };
        this.initializeCableSleeves();
    }

    /**
     * 
     * Valter links manipulation
     * 
     */
    setBodyFrameYaw(value) {
        if (value >= this.ValterLinks.bodyFrameYaw.min && value <= this.ValterLinks.bodyFrameYaw.max) {
            this.ValterLinks.bodyFrameYaw.value = value;
            this.bodyFrame.rotation.y = this.ValterLinks.bodyFrameYaw.value;
            this.baseFrameToBodyFrameCableLGeometry.copy(new THREE.TubeBufferGeometry(this.getBaseFrameToBodyFrameCableLCurve(), this.baseFrameToBodyFrameSleeveSegments, 0.01, 5));
            this.baseFrameToBodyFrameCableRGeometry.copy(new THREE.TubeBufferGeometry(this.getBaseFrameToBodyFrameCableRCurve(), this.baseFrameToBodyFrameSleeveSegments, 0.01, 5));
        }
    }
    setTorsoFrameTilt(value) {
        if (value >= this.ValterLinks.torsoFrameTilt.min && value <= this.ValterLinks.torsoFrameTilt.max) {
            this.ValterLinks.torsoFrameTilt.value = value;
            this.torsoFrame.rotation.x = this.ValterLinks.torsoFrameTilt.value;
            this.bodyFrameToTorsoFrameCableLGeometry.copy(new THREE.TubeBufferGeometry(this.getBodyFrameToTorsoFrameCableLCurve(), this.bodyFrameToTorsoFrameSleeveSegments, 0.01, 5));
            this.bodyFrameToTorsoFrameCableRGeometry.copy(new THREE.TubeBufferGeometry(this.getBodyFrameToTorsoFrameCableRCurve(), this.bodyFrameToTorsoFrameSleeveSegments, 0.01, 5));
        }
    }
    setHeadTiltLink(value) {
        if (value >= this.ValterLinks.headTiltLink.min && value <= this.ValterLinks.headTiltLink.max) {
            this.ValterLinks.headTiltLink.value = value;
            this.headTiltLink.rotation.x = this.ValterLinks.headTiltLink.value * -1;
            this.torsoFrameToHeadFrameCableGeometry.copy(new THREE.TubeBufferGeometry(this.getTorsoFrameToHeadFrameCableCurve(), this.torsoFrameToHeadFrameSleeveSegments, 0.01, 5));
        }
    }
    setHeadYawLink(value) {
        if (value >= this.ValterLinks.headYawLink.min && value <= this.ValterLinks.headYawLink.max) {
            this.ValterLinks.headYawLink.value = value;
            this.headYawLink.rotation.y = this.ValterLinks.headYawLink.value;
            this.torsoFrameToHeadFrameCableGeometry.copy(new THREE.TubeBufferGeometry(this.getTorsoFrameToHeadFrameCableCurve(), this.torsoFrameToHeadFrameSleeveSegments, 0.01, 5));
        }
    }


    /**
     * Initialize Valter's cable sleeves assets
     */
    initializeCableSleeves() {
        this.torsoFrameCableOutput = new THREE.Object3D();
        this.torsoFrameCableOutput.position.set(0.0, 0.386, 0.102);
        this.torsoFrame.add(this.torsoFrameCableOutput);

        this.headFrameCableInput = new THREE.Object3D();
        this.headFrameCableInput.position.set(0.0, 0.057, -0.1);
        this.headFrame.add(this.headFrameCableInput);

        this.torsoFrameToHeadFrameSleeveSegments = 10;

        this.torsoFrameToHeadFrameCableGeometry = new THREE.TubeBufferGeometry(this.getTorsoFrameToHeadFrameCableCurve(), this.torsoFrameToHeadFrameSleeveSegments, 0.01, 5);
        this.torsoFrameToHeadFrameCableMesh = new THREE.Mesh(this.torsoFrameToHeadFrameCableGeometry, this.cableSleeveMaterial);
        this.torsoFrame.add(this.torsoFrameToHeadFrameCableMesh);



        this.torsoFrameCableInputL = new THREE.Object3D();
        this.torsoFrameCableInputL.position.set(-0.04, 0.139, 0.128);
        this.torsoFrame.add(this.torsoFrameCableInputL);

        this.torsoFrameCableInputR = new THREE.Object3D();
        this.torsoFrameCableInputR.position.set(0.04, 0.139, 0.128);
        this.torsoFrame.add(this.torsoFrameCableInputR);

        this.bodyFrameCableOutputL = new THREE.Object3D();
        this.bodyFrameCableOutputL.position.set(-0.083, 0.277, 0.119);
        this.bodyFrame.add(this.bodyFrameCableOutputL);

        this.bodyFrameCableOutputR = new THREE.Object3D();
        this.bodyFrameCableOutputR.position.set(0.083, 0.277, 0.119);
        this.bodyFrame.add(this.bodyFrameCableOutputR);

        this.bodyFrameToTorsoFrameSleeveSegments = 10;

        this.bodyFrameToTorsoFrameCableLGeometry = new THREE.TubeBufferGeometry(this.getBodyFrameToTorsoFrameCableLCurve(), this.bodyFrameToTorsoFrameSleeveSegments, 0.01, 5);
        this.bodyFrameToTorsoFrameCableLMesh = new THREE.Mesh(this.bodyFrameToTorsoFrameCableLGeometry, this.cableSleeveMaterial);
        this.torsoFrame.add(this.bodyFrameToTorsoFrameCableLMesh);

        this.bodyFrameToTorsoFrameCableRGeometry = new THREE.TubeBufferGeometry(this.getBodyFrameToTorsoFrameCableRCurve(), this.bodyFrameToTorsoFrameSleeveSegments, 0.01, 5);
        this.bodyFrameToTorsoFrameCableRMesh = new THREE.Mesh(this.bodyFrameToTorsoFrameCableRGeometry, this.cableSleeveMaterial);
        this.torsoFrame.add(this.bodyFrameToTorsoFrameCableRMesh);



        this.baseFrameCableOutputL = new THREE.Object3D();
        this.baseFrameCableOutputL.position.set(-0.04, 0.736, 0.209);
        this.baseFrame.add(this.baseFrameCableOutputL);

        this.baseFrameCableOutputR = new THREE.Object3D();
        this.baseFrameCableOutputR.position.set(0.041, 0.736, 0.209);
        this.baseFrame.add(this.baseFrameCableOutputR);

        this.bodyFrameCableInputL = new THREE.Object3D();
        this.bodyFrameCableInputL.position.set(-0.037, 0.373, 0.175);
        this.bodyFrame.add(this.bodyFrameCableInputL);

        this.bodyFrameCableInputR = new THREE.Object3D();
        this.bodyFrameCableInputR.position.set(0.037, 0.373, 0.175);
        this.bodyFrame.add(this.bodyFrameCableInputR);

        this.baseFrameToBodyFrameSleeveSegments = 16;

        this.baseFrameToBodyFrameCableLGeometry = new THREE.TubeBufferGeometry(this.getBaseFrameToBodyFrameCableLCurve(), this.baseFrameToBodyFrameSleeveSegments, 0.01, 5);
        this.baseFrameToBodyFrameCableLMesh = new THREE.Mesh(this.baseFrameToBodyFrameCableLGeometry, this.cableSleeveMaterial);
        this.baseFrame.add(this.baseFrameToBodyFrameCableLMesh);

        this.baseFrameToBodyFrameCableRGeometry = new THREE.TubeBufferGeometry(this.getBaseFrameToBodyFrameCableRCurve(), this.baseFrameToBodyFrameSleeveSegments, 0.01, 5);
        this.baseFrameToBodyFrameCableRMesh = new THREE.Mesh(this.baseFrameToBodyFrameCableRGeometry, this.cableSleeveMaterial);
        this.baseFrame.add(this.baseFrameToBodyFrameCableRMesh);
    }
    /**
     * Dynamic torsoFrame to headFrame cable sleeve curve
     */
    getTorsoFrameToHeadFrameCableCurve() {
        let xShift = 1 - ((this.ValterLinks.headYawLink.max - this.ValterLinks.headYawLink.value) / this.ValterLinks.headYawLink.max);
        let zShift = (this.ValterLinks.headTiltLink.max - this.ValterLinks.headTiltLink.value) / this.ValterLinks.headTiltLink.max;
        return new THREE.CatmullRomCurve3([
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableOutput)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableOutput)).add(new THREE.Vector3(0.0, 0.02, 0.02)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableOutput)).add(new THREE.Vector3((0.1 * xShift), 0.15, (0.08 * zShift))),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.headFrameCableInput)).add(new THREE.Vector3((0.02 * xShift), 0.0, 0.02)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.headFrameCableInput)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
        ]);
    }
    /**
     * Dynamic bodyFrame to torsoFrame cable sleeve curve (left)
     */
    getBodyFrameToTorsoFrameCableLCurve() {
        let shift = 1 - (this.ValterLinks.torsoFrameTilt.min - this.ValterLinks.torsoFrameTilt.value) / this.ValterLinks.torsoFrameTilt.min;
        return new THREE.CatmullRomCurve3([
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputL)).add(new THREE.Vector3(0.0, 0.004, -0.01)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputL)).add(new THREE.Vector3(0.0, -0.01, 0.03)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputL)).add(new THREE.Vector3(-0.02 + 0.02 * shift, -0.1 - 0.02 * shift, 0.06 - 0.02 * shift)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableOutputL)).add(new THREE.Vector3(0.0 + 0.02 * shift, 0.1 + 0.04 * shift, 0.05 + 0.1 * shift)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableOutputL)).add(new THREE.Vector3(0.0, 0.02, 0.0 + 0.02 * shift)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableOutputL)).add(new THREE.Vector3(0.0, -0.01, 0.0 - 0.02 * shift)),
        ]);
    }
    /**
     * Dynamic bodyFrame to torsoFrame cable sleeve curve (right)
     */
    getBodyFrameToTorsoFrameCableRCurve() {
        let shift = 1 - (this.ValterLinks.torsoFrameTilt.min - this.ValterLinks.torsoFrameTilt.value) / this.ValterLinks.torsoFrameTilt.min;
        return new THREE.CatmullRomCurve3([
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputR)).add(new THREE.Vector3(0.0, 0.004, -0.01)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputR)).add(new THREE.Vector3(0.0, -0.01, 0.03)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputR)).add(new THREE.Vector3(0.02 - 0.02 * shift, -0.1 - 0.02 * shift, 0.06 - 0.02 * shift)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableOutputR)).add(new THREE.Vector3(0.0 - 0.02 * shift, 0.1 + 0.04 * shift, 0.05 + 0.1 * shift)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableOutputR)).add(new THREE.Vector3(0.0, 0.02, 0.0 + 0.02 * shift)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableOutputR)).add(new THREE.Vector3(0.0, -0.01, 0.0 - 0.02 * shift)),
        ]);
    }
    /**
     * Dynamic baseFrame to bodyFrame cable sleeve curve (left)
     */
    getBaseFrameToBodyFrameCableLCurve() {
        let shift = 1 + (this.ValterLinks.bodyFrameYaw.min - this.ValterLinks.bodyFrameYaw.value) / this.ValterLinks.bodyFrameYaw.max;
        return new THREE.CatmullRomCurve3([
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.baseFrameCableOutputL)).add(new THREE.Vector3(0.0, -0.01, 0.0)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.baseFrameCableOutputL)).add(new THREE.Vector3(0.0, 0.04, 0.0)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.baseFrameCableOutputL)).add(new THREE.Vector3(-0.1 * shift, 0.2, 0.075 - 0.085 * Math.abs(shift))),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableInputL)).add(new THREE.Vector3(-0.05 * shift, -0.05, 0.075)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableInputL)).add(new THREE.Vector3(-0.05 * shift, 0.0, 0.02)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableInputL)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
        ]);
    }
    /**
     * Dynamic baseFrame to bodyFrame cable sleeve curve (right)
     */
    getBaseFrameToBodyFrameCableRCurve() {
        let shift = 1 + (this.ValterLinks.bodyFrameYaw.min - this.ValterLinks.bodyFrameYaw.value) / this.ValterLinks.bodyFrameYaw.max;
        return new THREE.CatmullRomCurve3([
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.baseFrameCableOutputR)).add(new THREE.Vector3(0.0, -0.01, 0.0)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.baseFrameCableOutputR)).add(new THREE.Vector3(0.0, 0.04, 0.0)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.baseFrameCableOutputR)).add(new THREE.Vector3(-0.1 * shift, 0.2, 0.075 - 0.085 * Math.abs(shift))),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableInputR)).add(new THREE.Vector3(-0.05 * shift, -0.05, 0.075)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableInputR)).add(new THREE.Vector3(-0.05 * shift, 0.0, 0.02)),
            this.baseFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableInputR)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
        ]);
    }

    /**
     * 
     * Interactions
     * 
     */

    /**
     * this.nature.interactables ['baseFrame'] interaction action function
     */
    baseFrameAction(event) {
        // this.vLab.SceneDispatcher.currentVLabScene.interactables['baseFrame'].actionFunctionActivated = false;
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('baseFrame').rotateY(0.02 * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['bodyFrame'] interaction action function
     */
    bodyFrameAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            // this.vLabItemModel.getObjectByName('bodyFrame').rotateY(0.01 * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            this.setBodyFrameYaw(this.ValterLinks.bodyFrameYaw.value + this.ValterLinks.bodyFrameYaw.step * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['torsoFrame'] interaction action function
     */
    torsoFrameAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            // this.vLabItemModel.getObjectByName('torsoFrame').rotateX(0.01 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
            this.setTorsoFrameTilt(this.ValterLinks.torsoFrameTilt.value + this.ValterLinks.torsoFrameTilt.step * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['headYawLink'] interaction action function reaction on X changes
     * this.nature.interactables ['headTiltLink'] interaction action function reaction on Y changes
     */
    headFrameAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            let deltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x);
            let deltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y);

            if (deltaX > deltaY) {
                this.setHeadYawLink(this.ValterLinks.headYawLink.value + this.ValterLinks.headYawLink.step * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            } else {
                this.setHeadTiltLink(this.ValterLinks.headTiltLink.value + this.ValterLinks.headTiltLink.step * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
            }
        }
        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    /**
     * Right side
     */
    /**
     * this.nature.interactables ['shoulderFrameR'] interaction action function
     */
    shoulderFrameRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('shoulderFrameR').rotateY(0.01 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['limbLinkR'] interaction action function
     */
    limbLinkRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('limbLinkR').rotateY(0.04 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['armR'] interaction action function
     */
    armRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            let deltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x);
            let deltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y);

            if (deltaX > deltaY) {
                this.vLabItemModel.getObjectByName('armR').rotateX(0.01 * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            } else {
                this.vLabItemModel.getObjectByName('forearmRollLinkR').rotateX(0.01 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['forearmFrameR'] interaction action function
     */
    forearmFrameRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            this.vLabItemModel.getObjectByName('forearmFrameR').rotateZ(0.04 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['forearmFrameL'] interaction action function
     */
    forearmFrameLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            this.vLabItemModel.getObjectByName('forearmFrameL').rotateZ(0.04 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    /**
     * Left side
     */
    /**
     * this.nature.interactables ['shoulderFrameL'] interaction action function
     */
    shoulderFrameLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('shoulderFrameL').rotateY(0.01 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['limbLinkL'] interaction action function
     */
    limbLinkLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('limbLinkL').rotateY(0.04 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['armL'] interaction action function
     */
    armLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            let deltaX = Math.abs(this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x);
            let deltaY = Math.abs(this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y);

            if (deltaX > deltaY) {
                this.vLabItemModel.getObjectByName('armL').rotateX(0.01 * ((this.prevActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            } else {
                this.vLabItemModel.getObjectByName('forearmRollLinkL').rotateX(0.01 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    /**
     * this.nature.interactables ['baseFrame'] interaction action invert function
     * this.nature.interactables ['bodyFrameAction'] interaction action invert function
     */
    commonInvAction() {
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.enable();
    }

    /**
     * Major preSelction based on ['baseFrame'] preSelection
     * this.nature.interactables['baseFrame'] onBaseFramePreselection / onBaseFrameDePreselection
     */
    onBaseFramePreselection(params) {
        let siblingInteractables = [];
        let baseFrame = this.vLab.SceneDispatcher.currentVLabScene.interactables['baseFrame'];
        baseFrame.siblings.forEach((siblingInteractable) => {
            siblingInteractables.push(siblingInteractable);
        });
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['bodyFrame']);


        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['torsoFrame']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['headYawLink']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['headTiltLink']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['headFrame']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['kinectHead']);


        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['shoulderFrameR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['armR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['limbLinkR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmRollLinkR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmFrameR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmTiltR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmR']);

        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P3R']);


        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['shoulderFrameL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['armL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['limbLinkL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmRollLinkL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmFrameL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmTiltL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmL']);


        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P3L']);

        siblingInteractables.forEach((siblingInteractable) => {
            siblingInteractable.keepPreselection = true;
            siblingInteractable.preselect(true);
        });
    }
    /**
     * Major de-preSelction
     */
    onBaseFrameDePreselection() {
        let siblingInteractables = [];
        let baseFrame = this.vLab.SceneDispatcher.currentVLabScene.interactables['baseFrame'];
        baseFrame.siblings.forEach((siblingInteractable) => {
            siblingInteractables.push(siblingInteractable);
        });
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['bodyFrame']);

        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['torsoFrame']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['headYawLink']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['headTiltLink']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['headFrame']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['kinectHead']);


        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['shoulderFrameR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['armR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['limbLinkR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmRollLinkR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmFrameR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmTiltR']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmR']);

        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P3R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P1R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P2R']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P3R']);


        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['shoulderFrameL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['armL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['limbLinkL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmRollLinkL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['forearmFrameL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmTiltL']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['palmL']);


        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger0P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger1P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger2P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger3P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger4P3L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P1L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P2L']);
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['finger5P3L']);

        siblingInteractables.forEach((siblingInteractable) => {
            siblingInteractable.keepPreselection = false;
            siblingInteractable.dePreselect();
        });
    }
}
export default Valter;