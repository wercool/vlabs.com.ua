import * as THREE from 'three';
import VLab from './vlab';
import VLabScene from './vlab.scene';
import * as HTTPUtils from '../utils/http.utils';
import GLTFLoader from 'three-gltf-loader';
import { ZipLoader } from '../utils/zip.loader';
import * as ObjectUtils from '../utils/object.utils';
import VLabSceneInteractable from './vlab.scene.interactable';

/**
 * VLab Scene Manager.
 * 
 * @class
 * @classdesc VLabSceneManager serves VLab Scene auxilaries, configures VLab Scene accodring to VLab Scene nature.
 */
class VLabSceneManager {
    /**
     * VLabScene constructor.
     * 
     * @constructor
     * @param {VLabScene} vLabScene                           - VLabScene instance
     */
    constructor(vLabScene) {
        /**
         * VLabScene instance reference
         * @public
         */
        this.vLabScene = vLabScene;
        /**
         * VLab instance reference
         * @public
         */
        this.vLab = this.vLabScene.vLab;
        /**
         * VLabSceneManager instance name
         * @public
         */
        this.name = this.vLabScene.name + 'Manager';
        /**
         * VLabScene initially configured from {@link VLabScene#nature}
         * @public
         */
        this.configured = false;
        /**
         * THREE.LoadingManager instance
         * @public
         */
        this.loadingManager = new THREE.LoadingManager();
        /**
         * Performance Object
         * @public
         */
        this.performance = {
            performanceManagerInterval: null,
            lowFPSThreshold: 30,
            lowFPSDetected: 0,
            lowMemoryThreshold: 1.0 * 1048576,
            lowMemoryDetected: 0,
            lowMemory: false
        };
        /**
         * THREE.Clock
         * @public
         */
        this.clock = new THREE.Clock();
    }
    /**
     * Configures VLab Scene with {@link VLabScene#nature}.
     * @async
     * @memberof VLabSceneManager
     */
    configure() {
        /**
         * Fix of glitch / weird rendering when {@link VLab#setupWebGLRenderer} forcedly called;
         * Add extremely small Sprite to eliminate the glitch
         * Comment and call {@link VLab#setupWebGLRenderer} with forcedly to see what happens without fix ;)
         */
        if (this.vLabScene.getObjectByName('antiGlitchSprite') == undefined) {
            var sprite = new THREE.Sprite();
            sprite.name = 'antiGlitchSprite';
            sprite.scale.set(1e-10, 1e-10, 1e-10);
            this.vLabScene.add(sprite);
        }

        if (this.configured) return Promise.resolve();

        return new Promise((resolve, reject) => {
            /**
             * Configure Scene background
             */
            if (this.vLabScene.nature.scene) {
                if (this.vLabScene.nature.scene.background) {
                    if (this.vLabScene.nature.scene.background.color) {
                        this.vLabScene.background = new THREE.Color(parseInt(this.vLabScene.nature.scene.background.color));
                    }
                }
            } else if (this.vLabScene.nature.WebGLRendererParameters && this.vLabScene.nature.WebGLRendererParameters.clearColor) {
                this.vLabScene.background = new THREE.Color(parseInt(this.vLabScene.nature.WebGLRendererParameters.clearColor));
            }

            /**
             * Configure VLabScene currentCamera from VLabScene nature
             */
            if (this.vLabScene.nature.cameras) {
                if (this.vLabScene.nature.cameras.default) {
                    this.vLabScene.currentCamera.name = this.vLabScene.nature.cameras.default.name;
                    switch (this.vLabScene.nature.cameras.default.type) {
                        case 'PerspectiveCamera':
                            if (this.vLabScene.nature.cameras.default.position) {
                                this.vLabScene.currentCamera.position.set(
                                    this.vLabScene.nature.cameras.default.position.x,
                                    this.vLabScene.nature.cameras.default.position.y,
                                    this.vLabScene.nature.cameras.default.position.z
                                );
                            }
                        break;
                    }
                }
            }
            /**
             * Configure VLabScene currentControls from VLabScene nature
             */
            if (this.vLabScene.nature.controls) {
                if (this.vLabScene.nature.controls.default) {
                    switch (this.vLabScene.nature.controls.default.type) {
                        case 'orbit':
                            if (this.vLabScene.currentControls.constructor.name !== 'VLabOrbitControls') {
                                console.log('Implement switch VLabScene default controls');
                            }
                            if (this.vLabScene.nature.controls.default.target) {
                                if (this.vLabScene.nature.controls.default.target.vector3) {
                                    this.vLabScene.currentControls.target.set(
                                        this.vLabScene.nature.controls.default.target.x,
                                        this.vLabScene.nature.controls.default.target.y,
                                        this.vLabScene.nature.controls.default.target.z
                                    );
                                }
                                if (this.vLabScene.nature.controls.default.target.object) {
                                    let sceneTargetObject = this.vLabScene.getObjectByName(this.vLabScene.nature.controls.default.target.object);
                                    if (sceneTargetObject) {
                                        this.vLabScene.currentControls.target = sceneTargetObject.position.clone();
                                    }
                                }
                            }
                        break;
                    }
                }
            }
            /** 
             * Configure VLabScene interactables from VLabScene nature 
             */
            if (this.vLabScene.nature.interactables) {
                this.vLabScene.nature.interactables.forEach(async (interactableNatureObj) => {
                    await this.vLabScene.addInteractable(interactableNatureObj);
                });
            }

            this.configured = true;
            resolve();
        });
    }
    /**
     * Process VLabSceneInteractable(s) selections
     */
    processInteractablesSelections() {
        let preselectedInteractables = [];
        let selectedInteractables = [];
        /**
         * Selections
         */
        this.vLabScene.selectedInteractables.forEach((selectedInteractable) => {
            selectedInteractables.push(selectedInteractable);
        });
        /**
         * Preselections
         */
        this.vLabScene.preSelectedInteractables.forEach((preSelectedInteractable) => {
            preselectedInteractables.push(preSelectedInteractable);
        });

        for (let interactableName in this.vLabScene.interactables) {
            this.vLabScene.interactables[interactableName].clearOutline();
        }

        if (this.vLab.effectComposer) {
            if (preselectedInteractables.length > 0) {
                let preselectedInteractablesSceneObjects = [];
                preselectedInteractables.forEach((preselectedInteractable) => {
                    if (preselectedInteractable.vLabSceneObject) {
                        if (!preselectedInteractable.boundsOnly) {
                            preselectedInteractablesSceneObjects.push(preselectedInteractable.vLabSceneObject);
                        } else {
                            preselectedInteractable.outline();
                        }
                    }
                });
                if (preselectedInteractablesSceneObjects.length > 0) {
                    this.vLab.outlineEffect.setSelection(preselectedInteractablesSceneObjects);
                    if (!this.vLab.outlinePass.renderToScreen) {
                        this.vLab.effectComposer.addPass(this.vLab.outlinePass);
                        this.vLab.renderPass.renderToScreen = false;
                        this.vLab.outlinePass.renderToScreen = true;
                    }
                }
            } else {
                if (this.vLab.outlinePass.renderToScreen) {
                    this.vLab.outlineEffect.clearSelection();
                    this.vLab.effectComposer.removePass(this.vLab.outlinePass);
                    this.vLab.outlinePass.renderToScreen = false;
                    this.vLab.renderPass.renderToScreen = true;
                }
            }
        } else {
            preselectedInteractables.forEach((preselectedInteractable) => {
                preselectedInteractable.outline();
            });
        }
        selectedInteractables.forEach((selectedInteractable) => {
            selectedInteractable.outlineSelected();
        });
    }
    /**
     * Returns currently selected (excluding those with selection.hold)
     * @returns {VLabSceneInteractable}
     */
    getCurrentlySelectedInteractable() {
        let currentlySelectedInteractable;
        for (let interactableName in this.vLabScene.interactables) {
            if (this.vLabScene.interactables[interactableName].selected && !this.vLabScene.interactables[interactableName].selection.hold) {
                currentlySelectedInteractable = this.vLabScene.interactables[interactableName];
            }
        }
        return currentlySelectedInteractable;
    }
    /**
     * VLab Scene loader.
     * 
     * * Loads {@link VLabScene#nature} from JSON file, specified in VLabScene constructor initObj
     * @async
     * @memberof VLabSceneManager
     * @param {boolean} activation                          - VLabScene load initiated from {@link vLabScene#activate}
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver [true - if just loaded, false - if already loaded]
     */
    load(activation) {
        if (this.vLabScene.loaded) return Promise.resolve(false);
        if (this.vLabScene.loading || activation) this.vLabScene.initObj.autoload = false;
        this.vLabScene.loading = true;
        console.log(this.vLabScene.name + ' load initiated');
        let self = this;
        let vLabScene = this.vLabScene;
        this.loadingManager.onProgress = this.loadingManagerProgress.bind(this);
        return new Promise((resolve, reject) => {
            HTTPUtils.getJSONFromURL(vLabScene.initObj.natureURL, this.vLab.getNaturePassphrase())
            .then((nature) => {
                /**
                 * 
                 * VLabScene nature assigned from loaded JSON file here
                 * 
                 */
                vLabScene.nature = nature;

                this.setupStyles().then(() => {
                    this.vLab.DOMManager.showSceneLoader(vLabScene);
                    this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHint.innerHTML = (!this.vLabScene.initObj.autoload) ? 'Loading geometries...' : 'Autoloading of ' + vLabScene.nature.title + ' initiated...';
                    /* Load (GL Transmission Format) from gltfURL */
                    if (vLabScene.nature.gltfURL) {
                        this.loadZIP(vLabScene.nature.gltfURL).then((gltfFile) => {
                            let loader = new GLTFLoader(self.loadingManager);
                            loader.load(
                                gltfFile,
                                function onLoad(gltf) {
                                    vLabScene.loading = false;
                                    vLabScene.loaded = true;
                                    self.processGLTF(gltf).then(() => {
                                        gltf = null;
                                        resolve(true);
                                    });
                                },
                                function onProgress(xhr) {
                                    let progress = parseInt(xhr.loaded / xhr.total * 100);
                                    console.log(progress + '% loaded of ' + vLabScene.name);
                                    self.vLab.DOMManager.refreshSceneLoaderIndicator(vLabScene, progress);
                                },
                                function onError(error) {
                                    console.error('An error happened while loading VLabScene glTF assets:', error);
                                }
                            );
                        });
                    }
                });
            });
        });
    }
    /**
     * LoadingManager onProgress
     * Is used to show textures loading progress
     */
    loadingManagerProgress(item, loaded, total, intermediateLoadingProgress) {
        if (this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHint && !this.vLabScene.loaded) {
            if (this.intermediateLoadingProgressTimeout !== undefined) clearTimeout(this.intermediateLoadingProgressTimeout);
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHint.innerHTML = 'Loading textures...';
            let progress = (intermediateLoadingProgress !== undefined) ? intermediateLoadingProgress : parseInt(loaded / total * 100);
            this.vLab.DOMManager.refreshSceneLoaderIndicator(this.vLabScene, progress);
            let self = this;
            this.intermediateLoadingProgressTimeout = setTimeout(() => {
                if (progress < 99) self.loadingManagerProgress(null, null, null, progress + 0.25);
            }, 1000);
        } else if (this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHint && this.vLabScene.loaded) {
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHint.innerHTML = 'Initializing...';
        }
    }
    /**
     * Loads ZIP archived scene file if file name ended with .zip, else return non-modified url.
     * 
     * @async
     * @memberof VLabSceneManager
     * @return { Promise }
     */
    loadZIP(url) {
        let self = this;
        let vLabScene = this.vLabScene;
        return new Promise(function(resolve, reject) {
            if (url.match(/\.zip$/)) {
                new ZipLoader().load(
                        url,
                        function (xhr) {
                            let progress = parseInt(xhr.loaded / xhr.total * 100);
                            // console.log(progress + '% loaded of compressed ' + vLabScene.name);
                            self.vLab.DOMManager.refreshSceneLoaderIndicator(vLabScene, progress);
                        },
                    ).then(function(zip) {
                        self.loadingManager.setURLModifier(zip.urlResolver);
                        resolve(zip.find(/\.(gltf|glb)$/i)[0]);
                    });
            } else {
                resolve(url);
            }
        });
    }
    /**
     * Processes GLTF loaded object.
     * 
     * @async
     * @memberof VLabSceneManager
     * @return { Promise }
     * @todo manage scene cameras
     */
    processGLTF(gltf) {
        let self = this;
        let vLabScene = this.vLabScene;
        return new Promise(function(resolve, reject) {
            gltf.scene.traverse((child) => {
                switch (child.type) {
                    case 'Mesh':
                        if (child.parent.constructor.name == 'Scene') {
                            vLabScene.add(child.clone());
                        }
                    break;
                    case 'Object3D':
                        self.conformObject3D(child);
                    break;
                }
            });
            vLabScene.traverse((child) => {
                if (child.material) {
                    child.material = self.conformMaterial(child.material);
                }
            });
            resolve();
        });
    }
    /**
     * Conforms THREE.Object3D with VLab, based on object3d.userData
     * 
     * @memberof VLabSceneManager
     * @argument {THREE.Object3D} object3d
     * @argument {Object} object3d.userData
     * PointLight
     * @argument {String} [object3d.userData.PointLight]                - PointLight
     * @argument {number} [object3d.userData.color]                     - PointLight color '0x' + color; default '0xffffff'
     * @argument {number} [object3d.userData.intensity]                 - PointLight intensity; default 1.0
     * @argument {number} [object3d.userData.distance]                  - PointLight distance; default 0.0
     * @argument {number} [object3d.userData.decay]                     - PointLight decay; default 1.0
     * PerspectiveCamera
     * @argument {number} [object3d.userData.PerspectiveCamera]                     - PerspectiveCamera
     * @argument {number} [object3d.userData.default]                               - default PerspectiveCamera, this.currentCamera.position will be copied from this object3d position
     */
    conformObject3D(object3d) {
        if (Object.keys(object3d.userData).length > 0) {
            /* Lights */
            if (object3d.userData.PointLight) {
                let color = parseInt(object3d.userData.color ? '0x' + object3d.userData.color : '0xffffff');
                let intensity = parseFloat(object3d.userData.intensity ? object3d.userData.intensity : 1.0);
                let distance = parseFloat(object3d.userData.distance ? object3d.userData.distance : 0.0);
                let decay = parseFloat(object3d.userData.decay ? object3d.userData.decay : 1.0);
                let _PointLight = new THREE.PointLight(color, intensity, distance, decay);
                _PointLight.name = object3d.name;
                _PointLight.position.copy(object3d.position);
                this.vLabScene.add(_PointLight);
            }
            /* Cameras */
            if (object3d.userData.PerspectiveCamera) {
                if (object3d.userData.default) {
                    if (this.vLabScene.nature.cameras.default) {
                        this.vLabScene.nature.cameras.default['position'] = object3d.position;
                    }
                }
            }
        }
    }
    /**
     * Conforms material with VLab using material.userData
     * 
     * @memberof VLabSceneManager
     * @argument {THREE.MeshStandardMaterial} material                - MeshStandardMaterial if glTF is loaded
     * @argument {Object} material.userData
     * @argument {String} material.userData.MeshBasicMaterial
     * @argument {String} material.userData.MeshLambertMaterial
     * @argument {String} material.userData.MeshPhongMaterial
     * @returns { MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial | MeshStandardMaterial }
     */
    conformMaterial(material) {
        let existingMaterial = undefined;
        this.vLabScene.traverse((child) => {
            if (child.material) {
                if (child.material.name === material.name && Object.keys(child.material.userData).length == 0) {
                    existingMaterial = child.material;
                }
            }
        });
        if (existingMaterial !== undefined) return existingMaterial;

        if (Object.keys(material.userData).length > 0) {
            if (material.userData.MeshBasicMaterial) {
                let _MeshBasicMaterial = new THREE.MeshBasicMaterial();
                _MeshBasicMaterial = ObjectUtils.assign(_MeshBasicMaterial, material);
                _MeshBasicMaterial.type = 'MeshBasicMaterial';
                if (material.userData.MaterialSide) {
                    _MeshBasicMaterial.side = material.userData.MaterialSide;
                }
                _MeshBasicMaterial.userData = {};
                return _MeshBasicMaterial;
            }
            if (material.userData.MeshLambertMaterial) {
                let _MeshLambertMaterial = new THREE.MeshLambertMaterial();
                _MeshLambertMaterial = ObjectUtils.assign(_MeshLambertMaterial, material);
                _MeshLambertMaterial.type = 'MeshLambertMaterial';
                if (material.userData.MaterialSide) {
                    _MeshLambertMaterial.side = material.userData.MaterialSide;
                }
                _MeshLambertMaterial.userData = {};
                return _MeshLambertMaterial;
            }
            if (material.userData.MeshPhongMaterial) {
                let _MeshPhongMaterial = new THREE.MeshPhongMaterial();
                _MeshPhongMaterial = ObjectUtils.assign(_MeshPhongMaterial, material);
                _MeshPhongMaterial.type = 'MeshPhongMaterial';
                if (material.userData.MaterialSide) {
                    _MeshPhongMaterial.side = material.userData.MaterialSide;
                }
                _MeshPhongMaterial.userData = {};
                return _MeshPhongMaterial;
            }
        } else {
            return material;
        }
    }
    /**
     * Setup VLab Scene HTML CSS styles accordingly to VLabScene nature.
     * 
     * * Loads style either from VLabScene nature link or default (/vlab.assets/css/scene.css)
     * @async
     * @memberof VLabSceneManager
     */
    setupStyles() {
        if (this.vLabScene.nature.style) {
            return this.vLab.DOMManager.addStyle({
                id: this.vLabScene.initObj.class.name + 'CSS',
                href: this.vLabScene.nature.style
            });
        } else {
            let defaultSceneCSS = document.getElementById('sceneCSS');
            if (defaultSceneCSS) {
                return Promise.resolve();
            } else {
                return this.vLab.DOMManager.addStyle({
                    id: 'sceneCSS',
                    href: '/vlab.assets/css/scene.css'
                });
            }
        }
    }
    /**
     * Performance manager
     */
    performanceManager() {
        if (this.vLab.fps < this.performance.lowFPSThreshold) {
            if (this.performance.lowFPSDetected < 0) this.performance.lowFPSDetected = 0;
            if (this.performance.lowFPSDetected > 5) {
                /**
                 * No EffectComposer at low FPS
                 */
                if (this.vLab.effectComposer) {
                    this.vLab.effectComposer = null;
                    this.processInteractablesSelections();
                }
                this.performance.lowFPSDetected = 0;
                return;
            }
            this.performance.lowFPSDetected++;
        } else {
            if (this.performance.lowFPSDetected < -2) {
                if (this.vLab.effectComposer == null) {
                    this.vLab.setupEffectComposer();
                    this.processInteractablesSelections();
                }
            } else {
                if (this.performance.lowFPSDetected  > -10) this.performance.lowFPSDetected--;
            }
        }
        /**
         * Memory threshold check
         */
        if (window.performance && window.performance.memory) {
            let memoryLeft = window.performance.memory.totalJSHeapSize - window.performance.memory.usedJSHeapSize;
            if (memoryLeft < this.performance.lowMemoryThreshold) {
                if (this.performance.lowMemoryDetected > 5) {
                    this.performance.lowMemoryDetected = 0;
                    this.performance.lowMemory = true;
                }
                this.performance.lowMemoryDetected++;
            } else {
                this.performance.lowMemory = false;
                this.performance.lowMemoryDetected = 0;
            }
        }
    }
    /**
     * Return currently assigned {interactable} materials
     * @param {VLabSceneInteractable} interactable
     */
    getInteractableMaterials(interactable) {
        let interactableMaterials = {};
        interactable.vLabSceneObject.traverse((sibling) => {
            if (sibling.type == 'Mesh' && sibling.name.indexOf('_OUTLINE') == -1) {
                interactableMaterials[sibling.uuid] = sibling.material;
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
        return interactableMaterials;
    }
    /**
     * Reset 'Take' items in menus of VLabSceneInteractables
     */
    resetTakeItemsInMenus() {
        this.vLab.SceneDispatcher.scenes.forEach((vLabScene) => {
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
}
export default VLabSceneManager;