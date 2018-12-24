import * as THREE from 'three';
import VLabItem from '../../vlab.fwk/core/vlab.item';
/**
 * HeadphonesGeneric VLabItem base class.
 * @class
 * @classdesc HeadphonesGeneric.
 */
class HeadphonesGeneric extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        this.vLab = this.initObj.vLab;

        this.name = this.initObj.name ? this.initObj.name : 'HeadphonesGeneric';

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            // textureLoader.load('/vlab.items/valter/resources/3d/textures/carbon_fibre.jpg')
        ])
        .then((result) => {
            // var cableSleeveMaterialTexture = result[0];
            // cableSleeveMaterialTexture.wrapS = cableSleeveMaterialTexture.wrapT = THREE.RepeatWrapping;
            // cableSleeveMaterialTexture.repeat.set(4, 1);
            // this.cableSleeveMaterial = new THREE.MeshLambertMaterial({
            //     wireframe: false,
            //     flatShading: false,
            //     map: cableSleeveMaterialTexture
            // });

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
        });

        /**
         * Event subscriptions
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabSceneInteractable: {
                    transitTakenInteractable:         this.onTransitTakenInteractable
                }
            }
        });
    }
    /**
     * onTransitTakenInteractable
     * called from this.vLab.SceneDispatcher.transitTakenInteractable
     */
    onTransitTakenInteractable(event) {
        // console.log(event);
    }
    /**
     * onApplied() - plugged to some output (show headphones overlay)
     */
    onApplied() {
        if (this.earphonesOverlayL == undefined) {
            this.vLab.DOMManager.addStyle({
                id: 'HeadphonesOverlayCSS',
                href: '/vlab.items/headphones/resources/assets/style.css'
            }).then(() => {
                if (!this.earphonesOverlayL) {
                    this.earphonesOverlayL = document.createElement('div');
                    this.earphonesOverlayL.id = 'HeadphonesOverlayL';
                    this.earphonesOverlayL.classList.add('nonSelectable');
                    this.vLab.DOMManager.container.appendChild(this.earphonesOverlayL);
                    this.earphonesOverlayR = document.createElement('div');
                    this.earphonesOverlayR.id = 'HeadphonesOverlayR';
                    this.earphonesOverlayR.classList.add('nonSelectable');
                    this.vLab.DOMManager.container.appendChild(this.earphonesOverlayR);
                }
                this.showHeadphonesOverlay();
            });
        } else {
            this.showHeadphonesOverlay();
        }
    }
    hideHeadphonesOverlay() {
        this.earphonesOverlayL.style.display = 'none';
        this.earphonesOverlayR.style.display = 'none';
    }
    showHeadphonesOverlay() {
        this.earphonesOverlayL.style.display = 'block';
        this.earphonesOverlayR.style.display = 'block';
    }
    isVisible() {
        return (this.earphonesOverlayL !== undefined && this.earphonesOverlayL.style.display == 'block');
    }
}
export default HeadphonesGeneric;