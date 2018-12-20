import * as THREE from 'three';
import * as THREEUtils from '../../../../vlab.fwk/utils/three.utils';
import VLabItem from '../../../../vlab.fwk/core/vlab.item';
/**
 * AcusticStethoscope VLabItem base class.
 * @class
 * @classdesc Acustic Stethoscope.
 */
class AcusticStethoscope extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        this.vLab = this.initObj.vLab;

        this.name = this.initObj.name ? this.initObj.name : 'AcusticStethoscope';

        this.applied = false;

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
        ])
        .then((result) => {

            this.tubeMaterial = new THREE.MeshPhongMaterial({
                color: 0x0d1d3d,
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

            this.sensor =  this.interactables[1].vLabSceneObject;
        });


        /**
         * Event subscriptions
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
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
        this.sensor.updateMatrixWorld();
        if (this.tubeMesh == undefined) {
            this.tubeInput = new THREE.Object3D();
// var geometry = new THREE.SphereBufferGeometry(0.005, 16, 16);
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
// this.tubeInput = new THREE.Mesh( geometry, material );

            this.tubeInput.position.set(-0.02, 0.008, 0,0);
            this.sensor.add(this.tubeInput);

            this.tubeGeometry = new THREE.TubeBufferGeometry(this.getTubeCurve(), 16, 0.003, 6);
            this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
            this.tubeMesh.name = 'AcusticStethoscopeTube';
            this.sensor.add(this.tubeMesh);
        }
        if (this.sensor.visible) {
            this.tubeGeometry.copy(new THREE.TubeBufferGeometry(this.getTubeCurve(), 16, 0.003, 6));
        }
    }
    /**
     * Dynamic cablecurve
     */
    getTubeCurve() {
        return new THREE.CatmullRomCurve3([
            this.sensor.worldToLocal(THREEUtils.getObjectWorldPosition(this.tubeInput)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
            this.sensor.worldToLocal(THREEUtils.getObjectWorldPosition(this.tubeInput)).add(new THREE.Vector3(-0.01, 0.0, 0.0)),
            this.sensor.worldToLocal(THREEUtils.getObjectWorldPosition(this.tubeInput)).add(new THREE.Vector3(-0.05, 0.01, 0.0)),
            this.sensor.worldToLocal(THREEUtils.getObjectWorldPosition(this.vLab.SceneDispatcher.currentVLabScene.currentCameraCenterObject3D).add(new THREE.Vector3(0.0, -0.5, 0.0))),
        ]);
    }
    /**
     * onApplied() - applied to something
     */
    onApplied() {
        if (this.acusticStethoscopeOverlayL == undefined) {
            this.vLab.DOMManager.addStyle({
                id: 'AcusticStethoscopeOverlayCSS',
                href: '/vlab.items/medical/equipment/AcusticStethoscope/resources/assets/style.css'
            }).then(() => {
                this.acusticStethoscopeOverlayL = document.createElement('div');
                this.acusticStethoscopeOverlayL.id = 'AcusticStethoscopeOverlayL';
                this.acusticStethoscopeOverlayL.classList.add('nonSelectable');
                this.vLab.DOMManager.container.appendChild(this.acusticStethoscopeOverlayL);
                this.acusticStethoscopeOverlayR = document.createElement('div');
                this.acusticStethoscopeOverlayR.id = 'AcusticStethoscopeOverlayR';
                this.acusticStethoscopeOverlayR.classList.add('nonSelectable');
                this.vLab.DOMManager.container.appendChild(this.acusticStethoscopeOverlayR);
                this.showAcusticStethoscopeOverlay();
            });
        } else {
            this.showAcusticStethoscopeOverlay();
        }
    }
    /**
     * onTakenOut
     */
    onTakenOut() {
        this.hideAcusticStethoscopeOverlay();
        this.interactables[1].vLabSceneObject.visible = false;
        this.interactables[0].vLabSceneObject.visible = true;
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetAzimutalRestrictions();
    }
    hideAcusticStethoscopeOverlay() {
        if (this.acusticStethoscopeOverlayL) {
            this.applied = false;
            this.acusticStethoscopeOverlayL.style.display = 'none';
            this.acusticStethoscopeOverlayR.style.display = 'none';
        }
    }
    showAcusticStethoscopeOverlay() {
        if (this.acusticStethoscopeOverlayL) {
            this.applied = true;
            this.acusticStethoscopeOverlayL.style.display = 'block';
            this.acusticStethoscopeOverlayR.style.display = 'block';
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
}
export default AcusticStethoscope;