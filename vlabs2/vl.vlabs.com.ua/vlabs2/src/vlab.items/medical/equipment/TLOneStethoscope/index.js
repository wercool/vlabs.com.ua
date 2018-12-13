import * as THREE from 'three';
import VLabItem from '../../../../vlab.fwk/core/vlab.item';
/**
 * TLOneStethoscope VLabItem base class.
 * @class
 * @classdesc ThinkLab One Stethoscope.
 */
class TLOneStethoscope extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        this.name = this.initObj.name ? this.initObj.name : 'TLOneStethoscope';

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
             * Conditionally add to Inventory interactables (for VLabItem by default this.interactables[0] (this.vLabScenObject in the root of [0] Interactable) is added to Inventory)
             */
            if (this.nature.addToInvnentory == true) {
                this.vLab.Inventory.addInteractable(this.interactables[0]);
            }
        });
    }
}
export default TLOneStethoscope;