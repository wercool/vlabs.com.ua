import * as THREE from 'three';
import * as THREEUtils from '../../../../vlab.fwk/utils/three.utils';
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

        this.volume = 0.5;

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('/vlab.items/medical/equipment/TLOneStethoscope/resources/assets/light.png')
        ])
        .then((results) => {
            this.cableMaterial = new THREE.MeshPhongMaterial({
                color: 0x050505,
                shininess: 80.0,
                wireframe: false,
                flatShading: false
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

            this.cableJack = this.interactables[0].vLabSceneObject.getObjectByName('headphonesJack');
            this.updateCable();

        });

        /**
         * Event subscriptions
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabSceneInteractable: {
                    transitTakenInteractable:         this.onTransitTakenInteractable
                },
                VLabScene: {
                    currentControlsUpdated:           this.onCurrentControlsUpdated.bind(this)
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
            this.updateCable();
        }
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetAzimutalRestrictions();
        this.interactables[0].deSelect();
    }
    /**
     * onTakenOut
     */
    onTakenOut() {
        if (this.headphonesApplied) {
            this.interactables[0].initObj.interactable.inventory.viewBias = "new THREE.Vector3(0.15, 0.25, 0.15)";
            this.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscope_headphones').visible = true;
            this.vLab['HeadphonesGeneric'].hideHeadphonesOverlay();
            this.cableMesh.visible = false;
        } else {
            this.interactables[0].initObj.interactable.inventory.viewBias = "new THREE.Vector3(0.0, 0.1, 0.0)";
        }
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetAzimutalRestrictions();
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
        this.cableJack.visible = false;
        this.interactables[0].initObj.interactable.inventory.viewBias = "new THREE.Vector3(0.0, 0.1, 0.0)";
        this.vLab.Inventory.resetView();
        this.vLab.Inventory.addInteractable(this.vLab['HeadphonesGeneric'].interactables[0]);
        this.vLab['HeadphonesGeneric'].interactables[0].vLabSceneObject.visible = true;
    }

    updateCable() {
        this.vLabItemModel.updateMatrixWorld();
        if (this.cableMesh == undefined) {
            this.cableJackInput = new THREE.Object3D();
            this.cableJackInput.position.set(0.0, 0.0, 0.0);
            this.cableJack.add(this.cableJackInput);

            this.cableGeometry = new THREE.TubeBufferGeometry(this.getCableCurve(), 16, 0.002, 4);
            this.cableMesh = new THREE.Mesh(this.cableGeometry, this.cableMaterial);
            this.cableMesh.name = 'TLOneStethoscopeCable';
            this.cableJack.add(this.cableMesh);
        }
        this.cableMesh.visible = (this.vLab.SceneDispatcher.currentVLabScene.constructor.name != 'VLabInventory' || this.interactables[0].taken);
        if (this.cableMesh.visible) {
            this.cableGeometry.copy(new THREE.TubeBufferGeometry(this.getCableCurve(), 16, 0.002, 4));
        }
    }

    /**
     * Dynamic cablecurve
     */
    getCableCurve() {
        return new THREE.CatmullRomCurve3([
            this.cableJack.worldToLocal(THREEUtils.getObjectWorldPosition(this.cableJackInput)).add(new THREE.Vector3(0.005, 0.0, 0.0)),
            this.cableJack.worldToLocal(THREEUtils.getObjectWorldPosition(this.cableJackInput)).add(new THREE.Vector3(0.0, 0.0, 0.0)),
            this.cableJack.worldToLocal(THREEUtils.getObjectWorldPosition(this.cableJackInput)).add(new THREE.Vector3(-0.01, 0.0, 0.0)),
            this.cableJack.worldToLocal(THREEUtils.getObjectWorldPosition(this.vLab.SceneDispatcher.currentVLabScene.currentCameraCenterObject3D).add(new THREE.Vector3(0.0, -0.1, 0.0))),
        ]);
    }
    /**
     * onCurrentControlsUpdated
     */
    onCurrentControlsUpdated(event) {
        if (this.cableJack && this.cableJack.visible) {
            if (!this.interactables[0].taken) {
                this.updateCable();
            }
        }
    }
    /**
     * volumeDecrease
     */
    volumeDecrease() {
        if (this.buttonPressedTimeout != undefined) return;
        let self = this;
        if (this.volume > 0.1) {
            this.volume -= 0.1;
        }
        if (this.vLab.SceneDispatcher.currentVLabScene.soudsVolumeAdjust) {
            this.vLab.SceneDispatcher.currentVLabScene.soudsVolumeAdjust();
        }
        this.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscopeButtonVolumeMinus').translateZ(0.0005);
        this.buttonPressedTimeout = setTimeout(() => {
            self.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscopeButtonVolumeMinus').translateZ(-0.0005);
            self.buttonPressedTimeout = undefined;
        }, 150);
    }
    /**
     * volumeIncrease
     */
    volumeIncrease() {
        if (this.buttonPressedTimeout != undefined) return;
        let self = this;
        if (this.volume < 1.0) {
            this.volume += 0.1;
        }
        if (this.vLab.SceneDispatcher.currentVLabScene.soudsVolumeAdjust) {
            this.vLab.SceneDispatcher.currentVLabScene.soudsVolumeAdjust();
        }
        this.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscopeButtonVolumePlus').translateZ(-0.0005);
        this.buttonPressedTimeout = setTimeout(() => {
            self.interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscopeButtonVolumePlus').translateZ(0.0005);
            self.buttonPressedTimeout = undefined;
        }, 150);
    }
}
export default TLOneStethoscope;