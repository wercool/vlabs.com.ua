import * as THREE from 'three';
import * as HTTPUtils from '../utils/http.utils';
import GLTFLoader from 'three-gltf-loader';
import { ZipLoader } from '../utils/zip.loader';
import * as THREEUtils from '../utils/three.utils';

/**
 * VLabItem base class.
 * @class
 * @classdesc VLabItem is a complex interactable.
 */
class VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        this.initObj = initObj;

        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;
        /**
         * VLabItem nature
         * @public
         * @property {Object} nature                    - VLabItem nature loaded from constructor initObj.natureURL
         */
        this.nature = undefined;
        /**
         * Name of VLabItem
         */
        this.name = this.initObj.name;
        /**
         * VLabItem Model (parent Object3D | Mesh)
         */
        this.vLabItemModel = undefined;
    }
    /**
     * Initialize VLab Item
     */
    initialize() {
        let self = this;
        return new Promise((resolve, reject) => {

            /**
             * THREE.LoadingManager instance
             * @inner
             */
            this.loadingManager = new THREE.LoadingManager();

            HTTPUtils.getJSONFromURL(this.initObj.natureURL)
            .then((nature) => {
                self.nature = nature;

                /**
                 * Setup CSS styles
                 */
                self.setupStyles().then(() => {

                    /**
                     * Prepare DOM elements
                     */
                    self.VLabPanelNotification = document.createElement('div');
                    self.VLabPanelNotification.className = 'vLabItemNotification';
                    self.VLabPanelNotification.style.backgroundImage = 'url("' + (self.nature.thumbnail ? self.nature.thumbnail : '') + '")';

                    self.VLabPanelNotificationLoader = document.createElement('div');
                    self.VLabPanelNotificationLoader.setAttribute('class', 'ldBar label-center vLabItemNotificationLoader');
                    self.VLabPanelNotificationLoader.setAttribute('data-preset', 'circle');
                    self.VLabPanelNotificationLoader.setAttribute('data-stroke', '#00ff00');
                    self.VLabPanelNotification.appendChild(self.VLabPanelNotificationLoader);

                    self.loadingBar = new ldBar(self.VLabPanelNotificationLoader);

                    self.vLab.DOMManager.vLabPanel.VLabPanelNotificationContainer.appendChild(self.VLabPanelNotification);

                    /**
                     * Load VLabItem model
                     */
                    self.load().then((vLabItemModel) => {
                        this.vLabItemModel = vLabItemModel;
                        this.vLab.DOMManager.vLabPanel.VLabPanelNotificationContainer.removeChild(this.VLabPanelNotification);

                        delete this['loadingBar'];
                        delete this['VLabPanelNotificationLoader'];
                        delete this['VLabPanelNotification'];
                        delete this['loadingManager'];

                        self.onInitialized();
                        resolve(this);
                    });
                });
            });


        });
    }
    /**
     * VLabItem onInitialized abstract function.
     *
     * @memberof VLabItem
     * @abstract
     */
    onInitialized() { console.log('%c' + this.name + ' onInitialized abstract method not implemented', 'color: orange'); }
    /**
     * VLabItem onLoaded abstract function.
     *
     * @memberof VLabItem
     * @abstract
     */
    onLoaded() { console.log('%c' + this.name + ' onLoaded abstract method not implemented', 'color: orange'); }
    /**
     * Setup sibling interactables from this.nature
     */
    setupSiblingIneractables() {
        return new Promise((resolve, reject) => {
            /** 
             * Configure VLabItem sibling interactables from VLabItem nature 
             */
            if (this.nature.interactables) {
                // console.log('VLabItem [' + this.name + '] interactables: ', this.nature.interactables);
                this.nature.interactables.forEach(async (interactableNatureObj) => {
                    let interactable = await this.vLab.SceneDispatcher.currentVLabScene.addInteractable(interactableNatureObj);
                    if (interactableNatureObj.siblings) {
                        interactableNatureObj.siblings.forEach(async (interactableSiblingName) => {
                            let interactableSiblingNatureObj = {};
                            interactableSiblingNatureObj['name'] = interactableSiblingName;
                            interactableSiblingNatureObj['intersectable'] = interactableNatureObj.intersectable;
                            interactableSiblingNatureObj['preselectable'] = interactableNatureObj.preselectable;
                            interactableSiblingNatureObj['selectable'] = interactableNatureObj.selectable;
                            let interactableSibling = await this.vLab.SceneDispatcher.currentVLabScene.addInteractable(interactableSiblingNatureObj);
                            interactable.siblings.push(interactableSibling);
                        });
                    }
                });
            }
            resolve();
        });
    }
    /**
     * Load 3D content from this.nature.modelURL
     * @memberof VLabItem
     */
    load() {
        let self = this;
        this.loadingManager.onProgress = this.loadingManagerProgress.bind(this);
        return new Promise((resolve, reject) => {
            this.loadZIP(this.nature.modelURL).then((gltfFile) => {
                let loader = new GLTFLoader(self.loadingManager);
                loader.load(
                    gltfFile,
                    function onLoad(gltf) {
                        self.processGLTF(gltf)
                        .then((vLabItemModel) => {
                            resolve(vLabItemModel);
                        });
                    },
                    function onProgress(xhr) {
                        let progress = parseInt(xhr.loaded / xhr.total * 100);
                        console.log(progress + '% loaded of VLabItem [' + self.name + '] model ');
                        self.loadingBar.set(progress);
                    },
                    function onError(error) {
                        console.error('An error happened while loading VLabItem [' + self.name + '] glTF assets:', error);
                    }
                );
            });
        });
    }
    /**
     * Processes GLTF loaded object.
     * 
     * @async
     * @memberof VLabItem
     * @return { Promise }
     */
    processGLTF(gltf) {
        return new Promise(function(resolve, reject) {
            gltf.scene.traverse((child) => {
                if (child.material) {
                    let conformedMaterial = THREEUtils.conformMaterial(child.material);
                    if (conformedMaterial !== undefined) {
                        child.material = conformedMaterial;
                    }
                }
            });
            gltf.scene.children[0].parent = null;
            resolve(gltf.scene.children[0]);
        });
    }
    /**
     * Loads ZIP archived scene file (model) if file name ended with .zip, else return non-modified url.
     * 
     * @async
     * @memberof VLabItem
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
                            console.log(progress + '% loaded of zipped model VLabItem ' + self.name);
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
     * LoadingManager onProgress
     * Is used to show textures loading progress
     */
    loadingManagerProgress(item, loaded, total) {
        this.VLabPanelNotificationLoader.style.color = '#ffff00';
        let progress = parseInt(loaded / total * 100);
        this.loadingBar.set(progress);
        console.log('VLabItem [' + this.name + '] textures loaded by ' + progress + '%');
    }
    /**
     * Setup VLabItem HTML CSS styles accordingly to VLabItem nature.
     * 
     * * Loads style either from VLabItem nature link or default (/vlab.assets/css/vlab.item.css)
     * @async
     * @memberof VLabItem
     */
    setupStyles() {
        if (this.nature.style) {
            return this.vLab.DOMManager.addStyle({
                id: this.constructor.name + 'CSS',
                href: this.nature.style
            });
        } else {
            let defaultVLabItemCSS = document.getElementById('VLabItemCSS');
            if (defaultVLabItemCSS) {
                return Promise.resolve();
            } else {
                return this.vLab.DOMManager.addStyle({
                    id: 'VLabItemCSS',
                    href: '/vlab.assets/css/vlab.item.css'
                });
            }
        }
    }
}
export default VLabItem;