import * as THREE from 'three';
import * as THREEUtils from '../../../../vlab.fwk/utils/three.utils';
import VLabItem from '../../../../vlab.fwk/core/vlab.item';
/**
 * MercuryThermometer VLabItem base class.
 * @class
 * @classdesc Mercury Thermometer.
 */
class MercuryThermometer extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        this.vLab = this.initObj.vLab;

        this.name = this.initObj.name ? this.initObj.name : 'MercuryThermometer';

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
        });
    }

}
export default MercuryThermometer;