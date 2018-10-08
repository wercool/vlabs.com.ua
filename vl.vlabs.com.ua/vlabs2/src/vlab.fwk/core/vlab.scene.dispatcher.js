import * as THREE from 'three';
import VLab from './vlab';
import VLabScene from "./vlab.scene";
import VLabSceneInteractable from './vlab.scene.interactable';

/**
 * VLab Scene Dispatcher.
 * @class
 * @classdesc VLab Scene Dispatcher class serves VLab Scene routing and state control.
 */
class VLabSceneDispatcher {
    /**
     * VLabSceneDispatcher constructor.
     * @constructor
     * @param {VLab} vLabInstance                         - VLab instance
     */
    constructor(vLabInstance) {
        this.vLab = vLabInstance;

        this.scenes = [];
        /**
         * This current VLabScene
         * @public
         */
        this.currentVLabScene = new THREE.Scene();
        /**
         * VLabScene instance currently is beeing activated
         * @public
         */
        this.sceneIsBeingActivated = null;
        /**
         * VLabScene instance of {@link VLabSceneInteractable} taken after {@link VLabSceneInteractable#take}
         * @public
         */
        this.takenInteractable = null;

        /**
         * Fills this.vLab.prefabs with initial objects
         */
        this.initializeVLabPrefabs();
    }
    /**
     * Add VLabScene to VLabSceneDispatcher stack.
     * @memberof VLabSceneDispatcher
     * @param {Object}    initObj                           - VLabScene initialization object
     * @param {VLab}      initObj.vLab                      - VLab instance
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * @param {string}    initObj.natureURL                 - VLab Scene nature JSON URL (encoded)
     * @param {boolean}   initObj.active                    - If set to true VLabsScene will be activated
     * @param {boolean}   initObj.autoload                  - Load VLabScene assets immediately after instantiation if no active loading happens
     */
    addScene(initObj) {
        initObj.vLab = this.vLab;
        let vLabScene = new initObj.class(initObj);
        this.scenes.push(vLabScene);
        if (initObj.active) {
            this.activateScene(initObj).then(this.autoloadScenes.bind(this));
        } else {
            this.autoloadScenes();
        }
    }
    /**
     * Activates VLabScene.
     * * Sets this.vLab.WebGLRenderer.domElement to activated VLabScene canvas
     * * Sets this.vLab.WebGLRenderer.context to activated VLabScene canvas context
     * @async
     * @memberof VLabSceneDispatcher
     * @param {Object}    initObj                           - Scene activation object
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    activateScene(initObj) {
        let self = this;
        this.vLab.renderPaused = true;
        return new Promise((resolve, reject) => {
            this.scenes.forEach((vLabScene) => {
                vLabScene.deactivate().then((vLabScene) => {
                    vLabScene.onDeactivated();
                });
            });
            for (let vLabScene of this.scenes) {
                if (vLabScene.constructor == initObj.class) {
                    self.sceneIsBeingActivated = vLabScene;
                    self.vLab.WebGLRendererCanvas.classList.add('hidden');
                    vLabScene.activate().then((vLabScene) => {
                        self.currentVLabScene = vLabScene;
                        self.vLab.setupWebGLRenderer();
                        self.vLab.resizeWebGLRenderer();
                        self.vLab.setupEffectComposer();
                        vLabScene.onActivated();
                        self.vLab.renderPaused = false;
                        setTimeout(() => {
                            self.vLab.WebGLRendererCanvas.classList.remove('hidden');
                            self.sceneIsBeingActivated = null;
                            resolve(vLabScene);
                        }, 250);
                    });
                    break;
                }
            }
        });
    }
    /**
     * Process VLabScene autoload queue.
     * @memberof VLabSceneDispatcher
     */
    autoloadScenes() {
        if (this.autoloadScenesTimeout) clearTimeout(this.autoloadScenesTimeout);
        for (let vLabScene of this.scenes) {
            if (vLabScene.loading) {
                this.autoloadScenesTimeout = setTimeout(this.autoloadScenes.bind(this), 250);
                return;
            }
        }
        for (let vLabScene of this.scenes) {
            if (vLabScene.initObj.autoload && !vLabScene.loaded && !vLabScene.loading) {
                vLabScene.manager.load().then(this.autoloadScenes.bind(this));
                return;
            }
        }
    }
    /**
     * Get number of not yet loaded autoload VLabScene.
     * @memberof VLabSceneDispatcher
     */
    getNotYetLoadedAutoloads() {
        let notYetAutloaded = 0;
        this.scenes.forEach((vLabScene) => {
            notYetAutloaded += (vLabScene.initObj.autoload && !vLabScene.loaded) ? 1 : 0;
        });
        return notYetAutloaded;
    }
    /**
     * Process taken process Interactable
     * Removes vLabSceneObject from VLabScene and attaches it to {@link VLabScene#currentCamera}
     * Replaces vLabSceneObject materials (including all children) with MeshBasicMaterial
     * Removes 'Take' menu item
     * Adds 'Put back' menu item with putObj as args
     * let putObj = {
     *  parent: this.vLabSceneObject.parent,
     *  position: this.vLabSceneObject.position.clone(),
     *  quaternion: this.vLabSceneObject.quaternion.clone(),
     *  scale:  this.vLabSceneObject.scale.clone(),
     *  materials: list of objects; key = vLabSceneObject->sibling->uuid, value = vLabSceneObject->sibling->material
     * };
     * 
     * @param {VLabSceneInteractable} takenInteractable 
     */
    setTakenInteractable(takenInteractable) {
        this.takenInteractable = takenInteractable;
        this.takenInteractable.taken = true;

        this.takenInteractable.vLabSceneObject.visible = false;

        let beforeTakenMaterials = {};
        this.takenInteractable.vLabSceneObject.traverse((sibling) => {
            if (sibling.type == 'Mesh') {
                beforeTakenMaterials[sibling.uuid] = sibling.material;

                let takenObjectMaterial = new THREE.MeshBasicMaterial();
                takenObjectMaterial.map = sibling.material.map;
                sibling.material = takenObjectMaterial;
                sibling.material.needsUpdate = true;
            }
        });

        let putObj = {
            parent: this.takenInteractable.vLabSceneObject.parent,
            position: this.takenInteractable.vLabSceneObject.position.clone(),
            quaternion: this.takenInteractable.vLabSceneObject.quaternion.clone(),
            scale:  this.takenInteractable.vLabSceneObject.scale.clone(),
            materials: beforeTakenMaterials
        };

        this.takenInteractable.vLabSceneObject.parent.remove();
        this.currentVLabScene.currentCamera.add(this.takenInteractable.vLabSceneObject);

        this.takenInteractable.vLabSceneObject.visible = true;

        this.takenInteractable.removeMenuItem('Take');

        this.takenInteractable.updateMenuWithMenuItem({
            label: 'Put back',
            icon: '<i class="material-icons">undo</i>',
            enabled: true,
            action: this.takenInteractable.put,
            context: this.takenInteractable,
            args: putObj
        }, true);

this.takenInteractable.vLabSceneObject.geometry.computeBoundingSphere();
// console.log(this.vLabSceneObject.geometry.boundingSphere);
this.takenInteractable.vLabSceneObject.scale.multiplyScalar(0.025);
this.takenInteractable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, -0.06, -0.15));
// console.log(this.vLabSceneObject.geometry.boundingSphere);
// console.log(this.vLabScene.currentCamera);

        this.scenes.forEach((vLabScene) => {
            for (let interactableName in vLabScene.interactables) {
                let menuItemId = 0;
                vLabScene.interactables[interactableName].menu.forEach((menuItem) => {
                    if (menuItem.label == 'Take') {
                        vLabScene.interactables[interactableName].menu[menuItemId].enabled = false;
                    }
                    menuItemId++;
                });
            }
        });
    }
    /**
     * Process put process Interactable
     * Puts vLabSceneObject to where it was before taken with take().
     * Removes vLabSceneObject from {@link VLabScene#currentCamera} and attaches it back to putObj.parent with putObj.position, putObj.quaternion, putObj.scale
     * Restores material from putObj.material
     * @param {Object} putObj
     * let putObj = {
     *  parent: this.vLabSceneObject.parent,
     *  position: this.vLabSceneObject.position.clone(),
     *  quaternion: this.vLabSceneObject.quaternion.clone(),
     *  scale:  this.vLabSceneObject.scale.clone(),
     *  materials: list of objects; key = vLabSceneObject->sibling->uuid, value = vLabSceneObject->sibling->material
     * };
     */
    putTakenInteractable(putObj) {
        this.takenInteractable.vLabSceneObject.visible = false;

        this.currentVLabScene.currentCamera.remove(this.takenInteractable.vLabSceneObject);

        if (putObj.position) this.takenInteractable.vLabSceneObject.position.copy(putObj.position);
        if (putObj.quaternion) this.takenInteractable.vLabSceneObject.quaternion.copy(putObj.quaternion);
        if (putObj.scale) this.takenInteractable.vLabSceneObject.scale.copy(putObj.scale);
        if (putObj.materials) {
            this.takenInteractable.vLabSceneObject.traverse((sibling) => {
                if (sibling.type == 'Mesh') {
                    sibling.material = putObj.materials[sibling.uuid];
                    sibling.material.needsUpdate = true;
                }
            });
        }
        if (putObj.parent) {
            putObj.parent.add(this.takenInteractable.vLabSceneObject);
        } else {
            this.vLabScene.add(this.takenInteractable.vLabSceneObject);
        }

        this.takenInteractable.vLabSceneObject.visible = true;

        this.takenInteractable.removeMenuItem('Put back');

        this.takenInteractable.updateMenuWithMenuItem({
            label: 'Take',
            icon: '<i class="material-icons">pan_tool</i>',
            enabled: true,
            action: this.takenInteractable.take,
            context: this.takenInteractable
        }, true);

        this.takenInteractable.taken = false;
        this.takenInteractable = null;

        this.scenes.forEach((vLabScene) => {
            for (let interactableName in vLabScene.interactables) {
                let menuItemId = 0;
                vLabScene.interactables[interactableName].menu.forEach((menuItem) => {
                    if (menuItem.label == 'Take') {
                        vLabScene.interactables[interactableName].menu[menuItemId].enabled = true;
                    }
                    menuItemId++;
                });
            }
        });
    }

    /**
     * Fills this.vLab.prefabs with initial objects
     */
    initializeVLabPrefabs() {
        if (!this.vLab.prefabs['respondentPreselectionLineMaterial']) {
            this.vLab.prefabs['respondentPreselectionLineMaterial'] = new THREE.LineBasicMaterial({ color: 0xfff6b7 });
        }
        if (!this.vLab.prefabs['respondentIntersectionPointGeometry']) {
            this.vLab.prefabs['respondentIntersectionPointGeometry'] = new THREE.SphereBufferGeometry(0.005, 8, 8);
        }
        if (!this.vLab.prefabs['respondentPreselectionIntersectionPointMaterial']) {
            this.vLab.prefabs['respondentPreselectionIntersectionPointMaterial'] = new THREE.MeshBasicMaterial({ color: 0xfff6b7, depthTest: false, side: THREE.BackSide });
        }
        if (!this.vLab.prefabs['interactablePreselectionToRespondentPointMaterial']) {
            this.vLab.prefabs['interactablePreselectionToRespondentPointMaterial'] = new THREE.MeshBasicMaterial({ color: 0xfff6b7, side: THREE.BackSide });
        }
    }
}
export default VLabSceneDispatcher;