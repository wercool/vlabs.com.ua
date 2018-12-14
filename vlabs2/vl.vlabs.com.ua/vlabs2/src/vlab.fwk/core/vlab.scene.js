import * as THREE from 'three';
import VLab from './vlab';
import VLabSceneManager from './vlab.scene.manager';
import VLabSceneInteractable from './vlab.scene.interactable';
import VLabOrbitControls from '../aux/scene/vlab.orbit.controls';

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
         * @public
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
         * @property {string} [nature.cameras.default.position]             - Scene default camera position; THREE.Vector3; evalutated
         * @property {Object} [nature.controls]                         - Scene controls object
         * @property {Object} [nature.controls.default]                 - Scene default controls configurer object
         * @property {string} [nature.controls.default.type]            - Scene default controls type [orbit {@link VLabOrbitControls}]
         * @property {Object} [nature.controls.default.target]          - Scene default controls target for [orbit {@link VLabOrbitControls}]
         * @property {string} [nature.controls.default.target.vector3]  - Scene default controls target position THREE.Vector3; evaluated
         * @property {string} [nature.controls.default.target.object]   - Scene default controls target position will be cloned from VLabScene.getObjectByName(object) position
         * @property {Array}  [nature.interactables]                    - Scene Interactable
         * 
         */
        this.nature = {};
        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;
        /**
         * Set name of VLabScene name to it's constructor name
         * @public
         */
        this.name = this.constructor.name;
        /**
         * VLabSceneManager instance for this VLab Scene
         * @public
         */
        this.manager = new VLabSceneManager(this);
        /**
         * VLabScene clock
         * @public
         */
        this.clock = new THREE.Clock();
        /**
         * Set to true while scene file is loading, default false
         * @public
         */
        this.loading = false;
        /**
         * Set to true when scene filed is loaded, default false
         * Sets to initObj.loaded if defined
         * @public
         */
        this.loaded = this.initObj.loaded !== undefined ? this.initObj.loaded : false;
        /**
         * Set to true when scene is active scene, default false
         * @public
         */
        this.active = false;
        /**
         * Default event subscription object; {@link VLabEventDispatcher#eventSubscribers}
         * @public
         */
        this.eventSubscrObj = this.initObj.eventSubscrObj !== undefined ? this.initObj.eventSubscrObj : {
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    mousedown:      this.onDefaultEventHandler,
                    mouseup:        this.onDefaultEventHandler,
                    mousemove:      this.onDefaultEventHandler,
                    mouseout:       this.onMouseOutEventHandler,
                    touchstart:     this.onDefaultEventHandler,
                    touchend:       this.onDefaultEventHandler,
                    touchmove:      this.onDefaultEventHandler,
                    framerequest:   this.onDefaultEventHandler,
                },
                window: {
                    resize:     this.manager.onWindowResize.bind(this.manager),
                }
            }
        };
        /**
         * This current Scene camera; default is THREE.PerspectiveCamera instance
         * configured later at {@link VLabSceneManager#configure}
         * @public
         */
        this.currentCamera = new THREE.PerspectiveCamera(50, this.vLab.WebGLRendererCanvas.clientWidth / this.vLab.WebGLRendererCanvas.clientHeight, 0.1, 100);
        this.add(this.currentCamera);
        /**
         * This current Scene controls; default is {@link VLabOrbitControls} instance
         * could be configured later at {@link VLabSceneManager#configure} from VLabScene nature
         * @public
         * @implements {VLabControls}
         */
        this.currentControls = new VLabOrbitControls(this);
        this.currentControls.target = new THREE.Vector3(0.0, this.currentCamera.position.y, 0.0);
        /**
         * VLabScene objects able to be interacted with
         * @public
         * @property {string}                sceneObjectName              - VLabScene interactable object name
         * @property {VLabSceneInteractable} vLabSceneInteractable        - Instance of VLabSceneInteractable tied to VLabScene object (inheritor of THREE.Object3D taken from VLabScene by sceneObjectName); indentified as interactables[sceneObjectName]
         */
        this.interactables = {};
        /**
         * Current WebGLRendererCanvas mouse / touch coordinates; set from {@link VLabEventDispatcher}
         * @public
         * @type {THREE.Vector2}
         */
        this.eventCoords = new THREE.Vector2();
        /**
         * 2D coordinates of the mouse / touch, in normalized device coordinates (NDC)---X and Y components should be between -1 and 1.; @see https://threejs.org/docs/index.html#api/en/core/Raycaster.setFromCamera
         * @public
         * @type {THREE.Vector2}
         */
        this.eventCoordsNormalized = new THREE.Vector2();
        /**
         * Checks intersections with this.interactables
         * @public
         * @type {THREE.Raycaster}
         */
        this.interactablesRaycaster = new THREE.Raycaster();
        /**
         * Conditional partial stack of this.interactables {@link VLabSceneInteractable} which have to be checked for intersection in this.interactablesRaycaster
         * @public
         * @type {Array}
         */
        this.intersectableInteractables = [];
        /**
         * Conditional partial stack of this.interactables {@link VLabSceneInteractable} which have been intersected with this.interactablesRaycaster
         * @public
         * @type {Array}
         */
        this.intersectedInteractables = [];
        /**
         * Conditional partial stack of this.interactables {@link VLabSceneInteractable} which have been pre-selected at {@link VLabSceneInteractable#preselect}
         * In normal flow (without force pre-selection) it will be always only 1 pre-selected VLabSceneInteractable in this array
         * @public
         * @type {Array}
         */
        this.preSelectedInteractables = [];
        /**
         * Conditional partial stack of this.interactables {@link VLabSceneInteractable} which have been selected
         * In normal flow (without force selection) it will be always only 1 selected VLabSceneInteractable in this array
         * @public
         * @type {Array}
         */
        this.selectedInteractables = [];
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
            this.manager.load(true).then((justLoaded) => {
                this.manager.configure().then(() => {
                    this.subscribe();
                    this.currentControls.enabled = true;
                    this.currentControls.update();
                    this.active = true;
                    this.manager.performance.performanceManagerInterval = setInterval(this.manager.performanceManager.bind(this.manager), 1000);
                    if (justLoaded) {
                        /**
                         * For internal use in {@link VLabSceneDispatcher#activateScene}
                         */
                        this['justLoaded'] = true;

                        /*<dev>*/
                            var axesHelper = new THREE.AxesHelper(10);
                            this.add(axesHelper);
                            console.info("10m AxesHelper");
                        /*</dev>*/
                    }
                    resolve(this);
                });
            });
        });
    }
    /**
     * VLab Scene deactivator.
     * 
     * @async
     * @memberof VLabScene
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver; [true - if was active and was deactivated; false - if already not active]
     */
    deactivate() {
        if (!this.active) return Promise.resolve(false);
        return new Promise((resolve, reject) => {
            this.unsubscribe();
            clearInterval(this.manager.performance.performanceManagerInterval);
            this.deselectInteractables();
            this.manager.processInteractablesSelections();
            this.currentControls.suppress();
            this.active = false;

            resolve(true);
        });
    }
    /**
     * VLab Scene onLoaded abstract function.
     *
     * @memberof VLabScene
     * @abstract
     */
    onLoaded() { console.log(this.name + ' onLoaded abstract method not implemented'); }
    /**
     * VLab Scene onActivated abstract function.
     *
     * @memberof VLabScene
     * @abstract
     */
    onActivated() { console.log('%c' + this.name + ' onActivated abstract method not implemented', 'color: orange'); }
    /**
     * VLab Scene onDeactivated abstract function.
     *
     * @memberof VLabScene
     * @abstract
     */
    onDeactivated() { console.log('%c' + this.name + ' onDeactivated abstract method not implemented', 'color: orange'); }
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
     * onMouseOutEventHandler
     */
    onMouseOutEventHandler(event) {
        this.currentControls.suppress();
    }
    /**
     * VLab Scene default event handler / router.
     *
     * @memberof VLabScene
     * @abstract
     */
    onDefaultEventHandler(event) {
        // console.log(event);
        this.dispatchCurrentControlsDefaultEventHandler(event);
        this.interactWithInteractables(event);
        this.dispatchInteractablesDefaulEventHandlers(event);
    }
    /**
     * VLab Scene currentControls event-driven invocation.
     * Dispatch existing VLabControls onDefaultEventHandler
     * @memberof VLabScene
     * @abstract
     */
    dispatchCurrentControlsDefaultEventHandler(event) {
        this.currentControls.onDefaultEventHandler(event);
    }
    /**
     * VLab Scene interactables event-driven invocation
     * VLab Scene interactables event-driven invocation, invokes existing interactables onDefaultEventHandler
     * @memberof VLabScene
     * @abstract
     */
    dispatchInteractablesDefaulEventHandlers(event) {
        for (let interactableName in this.interactables) {
            this.interactables[interactableName].onDefaultEventHandler.call(this.interactables[interactableName], event);
        }
    }
    /**
     * Add instance of VLabSceneInteractable into this.interactables
     * @param {Object}              interactableObj initObj of {@link VLabSceneInteractable}
     * @param {string}              interactableObj.name
     * @memberof VLabScene
     * @async
     */
    addInteractable(interactableObj) {
        return new Promise((resolve, reject) => {
            this.interactables[interactableObj.name] = new VLabSceneInteractable({
                vLabScene: this,
                interactable: interactableObj
            });
            this.interactables[interactableObj.name].initialize()
            .then((vLabSceneInteractable) => {
                resolve(vLabSceneInteractable);
            });
        });
    }
    /**
     * Appends existing VLabSceneInteractable instance (vLabSceneInteractable) to this.interactables
     * @param {VLabSceneInteractable} vLabSceneInteractable 
     */
    appendInteractable(vLabSceneInteractable) {
        this.interactables[vLabSceneInteractable.vLabSceneObject.name] = vLabSceneInteractable;
        this.interactables[vLabSceneInteractable.vLabSceneObject.name].vLabScene = this;
    }
    /**
     * VLab Scene interactables processing (interactions), reacts only on user actions
     * Peirce each of this.intersectableInteractables with this.interactablesRaycaster in {@link VLabScene#intersectInteractablesWithInteractablesRaycaster}; only first pierced Interactable taking into processing by default
     * Dispatch {@link VLabSceneInteractable#intersectedHandler} if exists and if Interactable has been pierced with this.interactablesRaycaster
     * @memberof VLabScene
     * @abstract
     */
    interactWithInteractables(event) {
        if(event.type !== 'framerequest') {
            this.intersectableInteractables = [];
            for (let interactableName in this.interactables) {
                if (this.interactables[interactableName].vLabSceneObject) {
                    if (this.interactables[interactableName].intersectable) {
                        this.intersectableInteractables.push(this.interactables[interactableName].vLabSceneObject);
                    }
                }
            }

            this.intersectInteractablesWithInteractablesRaycaster();

            let intersectedInteractable = undefined;
            if (this.intersectedInteractables.length > 0) {
                /**
                 * 
                 * @see {@link {https://threejs.org/docs/#api/en/core/Raycaster.intersectObjects}}
                 * intersetcion[0] object taken into account
                 * 
                 * 
                 */
                intersectedInteractable = this.intersectedInteractables[0];
                /**
                 * Dispatch intersectionHandler
                 */
                intersectedInteractable.intersectionHandler({
                    original: event,
                    intersection: this.intersectedInteractables[0]
                });
            } else {
                /**
                 * Deselect intersectedInteractables if no intersections in short period of interactions
                 */
                if(event.type == 'mousedown') {
                    if (this.clock.getDelta() < 0.3) this.deselectInteractables();
                }
                if (event.type == 'touchstart') {
                    if (this.clock.getDelta() < 0.5)  this.deselectInteractables();
                }
            }

            /**
             * Check if this.intersectedInteractables[0] is among this.selectedInteractables respondents
             * If so check if this.selectedInteractable(s) has this.intersectedInteractables[0] action function
             * Call this.selectedInteractable(s) respondent action function
             */
            if (event.type == 'mousedown' || event.type == 'touchstart') {
                if (this.intersectedInteractables[0]) {
                    this.selectedInteractables.forEach((selectedInteractable) => {
                        selectedInteractable.respondents.forEach((selectedInteractableRespondent) => {
                            if (selectedInteractableRespondent.interactable && selectedInteractableRespondent.callerInteractable) {
                                if (selectedInteractableRespondent.interactable == this.intersectedInteractables[0] 
                                    && selectedInteractableRespondent.callerInteractable == selectedInteractable
                                    && ((this.intersectedInteractables[0].preselectable && this.intersectedInteractables[0].preselected) || !this.intersectedInteractables[0].preselectable)
                                ) {
                                    this.intersectedInteractables[0].lastTouchRaycasterIntersection = this.intersectedInteractables[0].intersectionRaycaster;
                                    if (selectedInteractableRespondent.action) {
                                        selectedInteractableRespondent.action.call(selectedInteractableRespondent);
                                    }
                                }
                            }
                        });
                    });
                }
            }

            /**
             * Dispatch nointersectionHandler for all other VLabSceneInteractable except ( intersectedInteractable )
             */
            for (let interactableName in this.interactables) {
                if (this.interactables[interactableName] !== intersectedInteractable) {
                    this.interactables[interactableName].nointersectionHandler({
                        original: event
                    });
                }
            }
            this.manager.processInteractablesSelections();
        }
    }
    /**
     * Pierce intersectableInteractables with interactablesRaycaster
     * Fill this.intersectedInteractables with THREE.Scene objects that have been pierced by this.interactablesRaycaster casted from this.eventCoordsNormalized
     * @memberof VLabScene
     * @abstract
     */
    intersectInteractablesWithInteractablesRaycaster() {
        this.intersectedInteractables = [];
        if (this.intersectableInteractables.length > 0) {
            /**
             * VLabOrbitControls
             */
            if (this.currentControls.constructor == VLabOrbitControls) {
                this.eventCoordsNormalized.set((this.eventCoords.x / this.vLab.WebGLRendererCanvas.clientWidth) * 2 - 1, 1 - (this.eventCoords.y / this.vLab.WebGLRendererCanvas.clientHeight) * 2);
            }
            this.interactablesRaycaster.setFromCamera(this.eventCoordsNormalized, this.currentCamera);
            let intersectedInteractablesIntersections = this.interactablesRaycaster.intersectObjects(this.intersectableInteractables);

            intersectedInteractablesIntersections.forEach((intersectedInteractablesIntersection) => {
                let intersectedInteractable = this.interactables[intersectedInteractablesIntersection.object.name];
                /**
                * By default only first Mesh intersections taken
                */
                if (this.intersectedInteractables.indexOf(intersectedInteractable) == -1) {
                    intersectedInteractable.intersectionRaycaster = intersectedInteractablesIntersection;
                    if (intersectedInteractable) this.intersectedInteractables.push(intersectedInteractable);
                }
            });
        }
    }
    /**
     * Deselects all of this.interactables
     */
    deselectInteractables() {
        for (let interactableName in this.interactables) {
            this.interactables[interactableName].deSelect(true);
        }
    }
    /**
     * De preselect Interactables all of this.interactables
     */
    dePreselectInteractables() {
        for (let interactableName in this.interactables) {
            this.interactables[interactableName].dePreselect();
        }
    }
}
export default VLabScene;