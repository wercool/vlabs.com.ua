import * as THREE from 'three';
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
        this.nature = {};
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
         * Default event subscription object
         * @inner
         */
        this.eventSubscrObj = this.initObj.eventSubscrObj !== undefined ? this.initObj.eventSubscrObj : {
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    mousedown:  this.onDefaultEventHandler,
                    mouseup:    this.onDefaultEventHandler,
                    mousemove:  this.onDefaultEventHandler,
                    touchstart: this.onDefaultEventHandler,
                    touchend:   this.onDefaultEventHandler,
                    touchmove:  this.onDefaultEventHandler,
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
            this.manager.load(true).then(() => {
                this.manager.configure().then(() => {
                    this.subscribe();
                    this.currentControls.enabled = true;
                    this.currentControls.update();
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
     * VLab Scene default event listener.
     *
     * @memberof VLabSceneManager
     * @abstract
     */
    onDefaultEventHandler(event) {
        // console.log(event);
        // Invoke existing VLabControls event handlers
        if (this.currentControls[event.type + 'Handler']) {
            this.currentControls[event.type + 'Handler'].call(this.currentControls, event);
        }
    }
}
export default VLabScene;