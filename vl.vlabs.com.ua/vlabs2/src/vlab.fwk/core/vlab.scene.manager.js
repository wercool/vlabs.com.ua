import * as THREE from 'three';
import VLab from './vlab';
import * as HTTPUtils from '../utils/http.utils';
import GLTFLoader from 'three-gltf-loader';
import { ZipLoader } from '../utils/ZipLoader';
import * as ObjUtils from '../utils/object.utils';

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
         * VLabScene instance
         * @inner
         */
        this.vLabScene = vLabScene;
        /**
         * VLab instance
         * @inner
         */
        this.vLab = this.vLabScene.vLab;
        /**
         * VLabSceneManager instance name
         * @inner
         */
        this.name = this.vLabScene.name + 'Manager';
        /**
         * VLabScene initially configured from {@link VLabScene#nature}
         * @inner
         */
        this.configured = false;
        /**
         * THREE.LoadingManager instance
         * @inner
         */
        this.loadingManager = new THREE.LoadingManager();
    }
    /**
     * VLab Scene loader.
     * 
     * * Loads {@link VLabScene#nature} from JSON file, specified in VLabScene constructor initObj
     * @async
     * @memberof VLabSceneManager
     * @param {boolean} activation                          - VLabScene load initiated from {@link vLabScene#activate}
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    load(activation) {
        if (this.vLabScene.loaded) return Promise.resolve(this);
        if (this.vLabScene.loading || activation) this.vLabScene.initObj.autoload = false;
        this.vLabScene.loading = true;
        console.log(this.vLabScene.name + ' load initiated');
        let self = this;
        let vLabScene = this.vLabScene;
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
                    /* Load (GL Transmission Format) from gltfURL */
                    if (vLabScene.nature.gltfURL) {
                        this.loadZIP(vLabScene.nature.gltfURL).then((gltfFile) => {
                            let loader = new GLTFLoader(self.loadingManager);
                            loader.load(
                                gltfFile,
                                function onLoad(gltf) {
                                    vLabScene.loading = false;
                                    vLabScene.loaded = true;
                                    self.vLab.DOMManager.handleSceneLoadComplete();
                                    self.processGLTF(gltf).then(() => {
                                        gltf = null;
                                        resolve();
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
     * Configures VLab Scene with {@link VLabScene#nature}.
     * @async
     * @memberof VLabSceneManager
     */
    configure() {
        return new Promise((resolve, reject) => {
            if (this.configured) resolve();
            /* Configure VLabScene currentCamera from VLabScene nature */
            if (this.vLabScene.nature.cameras) {
                if (this.vLabScene.nature.cameras.default) {
                    this.vLabScene.currentCamera.name = this.vLabScene.nature.cameras.default.name;
                    switch (this.vLabScene.nature.cameras.default.type) {
                        case 'PerspectiveCamera':
                            if (this.vLabScene.nature.cameras.default.fov)
                                this.vLabScene.currentCamera.fov = this.vLabScene.nature.cameras.default.fov;
                            if (this.vLabScene.nature.cameras.default.position 
                             && this.vLabScene.currentCamera.position.equals(new THREE.Vector3()))
                                this.vLabScene.currentCamera.position.copy(eval(this.vLabScene.nature.cameras.default.position));
                        break;
                    }
                }
            }
            /* Configure VLabScene currentControls from VLabScene nature */
            if (this.vLabScene.nature.controls) {
                if (this.vLabScene.nature.controls.default) {
                    switch (this.vLabScene.nature.controls.default.type) {
                        case 'orbit':
                            if (this.vLabScene.currentControls.constructor.name !== 'VLabOrbitControls') {
                                console.warn('Implement switch VLabScene default controls');
                            }
                            if (this.vLabScene.nature.controls.default.target) {
                                if (this.vLabScene.nature.controls.default.target.vector3) {
                                    this.vLabScene.currentControls.target = eval(this.vLabScene.nature.controls.default.target);
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

            this.configured = true;
            resolve();
        });
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
                    href: '../vlab.assets/css/scene.css'
                });
            }
        }
    }
}
export default VLabSceneManager;