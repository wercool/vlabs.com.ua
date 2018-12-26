import * as THREE from 'three';
import VLabItem from '../../../../vlab.fwk/core/vlab.item';
/**
 * PneumaticSphygmomanometer VLabItem base class.
 * @class
 * @classdesc Mercury Thermometer.
 */
class PneumaticSphygmomanometer extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        this.vLab = this.initObj.vLab;

        this.name = this.initObj.name ? this.initObj.name : 'PneumaticSphygmomanometer';

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
        let envSphereMapReflection = event.toScene.envSphereMapReflection ? event.toScene.envSphereMapReflection : null;
        this.setEnvMap(envSphereMapReflection);
    }
    setEnvMap(envSphereMapReflection) {
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseMetal').material.envMap = envSphereMapReflection;
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseMetal').material.needsUpdate = true;

        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterGlass').material.envMap = envSphereMapReflection;
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterGlass').material.needsUpdate = true;

        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseOutletMetal').material.envMap = envSphereMapReflection;
        this.vLabItemModel.getObjectByName('pneumaticSphygmomanometerMeterCaseOutletMetal').material.needsUpdate = true;
    }
    /**
     * onApplied
     */
    onApplied() {
    }
    /**
     * onTakenOut
     */
    onTakenOut() {
    }
}
export default PneumaticSphygmomanometer;