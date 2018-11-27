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
     * VLabItem onInitialized abstract function implementation
     */
    onInitialized() {
        this.vLab.SceneDispatcher.currentVLabScene.add(this.vLabItemModel);
        this.setupSiblingIneractables();
    }


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
                this.vLabItemModel.getObjectByName('headYawLink').rotateY(0.02 * ((this.preActionInitialEventCoords.x - currentActionInitialEventCoords.x > 0.0) ? -1 : 1));
            } else {
                this.vLabItemModel.getObjectByName('headTiltLink').rotateX(0.01 * ((this.preActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1));
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