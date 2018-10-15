import * as THREE from 'three';
import VLab from './vlab';
import VLabScene from "./vlab.scene";
import VLabSceneInteractable from './vlab.scene.interactable';

var TWEEN = require('@tweenjs/tween.js');

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
         * Taken object tween animation reference
         * @public
         */
        this.takenInteractableSceneObjectTween = null;
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
        if (this.getScene(initObj.class) === null) {
            initObj.vLab = this.vLab;
            let vLabScene = new initObj.class(initObj);
            this.scenes.push(vLabScene);
            if (initObj.active) {
                this.activateScene(initObj).then(this.autoloadScenes.bind(this));
            } else {
                this.autoloadScenes();
            }
        } else {
            console.error(initObj.class.name + ' has been added previously!');
        }
    }
    /**
     * Return VLabScene instance by VLabScene class if exists in this.scene or null otherwise
     * @param {VLabScene} VLabSceneClass - VLabScene class
     */
    getScene(VLabSceneClass) {
        for (let i = 0; i < this.scenes.length; i++) {
            if (VLabSceneClass === this.scenes[i].constructor) {
                return this.scenes[i];
            }
        }
        return null;
    }
    /**
     * Return VLabScene instance by VLabScene class name if exists in this.scene or null otherwise
     * @param {string} vLabClassName - VLabScene class name
     */
    getSceneByClassName(vLabClassName) {
        for (let i = 0; i < this.scenes.length; i++) {
            if (vLabClassName === this.scenes[i].constructor.name) {
                return this.scenes[i];
            }
        }
        return null;
    }
    /**
     * Activates VLabScene.
     * * Sets this.vLab.WebGLRenderer.domElement to activated VLabScene canvas
     * * Sets this.vLab.WebGLRenderer.context to activated VLabScene canvas context
     * @async
     * 
     * @memberof VLabSceneDispatcher
     * 
     * @param {Object}    initObj                           - Scene activation object
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * 
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    activateScene(initObj) {
        let self = this;
        this.vLab.renderPaused = true;
        return new Promise((resolve, reject) => {
            this.scenes.forEach((vLabScene) => {
                vLabScene.deactivate().then((deactivated) => {
                    if (deactivated) {
                        vLabScene.onDeactivated.call(vLabScene);
                    }
                });
            });
            for (let vLabScene of this.scenes) {
                if (vLabScene.constructor == initObj.class) {
                    this.vLab.WebGLRendererCanvasOverlay.classList.remove('hidden');
                    this.vLab.WebGLRendererCanvasOverlay.classList.add('visible');
                    this.sceneIsBeingActivated = vLabScene;
                    setTimeout(() => {
                        vLabScene.activate().then((vLabScene) => {
                            /**
                             * Transit taken interactable to this.currentVLabScene
                             */
                            self.transitTakenInteractable(self.currentVLabScene, vLabScene);

                            self.currentVLabScene = vLabScene;

                            /**
                             * See {@link VLabScene#activate}
                             */
                            if (vLabScene['justLoaded'] == true) {
                                delete vLabScene['justLoaded'];
                                vLabScene.onLoaded();
                            }
                            self.vLab.setupWebGLRenderer();
                            self.vLab.resizeWebGLRenderer();
                            self.vLab.setupEffectComposer();
                            self.vLab.renderPaused = false;
                            setTimeout(() => {
                                self.sceneIsBeingActivated = null;
                                vLabScene.onActivated.call(vLabScene);
                                self.vLab.WebGLRendererCanvasOverlay.classList.remove('visible');
                                self.vLab.WebGLRendererCanvasOverlay.classList.add('hidden');
                                self.vLab.DOMManager.handleSceneLoadComplete();
                                resolve(vLabScene);
                            }, 250);
                        });
                    }, 250);
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
                vLabScene.manager.load().then(() => {
                    this.vLab.DOMManager.handleSceneLoadComplete();
                    this.autoloadScenes.bind(this);
                });
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
     * 
     * 
     * 
     * 
     *   _______    _                _____       _                      _        _     _
     *  |__   __|  | |              |_   _|     | |                    | |      | |   | |
     *     | | __ _| | _____ _ __     | |  _ __ | |_ ___ _ __ __ _  ___| |_ __ _| |__ | | ___
     *     | |/ _` | |/ / _ \ '_ \    | | | '_ \| __/ _ \ '__/ _` |/ __| __/ _` | '_ \| |/ _ \
     *     | | (_| |   <  __/ | | |  _| |_| | | | ||  __/ | | (_| | (__| || (_| | |_) | |  __/
     *     |_|\__,_|_|\_\___|_| |_| |_____|_| |_|\__\___|_|  \__,_|\___|\__\__,_|_.__/|_|\___|
     * 
     * 
     * 
     * 
     */
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
            if (sibling.type == 'Mesh' && sibling.name.indexOf('_OUTLINE') == -1) {
                beforeTakenMaterials[sibling.uuid] = sibling.material;
                let takenObjectMaterial = new THREE.MeshBasicMaterial();
                if (sibling.material.map) {
                    takenObjectMaterial.map = sibling.material.map;
                } else {
                    takenObjectMaterial.color = sibling.material.color;
                }
                takenObjectMaterial.side = sibling.material.side;
                takenObjectMaterial.needsUpdate = true;
                sibling.material = takenObjectMaterial;
            }
        });

        let putObj = {
            scene: this.currentVLabScene,
            parent: this.takenInteractable.vLabSceneObject.parent,
            position: this.takenInteractable.vLabSceneObject.position.clone(),
            quaternion: this.takenInteractable.vLabSceneObject.quaternion.clone(),
            scale:  this.takenInteractable.vLabSceneObject.scale.clone(),
            materials: beforeTakenMaterials
        };

        /**
         * Remove taken interactable from VLabScene
         * Add interactable to current VLabScene camera
         */
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
            originalScene: this.currentVLabScene,
            args: putObj
        }, true);

        /**
         * Resize take object to fit it into camera
         */
        this.takenInteractable.vLabSceneObject.geometry.computeBoundingSphere();
        let scaleFactor = 0.01 / (this.takenInteractable.vLabSceneObject.geometry.boundingSphere.radius * this.takenInteractable.vLabSceneObject.scale.z);
        this.takenInteractable.vLabSceneObject.scale.multiplyScalar(scaleFactor);
        this.takenInteractable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, -0.04, -0.11)).sub(this.takenInteractable.vLabSceneObject.geometry.boundingSphere.center.multiplyScalar(scaleFactor));

        this.takenInteractable.vLabSceneObject.rotation.y -= 0.2;
        this.takenInteractableSceneObjectTween = new TWEEN.Tween(this.takenInteractable.vLabSceneObject.rotation)
        .to({y: 0.2}, 4000)
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

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
        if (this.takenInteractableSceneObjectTween) {
            this.takenInteractableSceneObjectTween.stop();
            this.takenInteractableSceneObjectTween = undefined;
        }

        this.takenInteractable.vLabSceneObject.visible = false;

        this.currentVLabScene.currentCamera.remove(this.takenInteractable.vLabSceneObject);

        if (putObj.position) this.takenInteractable.vLabSceneObject.position.copy(putObj.position);
        if (putObj.quaternion) this.takenInteractable.vLabSceneObject.quaternion.copy(putObj.quaternion);
        if (putObj.scale) this.takenInteractable.vLabSceneObject.scale.copy(putObj.scale);
        if (putObj.materials) {
            this.takenInteractable.vLabSceneObject.traverse((sibling) => {
                if (sibling.type == 'Mesh' && sibling.name.indexOf('_OUTLINE') == -1) {
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

        this.takenInteractable.deSelect(true);

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
     * Taken VLabSceneInteractable transition between VLabScenes
     */
    transitTakenInteractable(fromScene, toScene) {
        if (this.takenInteractable) {

            for (let i = 0; i < this.takenInteractable.menu.length; i++) {
                if (this.takenInteractable.menu[i].label == 'Put back') {
                    if (this.takenInteractable.menu[i].context && this.takenInteractable.menu[i].originalScene) {
                        if (this.takenInteractable.menu[i].originalScene == toScene) {
                            this.takenInteractable.menu[i].enabled = true;
                        } else {
                            this.takenInteractable.menu[i].enabled = false;
                        }
                    } else {
                        this.takenInteractable.menu[i].enabled = false;
                    }
                }
            }

            this.takenInteractable.vLabSceneObject.parent.remove(this.takenInteractable.vLabSceneObject);
            toScene.currentCamera.add(this.takenInteractable.vLabSceneObject);
            this.takenInteractable.vLabScene = toScene;
            toScene.interactables[this.takenInteractable.vLabSceneObject.name] = this.takenInteractable;
        }
    }
}
export default VLabSceneDispatcher;