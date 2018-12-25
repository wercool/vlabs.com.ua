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

        this.defaultTemperature = 35.5;
        this.temperature = this.defaultTemperature;

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

        this.animateMetalColumn = this.animateMetalColumn.bind(this);
    }

    /**
     * VLabItem onInitialized abstract function implementation; called from super.initialize()
     */
    onInitialized() {
        this.vLab.SceneDispatcher.currentVLabScene.add(this.vLabItemModel);

        this.vLabItemModel.renderOrder = 1;
        this.mercuryThermometerGlassColumn = this.vLabItemModel.getObjectByName('mercuryThermometerGlassColumn');

        this.mercuryThermometerMetalColumn = this.vLabItemModel.getObjectByName('mercuryThermometerMetalColumn');

        this.setTemperature();

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
     * Set temperature
     */
    setTemperature(temperature) {
        if (temperature) this.temperature = temperature;
        this.metalColumnScaleZFactor = 1 + (0.7* (this.temperature - 35.0));
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
        let mercuryMaterial = this.vLabItemModel.getObjectByName('mercuryThermometerMetal').material;
        this.vLabItemModel.material.envMap = envSphereMapReflection;
        this.vLabItemModel.material.needsUpdate = true;

        mercuryMaterial.envMap = envSphereMapReflection;
        mercuryMaterial.needsUpdate = true;
    }
    /**
     * onApplied
     */
    onApplied() {
        if (this.metalColumnAnimationInterval !== undefined) {
            clearInterval(this.metalColumnAnimationInterval);
        }
        this.metalColumnAnimationInterval = setInterval(this.animateMetalColumn, 50);
        this.applied = true;
    }
    /**
     * onTakenOut
     */
    onTakenOut() {
        if (this.metalColumnAnimationInterval !== undefined) {
            clearInterval(this.metalColumnAnimationInterval);
        }
        this.setTemperature(this.defaultTemperature);
        this.mercuryThermometerMetalColumn.scale.set(1.0, 1.0, this.metalColumnScaleZFactor);
        this.applied = false;
    }
    /**
     * Animate metalColumn
     */
    animateMetalColumn() {
        if (this.mercuryThermometerMetalColumn.scale.z < this.metalColumnScaleZFactor) {
            this.mercuryThermometerMetalColumn.scale.set(1.0, 1.0, this.mercuryThermometerMetalColumn.scale.z + 0.005);
        }
        if(Math.abs(this.mercuryThermometerMetalColumn.scale.z - this.metalColumnScaleZFactor) < 0.01) {
            clearInterval(this.metalColumnAnimationInterval);
            this.metalColumnAnimationInterval = undefined;
        }
    }
}
export default MercuryThermometer;