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
        this.setupSiblingIneractables();
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

        this.torsoFrameToHeadFrameSleeveSegments = 16;

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
// var geometry = new THREE.SphereBufferGeometry(0.01, 10, 10);
// var material = new THREE.MeshBasicMaterial({color: 0xffff00});
// this.bodyFrameCableOutputR = new THREE.Mesh(geometry, material);
        this.bodyFrameCableOutputR.position.set(0.083, 0.277, 0.119);
        this.bodyFrame.add(this.bodyFrameCableOutputR);

        this.bodyFrameToTorsoFrameSleeveSegments = 16;

        this.bodyFrameToTorsoFrameCableGeometry = new THREE.TubeBufferGeometry(this.getBodyFrameToTorsoFrameCableCurve(), this.bodyFrameToTorsoFrameSleeveSegments, 0.01, 5);
        this.bodyFrameToTorsoFrameCableMesh = new THREE.Mesh(this.bodyFrameToTorsoFrameCableGeometry, this.cableSleeveMaterial);
        this.torsoFrame.add(this.bodyFrameToTorsoFrameCableMesh);
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
     * Dynamic bodyFrame to torsoFrame cable sleeve curve (left and right)
     */
    getBodyFrameToTorsoFrameCableCurve() {
        return new THREE.CatmullRomCurve3([
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputL)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.torsoFrameCableInputL)).add(new THREE.Vector3(0.0, 0.0, 0.02)),
            this.torsoFrame.worldToLocal(THREEUtils.getObjectWorldPosition(this.bodyFrameCableOutputL)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
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

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('baseFrame').rotateY(0.02 * ((this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['bodyFrame'] interaction action function
     */
    bodyFrameAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('bodyFrame').rotateY(0.01 * ((this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['torsoFrame'] interaction action function
     */
    torsoFrameAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('torsoFrame').rotateX(0.01 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['headYawLink'] interaction action function reaction on X changes
     * this.nature.interactables ['headTiltLink'] interaction action function reaction on Y changes
     */
    headFrameAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            let deltaX = Math.abs(this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x);
            let deltaY = Math.abs(this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y);

            if (deltaX > deltaY) {
                this.setHeadYawLink(this.ValterLinks.headYawLink.value + this.ValterLinks.headYawLink.step * ((this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            } else {
                this.setHeadTiltLink(this.ValterLinks.headTiltLink.value + this.ValterLinks.headTiltLink.step * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
            }
        }
        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    /**
     * Right side
     */
    /**
     * this.nature.interactables ['shoulderFrameR'] interaction action function
     */
    shoulderFrameRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('shoulderFrameR').rotateY(0.01 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['limbLinkR'] interaction action function
     */
    limbLinkRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('limbLinkR').rotateY(0.04 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['armR'] interaction action function
     */
    armRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            let deltaX = Math.abs(this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x);
            let deltaY = Math.abs(this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y);

            if (deltaX > deltaY) {
                this.vLabItemModel.getObjectByName('armR').rotateX(0.01 * ((this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            } else {
                this.vLabItemModel.getObjectByName('forearmRollLinkR').rotateX(0.01 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
            }
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['forearmFrameR'] interaction action function
     */
    forearmFrameRAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            this.vLabItemModel.getObjectByName('forearmFrameR').rotateZ(0.04 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['forearmFrameL'] interaction action function
     */
    forearmFrameLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            this.vLabItemModel.getObjectByName('forearmFrameL').rotateZ(0.04 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    /**
     * Left side
     */
    /**
     * this.nature.interactables ['shoulderFrameL'] interaction action function
     */
    shoulderFrameLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('shoulderFrameL').rotateY(0.01 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['limbLinkL'] interaction action function
     */
    limbLinkLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLabItemModel.getObjectByName('limbLinkL').rotateY(0.04 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? -1 : 1));
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }
    /**
     * this.nature.interactables ['armL'] interaction action function
     */
    armLAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);

        if (this.preActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();

            let deltaX = Math.abs(this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x);
            let deltaY = Math.abs(this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y);

            if (deltaX > deltaY) {
                this.vLabItemModel.getObjectByName('armL').rotateX(0.01 * ((this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            } else {
                this.vLabItemModel.getObjectByName('forearmRollLinkL').rotateX(0.01 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
            }
        }

        this.preActionInitialEventCoords = new THREE.Vector2();
        this.preActionInitialEventCoords.copy(currentActionInitialEventCoords);
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
            siblingInteractable.keepPreseleciton = true;
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
            siblingInteractable.keepPreseleciton = false;
            siblingInteractable.dePreselect();
        });
    }
}
export default Valter;