import * as THREE from 'three';
import * as HTTPUtils from '../utils/http.utils';
import GLTFLoader from 'three-gltf-loader';
import { ZipLoader } from '../utils/ZipLoader';
import * as ObjUtils from '../utils/object.utils';
import VLab from './vlab';

var VLabSceneAssets = {
    sceneLoader: null,
    sceneLoaderContainer: null,
    sceneLoaderHeader: null,
    sceneLoaderContent: null,
    sceneLoadingBarDIV: null,
    loadingBar: null,
    sceneAutoLoader: null,
    sceneAutoLoaderProgress: null,
    sceneAutoLoaderLabel: null
};
/**
 * VLab Scene.
 * 
 * @class
 * @classdesc VLab Scene class serves VLab Scene and it's auxilaries.
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
     * @param {HTMLDivElement}      [initObj.auxWebGLContainer]       - Auxilary WebGL container for THREE.WebGLRenderer domElement <canvas> reside
     * @param {boolean}             [initObj.loaded]                  - VLabScene considered loaded
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
         * This current THREE.PerspectiveCamera instance
         * @inner
         */
        this.currentCamera = new THREE.PerspectiveCamera(45, this.vLab.DOM.webGLContainer.clientWidth / this.vLab.DOM.webGLContainer.clientHeight, 1, 1000);
        this.add(this.currentCamera);
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
            if (!this.canvas) {
                /**
                 * HTMLCanvasElement to render VLabs scene on
                 * @inner
                 */
                this.canvas = document.createElement('canvas');
                this.canvas.id = this.initObj.class.name + 'Canvas';
                this.canvas.addEventListener('contextmenu', function(event) {
                    if (event.button == 2) {
                        event.preventDefault();
                    }
                });
                if (this.initObj.auxWebGLContainer !== undefined) {
                    this.initObj.auxWebGLContainer.appendChild(this.canvas);
                } else {
                    this.vLab.DOM.webGLContainer.appendChild(this.canvas);
                }
            }
            if (!this.loaded) {
                this.load().then(() => {
                    this.active = true;
                    resolve(this);
                });
            } else {
                this.active = true;
                resolve(this);
            }
        });
    }
    /**
     * VLab Scene deactivator.
     *
     * @memberof VLabScene
     */
    deactivate() {
        if (this.canvas) this.canvas.style.display = 'none';
        this.active = false;
    }
    /**
     * VLab Scene onActivated abstract function.
     *
     * @memberof VLabScene
     * @abstract
     */
    onActivated() { console.warn(this.constructor.name + ' onActivated abstract method not implemented'); }
    /**
     * Conforms material with VLab based on material.userData extra object.
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
        if (Object.keys(material.userData).length> 0) {
            if (material.userData.MeshBasicMaterial) {
                let _MeshBasicMaterial = new THREE.MeshBasicMaterial();
                _MeshBasicMaterial = ObjUtils.assign(_MeshBasicMaterial, material);
                return _MeshBasicMaterial;
            }
            if (material.userData.MeshLambertMaterial) {
                let _MeshLambertMaterial = new THREE.MeshLambertMaterial();
                _MeshLambertMaterial = ObjUtils.assign(_MeshLambertMaterial, material);
                return _MeshLambertMaterial;
            }
            if (material.userData.MeshPhongMaterial) {
                let _MeshPhongMaterial = new THREE.MeshPhongMaterial();
                _MeshPhongMaterial = ObjUtils.assign(_MeshPhongMaterial, material);
                return _MeshPhongMaterial;
            }
        } else {
            return material;
        }
    }
    /**
     * Conforms THREE.Mesh with VLab based on material.userData extra object..
     * 
     * @memberof VLabScene
     */
    conformMesh(mesh) {
        if (mesh.material) {
            mesh.material = this.conformMaterial(mesh.material);
            mesh.material.userData = {};
        }
    }
    /**
     * Conforms THREE.Object3D with VLab based on material.userData extra object..
     * 
     * @memberof VLabScene
     * @argument {THREE.Object3D} object3d
     * @argument {Object} object3d.userData
     * @argument {String} object3d.userData.PointLight                - PointLight
     */
    conformObject3D(object3d) {
        if (Object.keys(object3d.userData).length> 0) {
            if (object3d.userData.PointLight) {
                let color = parseInt(object3d.userData.color ? '0x' + object3d.userData.color : '0xffffff');
                let intensity = parseFloat(object3d.userData.intensity ? object3d.userData.intensity : 1.0);
                let distance = parseFloat(object3d.userData.distance ? object3d.userData.distance : 1.0);
                let decay = parseFloat(object3d.userData.decay ? object3d.userData.decay : 1.0);
                let _PointLight = new THREE.PointLight(color, intensity, distance, decay);
                _PointLight.position.copy(object3d.position);
                this.add(_PointLight);
                this.remove(object3d);
            }
        }
    }
    /**
     * Processes GLTF loaded object.
     * 
     * @async
     * @memberof VLabScene
     * @return { Promise }
     */
    processGLTF(gltf) {
        this.name = gltf.scene.name;
        this.children = gltf.scene.children;
        let self = this;
        return new Promise(function(resolve, reject) {
            self.traverse((child) => {
                switch (child.type) {
                    case 'Mesh':
                        self.conformMesh(child);
                    break;
                    case 'Object3D':
                        self.conformObject3D(child);
                    break;
                }
            });
            resolve();
        });
    }
    /**
     * VLab Scene loader.
     * 
     * * Loads VLabScene nature from JSON file, specified in VLabScene constructor initObj
     * @async
     * @memberof VLabScene
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    load() {
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
                 * @property {Object} [nature.WebGLRendererParameters]                          - THREE.WebGLRenderer VLabScene specific parameters and presets
                 * @property {Object} [nature.WebGLRendererParameters.resolutionFactor]         - THREE.WebGLRenderer VLabScene specific resolution factor
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
                                    VLabSceneAssets.sceneLoaderContainer.style.display = 'none';
                                    VLabSceneAssets.sceneLoaderContainer.style.pointerEvents = 'none';
                                    self.processGLTF(gltf).then(() => {
                                        delete self.loadingManager;
                                        resolve(self);
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
     * Loads ZIP archived scene file.
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
            VLabSceneAssets.sceneAutoLoaderProgress.style.width = progress + '%';
            VLabSceneAssets.sceneAutoLoaderLabel.innerHTML = 'Autoloading ' + (this.nature.title || '' + ((this.initObj.initial) ? 'initial ' : 'next ') + 'scene') + ' ' + progress + '%';
        } else {
            VLabSceneAssets.loadingBar.set(parseInt(progress));
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
            return this.vLab.DOM.addStyle({
                id: this.initObj.class.name + 'CSS',
                href: this.nature.style
            });
        } else {
            let defaultSceneCSS = document.getElementById('sceneCSS');
            if (defaultSceneCSS) {
                return Promise.resolve();
            } else {
                return this.vLab.DOM.addStyle({
                    id: 'sceneCSS',
                    href: '../vlab.assets/css/scene.css'
                });
            }
        }
    }
    /**
     * Setup (if not yet exists) and show VLab Scene loader splash element.
     * 
     * @memberof VLabScene
     */
    showSceneLoader() {
        if (VLabSceneAssets.sceneLoaderContainer === null) {
            VLabSceneAssets.sceneLoaderContainer = document.createElement('div');
            VLabSceneAssets.sceneLoaderContainer.id = 'sceneLoaderContainer';
            this.vLab.DOM.container.insertAdjacentElement('afterbegin', VLabSceneAssets.sceneLoaderContainer);
            VLabSceneAssets.sceneLoader = document.createElement('div');
            VLabSceneAssets.sceneLoader.id = 'sceneLoader';
            VLabSceneAssets.sceneLoaderContainer.appendChild(VLabSceneAssets.sceneLoader);
            VLabSceneAssets.sceneLoaderHeader = document.createElement('div');
            VLabSceneAssets.sceneLoaderHeader.id = 'sceneLoaderHeader';
            VLabSceneAssets.sceneLoader.appendChild(VLabSceneAssets.sceneLoaderHeader);
            let sceneLoaderHeaderHR = document.createElement('div');
            sceneLoaderHeaderHR.id = 'sceneLoaderHeaderHR';
            VLabSceneAssets.sceneLoader.appendChild(sceneLoaderHeaderHR);
            VLabSceneAssets.sceneLoaderContent = document.createElement('div');
            VLabSceneAssets.sceneLoaderContent.id = 'sceneLoaderContent';
            VLabSceneAssets.sceneLoader.appendChild(VLabSceneAssets.sceneLoaderContent);
            VLabSceneAssets.sceneLoadingBarDIV = document.createElement('div');
            VLabSceneAssets.sceneLoadingBarDIV.id = 'sceneLoadingBarDIV';
            VLabSceneAssets.sceneLoadingBarDIV.setAttribute('class', 'ldBar label-center');
            VLabSceneAssets.sceneLoadingBarDIV.setAttribute('data-preset', 'circle');
            VLabSceneAssets.sceneLoadingBarDIV.setAttribute('data-stroke', '#c3d7e4');
            VLabSceneAssets.sceneLoader.appendChild(VLabSceneAssets.sceneLoadingBarDIV);
            VLabSceneAssets.loadingBar = new ldBar(VLabSceneAssets.sceneLoadingBarDIV);

            /* Autloader */
            VLabSceneAssets.sceneAutoLoader = document.createElement('div');
            VLabSceneAssets.sceneAutoLoader.id = 'sceneAutoLoader';
            VLabSceneAssets.sceneLoaderContainer.appendChild(VLabSceneAssets.sceneAutoLoader);            
            VLabSceneAssets.sceneAutoLoaderLabel = document.createElement('div');
            VLabSceneAssets.sceneAutoLoaderLabel.id = 'sceneAutoLoaderLabel';
            VLabSceneAssets.sceneAutoLoader.appendChild(VLabSceneAssets.sceneAutoLoaderLabel);
            VLabSceneAssets.sceneAutoLoaderProgress = document.createElement('div');
            VLabSceneAssets.sceneAutoLoaderProgress.id = 'sceneAutoLoaderProgress';
            VLabSceneAssets.sceneAutoLoader.appendChild(VLabSceneAssets.sceneAutoLoaderProgress);
        }

        VLabSceneAssets.sceneLoaderContainer.style.display = 'flex';

        if (this.initObj.autoload) {
            VLabSceneAssets.sceneAutoLoaderProgress.style.width = '0%';
            VLabSceneAssets.sceneAutoLoaderLabel.innerHTML = '';
            VLabSceneAssets.sceneLoader.style.display = 'none';
            VLabSceneAssets.sceneAutoLoader.style.display = 'inline';
            VLabSceneAssets.sceneLoaderContainer.style.pointerEvents = 'none';
        } else {
            VLabSceneAssets.sceneLoaderHeader.innerHTML = this.nature.title || 'Loading ' + ((this.initObj.initial) ? 'initial ' : 'next ') + 'scene';
            VLabSceneAssets.sceneLoaderContent.innerHTML = this.nature.description || '';
            VLabSceneAssets.loadingBar.set(0);
            VLabSceneAssets.sceneLoader.style.display = 'inline';
            VLabSceneAssets.sceneAutoLoader.style.display = 'none';
            VLabSceneAssets.sceneLoaderContainer.style.pointerEvents = 'auto';
        }
    }
}
export default VLabScene;