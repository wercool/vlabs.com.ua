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

        this.vLab = this.initObj.vLab;

        this.name = this.initObj.name ? this.initObj.name : 'TLOneStethoscope';

        this.headphonesApplied = false;

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
    setEnvMap(envSphereMapReflection) {
        let TLOneStethoscope = this.vLabItemModel.getObjectByName('TLOneStethoscope');
        TLOneStethoscope.material.envMap = envSphereMapReflection;
        TLOneStethoscope.material.needsUpdate = true;
    }
    /**
     * onTaken
     */
    onTaken() {
        this.setEnvMap(this.vLab.SceneDispatcher.currentVLabScene.envSphereMapReflection);
        this.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscope_headphones').visible = false;
        if (this.headphonesApplied) {
            this.vLab['HeadphonesGeneric'].onApplied();
        }
    }
    /**
     * onTakenOut
     */
    onTakenOut() {
        if (this.headphonesApplied) {
            this.interactables[0].initObj.interactable.inventory.viewBias = "new THREE.Vector3(0.15, 0.25, 0.15)";
            this.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscope_headphones').visible = true;
            this.vLab['HeadphonesGeneric'].hideHeadphonesOverlay();
        } else {
            this.interactables[0].initObj.interactable.inventory.viewBias = "new THREE.Vector3(0.0, 0.1, 0.0)";
        }
    }
    /**
     * onTransitTakenInteractable
     * called from this.vLab.SceneDispatcher.transitTakenInteractable
     */
    onTransitTakenInteractable(event) {
        // console.log(event);
        let envSphereMapReflection = event.toScene.envSphereMapReflection ? event.toScene.envSphereMapReflection : null;
        this.setEnvMap(envSphereMapReflection);
    }
    takeHeadphonesToInventory() {
        this.headphonesApplied = false;
        this.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscope_headphones').visible = false;
        this.interactables[0].vLabSceneObject.getObjectByName('headphonesJack').visible = false;
        this.interactables[0].initObj.interactable.inventory.viewBias = "new THREE.Vector3(0.0, 0.1, 0.0)";
        this.vLab.Inventory.resetView();
        this.vLab.Inventory.addInteractable(this.vLab['HeadphonesGeneric'].interactables[0]);
        this.vLab['HeadphonesGeneric'].interactables[0].vLabSceneObject.visible = true;
    }
}
export default TLOneStethoscope;