import * as THREE from 'three';
import VLab from './vlab';
import * as THREEUtils from '../utils/three.utils';
import VLabScene from "./vlab.scene";
import VLabSceneInteractable from './vlab.scene.interactable';

var TWEEN = require('@tweenjs/tween.js');

/**
 * VLab Scene Dispatcher
 * @class
 * @classdesc VLab Scene Dispatcher class serves VLab Scene routing and state control.
 */
class VLabSceneDispatcher {
    /**
     * VLabSceneDispatcher constructor
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
         * This previous VLabScene
         * @public
         */
        this.previousVLabScene = undefined;
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
     * @param {Object}              initObj                           - Scene activation object
     * @param {VLabScene | string}  initObj.class                     - VLabScene Class | VLabsScene class name as string
     * 
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    activateScene(initObj) {
        let self = this;
        this.vLab.renderPaused = true;
        /**
         * Set currentVLabScene to this.previousVLabScene
         */
        this.previousVLabScene = this.currentVLabScene;
        return new Promise((resolve, reject) => {
            this.scenes.forEach((vLabScene) => {
                vLabScene.deactivate().then((deactivated) => {

                    /**
                     * Complete dispose of Scene assets if lowMemory is detected by vLabScene.manager.performanceManager
                     */
                    if (vLabScene.manager.performance.lowMemory === true) {
                        THREEUtils.completeDispose(vLabScene);
                    }

                    if (deactivated) {
                        vLabScene.onDeactivated.call(vLabScene);

                        /**
                         * Notify event subscribers
                         */
                        this.vLab.EventDispatcher.notifySubscribers({
                            target: 'VLabScene',
                            type: 'deActivated',
                            vLabSceneClass: vLabScene.constructor.name
                        });
                    }
                });
            });
            for (let vLabScene of this.scenes) {
                if ((typeof initObj.class == 'function' && vLabScene.constructor == initObj.class)
                 || (typeof initObj.class == 'string' && vLabScene.constructor.name === initObj.class)) {
                    this.vLab.WebGLRendererCanvasOverlay.classList.remove('hidden');
                    this.vLab.WebGLRendererCanvasOverlay.classList.add('visible');
                    this.sceneIsBeingActivated = vLabScene;

                    /**
                     * 
                     * Special case of VLabScene is VLabInventory
                     * 
                     */
                    if ((this.sceneIsBeingActivated.constructor.name == 'VLabInventory' 
                        || this.currentVLabScene.constructor.name == 'VLabInventory')
                     && this.vLab.DOMManager.container.zoomHelperStackContainer !== undefined) {
                        if (this.sceneIsBeingActivated.constructor.name == 'VLabInventory') {
                            this.vLab.DOMManager.container.zoomHelperStackContainer.style.display = 'none';
                        }
                        if (this.currentVLabScene.constructor.name == 'VLabInventory') {
                            this.vLab.DOMManager.container.zoomHelperStackContainer.style.display = 'block';
                        }
                    } else {
                        /**
                         * Reset this.currentVLabScene.zoomHelperStack
                         */
                        if (this.currentVLabScene.manager) {
                            this.currentVLabScene.manager.resetZoomHelperStack();
                        }
                    }


                    setTimeout(() => {
                        vLabScene.activate().then((vLabScene) => {
                            /**
                             * Transit taken interactable to this.currentVLabScene
                             */
                            self.transitTakenInteractable(self.currentVLabScene, vLabScene);

                            /**
                             * Setting this.currentVLabScene
                             * See {@link VLabSceneDispatcher#currentVLabScene}
                             */
                            self.currentVLabScene = vLabScene;

                            /**
                             * See {@link VLabScene#activate}
                             */
                            if (vLabScene['justLoaded'] == true) {
                                delete vLabScene['justLoaded'];
                                vLabScene.onLoaded();
                            }

                            self.vLab.setupWebGLRenderer();
                            self.vLab.configureWebGLRenderer();
                            self.vLab.resizeWebGLRenderer();
                            self.vLab.setupEffectComposer();
                            self.vLab.renderPaused = false;

                            setTimeout(() => {
                                self.vLab.WebGLRendererCanvasOverlay.classList.remove('visible');
                                self.vLab.WebGLRendererCanvasOverlay.classList.add('hidden');
                                self.vLab.DOMManager.handleSceneLoadComplete();
                                self.sceneIsBeingActivated = null;
                                vLabScene.onActivated.call(vLabScene);
                                vLabScene.manager.processInteractablesSelections();

                                /**
                                 * Notify event subscribers
                                 */
                                this.vLab.EventDispatcher.notifySubscribers({
                                    target: 'VLabScene',
                                    type: 'activated',
                                    vLabSceneClass: vLabScene.constructor.name
                                });

                                vLabScene.currentControls.update();

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
                this.autoloadScenesTimeout = setTimeout(this.autoloadScenes.bind(this), 1000);
                return;
            }
        }
        for (let vLabScene of this.scenes) {
            if (vLabScene.initObj.autoload && !vLabScene.loaded && !vLabScene.loading) {
                vLabScene.manager.load().then(() => {
                    vLabScene['justLoaded'] = true;
                    this.vLab.DOMManager.handleSceneLoadComplete();
                    this.autoloadScenes();
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
     * Adds userData['beforeTakenState'] to  this.takenInteractable.vLabSceneObject
     * 
     * @param {VLabSceneInteractable} takenInteractable
     */
    setTakenInteractable(takenInteractable, putObjInsist) {
        this.takenInteractable = takenInteractable;
        this.takenInteractable.taken = true;

        this.takenInteractable.vLabSceneObject.visible = false;

        let beforeTakenMaterials = this.currentVLabScene.manager.getInteractableMaterialsAndSetTakenMaterials(takenInteractable);

        /**
         * use putObjInsist if defined otherwise create putObj
         */
        let putObj = (putObjInsist !== undefined) ? putObjInsist : {
            scene: this.currentVLabScene,
            parent: this.takenInteractable.vLabSceneObject.parent,
            position: this.takenInteractable.vLabSceneObject.position.clone(),
            quaternion: this.takenInteractable.vLabSceneObject.quaternion.clone(),
            scale:  this.takenInteractable.vLabSceneObject.scale.clone(),
            materials: beforeTakenMaterials
        };

        this.takenInteractable.vLabSceneObject.userData['beforeTakenState'] = putObj;

        /**
         * Remove taken interactable from VLabScene
         * Add interactable to current VLabScene camera
         */
        this.takenInteractable.vLabSceneObject.parent.remove(this.takenInteractable.vLabSceneObject);
        this.currentVLabScene.currentCamera.add(this.takenInteractable.vLabSceneObject);

        this.takenInteractable.vLabSceneObject.visible = true;

        this.takenInteractable.removeMenuItem('Take');

        this.takenInteractable.updateMenuWithMenuItem({
            label: 'Put back',
            icon: '<i class="material-icons">undo</i>',
            enabled: (this.currentVLabScene.constructor.name !== 'VLabInventory') ? true : false,
            action: this.takenInteractable.put,
            context: this.takenInteractable,
            originalScene: (putObjInsist && putObjInsist.scene) ? putObjInsist.scene : this.currentVLabScene,
            args: putObj
        }, true);

        /**
         * Resize taken object to fit it into camera
         */
        this.takenInteractable.vLabSceneObject.geometry.computeBoundingSphere();
        let scaleFactor = 0.01 / (this.takenInteractable.vLabSceneObject.geometry.boundingSphere.radius * this.takenInteractable.vLabSceneObject.scale.z);
        let untakenScale = this.takenInteractable.vLabSceneObject.scale.clone().z;
        this.takenInteractable.vLabSceneObject.quaternion.copy(new THREE.Quaternion(0.0, THREE.Math.degToRad(180.0), 0.0, 0.0));
        this.takenInteractable.vLabSceneObject.scale.multiplyScalar(scaleFactor);
        this.takenInteractable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, -0.04, -0.11)).sub(this.takenInteractable.vLabSceneObject.geometry.boundingSphere.center.multiplyScalar(scaleFactor));

        this.takenInteractable.vLabSceneObject.rotation.y -= 0.2;
        this.takenInteractableSceneObjectTween = new TWEEN.Tween(this.takenInteractable.vLabSceneObject.rotation)
        .to({y: 0.2}, 4000)
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        this.takenInteractable.boundsSprite.position.copy(this.takenInteractable.vLabSceneObject.position.clone().add(this.takenInteractable.centerObject3D.position.clone().multiplyScalar(scaleFactor)));
        this.takenInteractable.boundsSprite.scale.multiplyScalar(scaleFactor * untakenScale);
        this.currentVLabScene.currentCamera.add(this.takenInteractable.boundsSprite);

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

        this.vLab.EventDispatcher.notifySubscribers({
            target: 'VLabScene',
            type: 'interactableTaken'
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
        if (putObj.visibility !== undefined) {
            this.takenInteractable.vLabSceneObject.visible = putObj.visibility;
        }

        this.takenInteractable.boundsSprite.position.copy(new THREE.Vector3(0.0, 0.0, 0.0));
        this.takenInteractable.boundsSprite.scale.copy(new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(2 * this.takenInteractable.vLabSceneObject.geometry.boundingSphere.radius));
        this.takenInteractable.centerObject3D.add(this.takenInteractable.boundsSprite);

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

        delete this.takenInteractable.vLabSceneObject.userData['beforeTakenState'];

        this.takenInteractable.taken = false;
        this.takenInteractable = null;

        /**
         * Reset 'Take' items in menus of VLabSceneInteractables
         * {@link VLabSceneManager#resetTakeItemsInMenus}
         */
        this.currentVLabScene.manager.resetTakeItemsInMenus();

        this.vLab.EventDispatcher.notifySubscribers({
            target: 'VLabScene',
            type: 'interactablePut'
        });
    }
    /**
     * Taken VLabSceneInteractable transition between VLabScenes
     */
    transitTakenInteractable(fromScene, toScene) {
        if (this.takenInteractable) {
            /**
             * Menu 'Put back' is available only in the VLabScene from which takenInteractable has been taken
             */
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

            fromScene.currentCamera.remove(this.takenInteractable.vLabSceneObject);
            toScene.currentCamera.add(this.takenInteractable.vLabSceneObject);

            fromScene.currentCamera.remove(this.takenInteractable.boundsSprite);
            toScene.currentCamera.add(this.takenInteractable.boundsSprite);

            /**
             * Transit all siblings of this.takenInteractable, updating toScene.interactables;
             * Used this.takenInteractable.vLabSceneObject siblings' names
             */
            this.takenInteractable.vLabSceneObject.traverse((takenInteractableVLabSceneObjectSibling) => {
                if (fromScene.interactables[takenInteractableVLabSceneObjectSibling.name] !== undefined) {
                    toScene.interactables[takenInteractableVLabSceneObjectSibling.name] = fromScene.interactables[takenInteractableVLabSceneObjectSibling.name];
                    toScene.interactables[takenInteractableVLabSceneObjectSibling.name].vLabScene = toScene;
                    delete fromScene.interactables[takenInteractableVLabSceneObjectSibling.name];
                }
            });

            /**
             * Hold this.takenInteractable selection
             */
            if ((this.takenInteractable.selection && this.takenInteractable.selection.hold) && toScene.selectedInteractables.indexOf(this.takenInteractable) == -1) {
                toScene.selectedInteractables.push(this.takenInteractable);
            }

            this.vLab.EventDispatcher.notifySubscribers({
                target: 'VLabSceneInteractable',
                type: 'transitTakenInteractable',
                interactable: this.takenInteractable,
                fromScene: fromScene,
                toScene: toScene
            });
        }
    }
    /**
     * Takes interactable into into VLabInventory if exists; calls VLabInventory.addInteractable
     * @param {VLabSceneInteractable} interactable 
     */
    takeInteractableToInventory(interactable) {
        if (this.vLab.Inventory) {
            return this.vLab.Inventory.addInteractable(interactable);
        }
    }
}
export default VLabSceneDispatcher;