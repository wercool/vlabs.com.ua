import * as THREE from 'three';
import * as HTTPUtils from '../utils/http.utils';
import GLTFLoader from 'three-gltf-loader';
import { ZipLoader } from '../utils/ZipLoader';
import * as ObjUtils from '../utils/object.utils';
import VLab from './vlab';
import VLabSceneManager from './vlab.scene.manager';
import VLabOrbitControls from '../aux/vlab.orbit.controls';

/**
 * VLab Scene.
 * 
 * @class
 * @classdesc VLabScene class serves VLab Scene world load process, loading nature file, activating, deactivating.
 */
class VLabScene extends THREE.Scene {
    /**
     * VLabScene constructor.
     * 
     * @constructor
     * @param {Object}              initObj                           - VLabScene initialization object
     * @param {VLab}                initObj.vLab                      - VLab instance
     * @param {VLabScene}           initObj.class                     - Distinct VLabScene Class
     * @param {string}              [initObj.natureURL]               - VLab Scene nature JSON URL (encoded)
     * @param {boolean}             [initObj.initial]                 - Initial VLabScene, will be auto activated
     * @param {boolean}             [initObj.autoload]                - Load VLabScene assets immediately after instantiation if no active loading happens
     * @param {boolean}             [initObj.loaded]                  - VLabScene considered loaded
     * @param {Object}              [initObj.eventSubscrObj]          - Scene specific event subscription object, if not defined this.defaultSubscrObj will be used
     */
    constructor(initObj) {
        super();
        this.initObj = initObj;
        /**
         * VLab instance
         * @inner
         */
        this.vLab = this.initObj.vLab;
        /**
         * Set name of VLabScene name to it's contructor name
         * @inner
         */
        this.name = this.constructor.name;
        /**
         * VLabSceneManager instance for this VLab Scene
         * @inner
         */
        this.manager = new VLabSceneManager(this);
        /**
         * Set to true while scene file is loading, default false
         * @inner
         */
        this.loading = false;
        /**
         * Set to true when scene filed is loaded, default false
         * Sets to initObj.loaded if defined
         * @inner
         */
        this.loaded = this.initObj.loaded !== undefined ? this.initObj.loaded : false;
        /**
         * Set to true when scene is active scene, default false
         * @inner
         */
        this.active = false;
        /**
         * THREE.LoadingManager instance
         * @inner
         */
        this.loadingManager = new THREE.LoadingManager();
        /**
         * Default event subscription object
         * @inner
         */
        this.eventSubscrObj = this.initObj.eventSubscrObj !== undefined ? this.initObj.eventSubscrObj : {
            subscriber: this.manager,
            events: {
                WebGLRendererCanvas: {
                    mousedown:  this.manager.onDefaultEventListener,
                    mouseup:    this.manager.onDefaultEventListener,
                    mousemove:  this.manager.onDefaultEventListener,
                    touchstart: this.manager.onDefaultEventListener,
                    touchend:   this.manager.onDefaultEventListener,
                    touchmove:  this.manager.onDefaultEventListener,
                }
            }
        };
        /**
         * This current Scene camera; default is THREE.PerspectiveCamera instance
         * configured later at {@link VLabSceneManager#configure}
         * @inner
         */
        this.currentCamera = new THREE.PerspectiveCamera(50, this.vLab.WebGLRendererCanvas.clientWidth / this.vLab.WebGLRendererCanvas.clientHeight, 0.1, 100);
        this.add(this.currentCamera);
        /**
         * This current Scene controls; default is {@link VLabOrbitControls} instance
         * configured later at {@link VLabSceneManager#configure}
         * @inner
         */
        this.currentControls = new VLabOrbitControls(this);
        this.currentControls.target = new THREE.Vector3(0.0, this.currentCamera.position.y, 0.0);
    }
    /**
     * VLab Scene activator.
     *
     * @async
     * @memberof VLabScene
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    activate() {
        return new Promise((resolve, reject) => {
            this.load().then(() => {
                this.subscribe();
                this.manager.activate().then(() => {
                    this.active = true;
                    resolve(this);
                });
            });
        });
    }
    /**
     * VLab Scene deactivator.
     * @async
     * @memberof VLabScene
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    deactivate() {
        return new Promise((resolve, reject) => {
            this.unsubscribe();
            this.active = false;
            resolve(this);
        });
    }
    /**
     * VLab Scene onActivated abstract function.
     *
     * @memberof VLabScene
     * @abstract
     */
    onActivated() { console.warn(this.name + ' onActivated abstract method not implemented'); }
    /**
     * VLab Scene onDeactivated abstract function.
     *
     * @memberof VLabScene
     * @abstract
     */
    onDeactivated() { console.warn(this.name + ' onDeactivated abstract method not implemented'); }
    /**
     * VLab Scene default event subscriber, could be overridden in VLabScene inheritor.
     *
     * @memberof VLabScene
     * @abstract
     */
    subscribe(eventSubscrObj) {
        if (eventSubscrObj !== undefined) {
            for (let eventGroupName in eventSubscrObj['events']) {
                for (let eventType in eventSubscrObj['events'][eventGroupName]) {
                   this.eventSubscrObj['events'][eventGroupName][eventType] = eventSubscrObj['events'][eventGroupName][eventType];
                }
            }
        }
        this.vLab.EventDispatcher.subscribe(this.eventSubscrObj);
    }
    /**
     * VLab Scene default event unsubscriber, could be overridden in VLabScene inheritor.
     *
     * @memberof VLabScene
     * @abstract
     */
    unsubscribe() {
        this.vLab.EventDispatcher.unsubscribe(this.eventSubscrObj);
    }
    /**
     * Conforms material with VLab using material.userData
     * 
     * @memberof VLabScene
     * @argument {THREE.MeshStandardMaterial} material                - MeshStandardMaterial if glTF is loaded
     * @argument {Object} material.userData
     * @argument {String} material.userData.MeshBasicMaterial
     * @argument {String} material.userData.MeshLambertMaterial
     * @argument {String} material.userData.MeshPhongMaterial
     * @returns { MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial | MeshStandardMaterial }
     */
    conformMaterial(material) {
        let existingMaterial = undefined;
        this.traverse((child) => {
            if (child.material) {
                if (child.material.name === material.name) {
                    existingMaterial = child.material;
                }
            }
        });
        if (existingMaterial !== undefined) return existingMaterial;

        if (Object.keys(material.userData).length> 0) {
            if (material.userData.MeshBasicMaterial) {
                let _MeshBasicMaterial = new THREE.MeshBasicMaterial();
                _MeshBasicMaterial = ObjUtils.assign(_MeshBasicMaterial, material);
                _MeshBasicMaterial.type = 'MeshBasicMaterial';
                return _MeshBasicMaterial;
            }
            if (material.userData.MeshLambertMaterial) {
                let _MeshLambertMaterial = new THREE.MeshLambertMaterial();
                _MeshLambertMaterial = ObjUtils.assign(_MeshLambertMaterial, material);
                _MeshLambertMaterial.type = 'MeshLambertMaterial';
                return _MeshLambertMaterial;
            }
            if (material.userData.MeshPhongMaterial) {
                let _MeshPhongMaterial = new THREE.MeshPhongMaterial();
                _MeshPhongMaterial = ObjUtils.assign(_MeshPhongMaterial, material);
                _MeshPhongMaterial.type = 'MeshPhongMaterial';
                return _MeshPhongMaterial;
            }
        } else {
            return material;
        }
    }
    /**
     * Conforms THREE.Object3D with VLab based on object3d.userData
     * 
     * @memberof VLabScene
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
                this.add(_PointLight);
            }
            /* Cameras */
            if (object3d.userData.PerspectiveCamera) {
                if (object3d.userData.default) {
                    if (this.nature.cameras.default) {
                        this.nature.cameras.default['position'] = object3d.position;
                    }
                }
            }
        }
    }
    /**
     * Processes GLTF loaded object.
     * 
     * @async
     * @memberof VLabScene
     * @return { Promise }
     * @todo manage scene cameras
     */
    processGLTF(gltf) {
        let self = this;
        return new Promise(function(resolve, reject) {
            gltf.scene.traverse((child) => {
                switch (child.type) {
                    case 'Mesh':
                        if (child.parent.constructor.name == 'Scene') {
                            self.add(child.clone());
                        }
                    break;
                    case 'Object3D':
                        self.conformObject3D(child);
                    break;
                }
            });
            self.traverse((child) => {
                if (child.material) {
                    child.material = self.conformMaterial(child.material);
                }
            });
            resolve();
        });
    }
    /**
     * VLab Scene loader.
     * 
     * * Loads {@link VLabScene#nature} from JSON file, specified in VLabScene constructor initObj
     * @async
     * @memberof VLabScene
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    load() {
        if (this.loaded) {
            return Promise.resolve(this);
        }
        let self = this;
        this.loading = true;
        console.log(this.initObj.class.name + ' load initiated');
        return new Promise((resolve, reject) => {
            HTTPUtils.getJSONFromURL(this.initObj.natureURL, this.vLab.getNaturePassphrase())
            .then((nature) => {
                /**
                 * VLabScene nature
                 * @inner
                 * @property {Object} nature                    - VLab Scene nature loaded from constructor initObj.natureURL
                 * @property {string} nature.title              - VLab Scene title
                 * @property {string} nature.description        - VLab Scene description
                 * @property {string} [nature.style]            - VLab Scene specific CSS file relative URL
                 * @property {string} [nature.gltfURL]          - VLab Scene glTF (.gltf|.glb) world in glTF format
                 * @property {Object} [nature.WebGLRendererParameters]                          - THREE.WebGLRenderer VLabScene specific parameters and presets
                 * @property {number} [nature.WebGLRendererParameters.resolutionFactor]         - THREE.WebGLRenderer VLabScene specific resolution factor
                 * @property {string} [nature.WebGLRendererParameters.clearColor]               - THREE.WebGLRenderer clear color
                 * @property {Object} [nature.cameras]                      - Scene cameras object
                 * @property {Object} [nature.cameras.default]              - Scene default camera configurer object
                 * @property {string} [nature.cameras.default.type]                 - Scene default camera type {PerspectiveCamera}
                 * @property {string} [nature.cameras.default.name]                 - Scene default camera name
                 * @property {number} [nature.cameras.default.fov]                  - Scene default camera field of view
                 * @property {string} [nature.cameras.default.position]             - Scene default camera position; THREE.Vector3; evalutated
                 * @property {Object} [nature.controls]                         - Scene controls object
                 * @property {Object} [nature.controls.default]                 - Scene default controls configurer object
                 * @property {string} [nature.controls.default.type]            - Scene default controls type [orbit {@link VLabOrbitControls}]
                 * @property {Object} [nature.controls.default.target]          - Scene default controls target for [orbit {@link VLabOrbitControls}]
                 * @property {string} [nature.controls.default.target.vector3]  - Scene default controls target position THREE.Vector3; evaluated
                 * @property {string} [nature.controls.default.target.object]   - Scene default controls target position will be cloned from VLabScene.getObjectByName(object) position
                 * 
                 */
                this.nature = nature;

                this.setupStyles().then(() => {
                    this.showSceneLoader();
                    /* Load (GL Transmission Format) from gltfURL */
                    if (this.nature.gltfURL) {
                        this.loadZIP(this.nature.gltfURL).then((gltfFile) => {
                            let loader = new GLTFLoader(self.loadingManager);
                            loader.load(
                                gltfFile,
                                function onLoad(gltf) {
                                    self.loading = false;
                                    self.loaded = true;
                                    self.handleLoadComplete();
                                    self.processGLTF(gltf).then(() => {
                                        delete self.loadingManager;
                                        gltf = null;
                                        resolve();
                                    });
                                },
                                function onProgress(xhr) {
                                    let progress = parseInt(xhr.loaded / xhr.total * 100);
                                    console.log(progress + '% loaded of ' + self.initObj.class.name);
                                    self.refreshLoaderIndicator(progress);
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
     * Loads ZIP archived scene file if file name ended with .zip, else return non-modified url.
     * 
     * @async
     * @memberof VLabScene
     * @return { Promise }
     */
    loadZIP(url) {
        let self = this;
        return new Promise(function(resolve, reject) {
            if (url.match(/\.zip$/)) {
                new ZipLoader().load(
                        url,
                        function (xhr) {
                            let progress = parseInt(xhr.loaded / xhr.total * 100);
                            console.log(progress + '% loaded of ' + self.initObj.class.name);
                            self.refreshLoaderIndicator(progress);
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
     * Refreshes VLabScene loader indicator.
     * 
     * @async
     * @memberof VLabScene
     */
    refreshLoaderIndicator(progress) {
        if (this.initObj.autoload) {
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderProgress.style.width = progress + '%';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderLabel.innerHTML = 'Autoloading ' + (this.nature.title || '' + ((this.initObj.initial) ? 'initial ' : 'next ') + 'scene') + ' ' + progress + '%';
        } else {
            this.vLab.DOMManager.VLabSceneSharedAssets.loadingBar.set(parseInt(progress));
        }
    }
    /**
     * Setup VLab Scene HTML CSS styles accordingly to VLabScene nature.
     * 
     * * Loads style either from VLabScene nature link or default (/vlab.assets/css/scene.css)
     * @async
     * @memberof VLabScene
     */
    setupStyles() {
        if (this.nature.style) {
            return this.vLab.DOMManager.addStyle({
                id: this.initObj.class.name + 'CSS',
                href: this.nature.style
            });
        } else {
            let defaultSceneCSS = document.getElementById('sceneCSS');
            if (defaultSceneCSS) {
                return Promise.resolve();
            } else {
                return this.vLab.DOMManager.addStyle({
                    id: 'sceneCSS',
                    href: '../vlab.assets/css/scene.css'
                });
            }
        }
    }
    /**
     * Handle this.vLab.DOMManager.VLabSceneSharedAssets when load completed.
     * 
     * @memberof VLabScene
     */
    handleLoadComplete() {
        if (this.vLab.SceneDispatcher.getNotYetLoadedAutoload() == 0) {
            this.vLab.DOMManager.container.removeChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer);
            for (let VLabSceneAsset in this.vLab.DOMManager.VLabSceneSharedAssets) {
                this.vLab.DOMManager.VLabSceneSharedAssets[VLabSceneAsset] = null;
            }
        } else {
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.classList.toggle('hidden');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader.style.display = 'inline';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer.style.pointerEvents = 'none';
        }
    }
    /**
     * Setup (if not yet exists) and show VLab Scene loader splash element.
     * 
     * @memberof VLabScene
     */
    showSceneLoader() {
        if (this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer === null) {
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer.id = 'sceneLoaderContainer';
            this.vLab.DOMManager.container.insertAdjacentElement('afterbegin', this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer);
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.id = 'sceneLoader';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer.appendChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader);
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHeader = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHeader.id = 'sceneLoaderHeader';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.appendChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHeader);
            let sceneLoaderHeaderHR = document.createElement('div');
            sceneLoaderHeaderHR.id = 'sceneLoaderHeaderHR';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.appendChild(sceneLoaderHeaderHR);
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContent = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContent.id = 'sceneLoaderContent';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.appendChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContent);
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoadingBarDIV = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoadingBarDIV.id = 'sceneLoadingBarDIV';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoadingBarDIV.setAttribute('class', 'ldBar label-center');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoadingBarDIV.setAttribute('data-preset', 'circle');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoadingBarDIV.setAttribute('data-stroke', '#c3d7e4');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.appendChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoadingBarDIV);
            this.vLab.DOMManager.VLabSceneSharedAssets.loadingBar = new ldBar(this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoadingBarDIV);

            /* Autloader */
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader.id = 'sceneAutoLoader';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer.appendChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader);            
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderLabel = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderLabel.id = 'sceneAutoLoaderLabel';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader.appendChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderLabel);
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderProgress = document.createElement('div');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderProgress.id = 'sceneAutoLoaderProgress';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader.appendChild(this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderProgress);
        }

        this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer.style.display = 'flex';

        if (this.initObj.autoload) {
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.classList.add('hidden');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader.style.display = 'inline';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer.style.pointerEvents = 'none';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderProgress.style.width = '0%';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoaderLabel.innerHTML = '';
        } else {
            this.vLab.DOMManager.VLabSceneSharedAssets.loadingBar.set(0);
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.style.display = 'inline';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoader.classList.remove('hidden');
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneAutoLoader.style.display = 'none';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContainer.style.pointerEvents = 'auto';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderHeader.innerHTML = this.nature.title || 'Loading ' + ((this.initObj.initial) ? 'initial ' : 'next ') + 'scene';
            this.vLab.DOMManager.VLabSceneSharedAssets.sceneLoaderContent.innerHTML = this.nature.description || '';
        }
    }
}
export default VLabScene;